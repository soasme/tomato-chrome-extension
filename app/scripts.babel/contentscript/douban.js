'use strict';

window.show_tomato_dialog = function(div, w) {
    if($('#dialog').length) return;
    $('body').prepend('<div id="overlay"></div><div id="dialog" style="width:' + (w || 550) + 'px;"></div>');
    if(div != null){
        $('#dialog').html(div);
    }else{
        $('#dialog').html("<div class='loadpop'>正在载入，请稍候...</div>");
    }
    set_tomato_overlay();
}

window.set_tomato_overlay = function(){
    var dialog = $('#dialog'),
        h = dialog[0].offsetHeight + 16,
        w = dialog[0].offsetWidth + 16;

    $('#overlay').css({
       height: h,
       width: w,
       marginLeft: -(w/2) + 'px',
       marginTop: -(h/2) + 'px',
       top: '50%',
       left: '50%'
    });
    dialog.css({
      left: '50%',
      top: '50%',
      marginTop: -(dialog.outerHeight()/2) + 'px',
      marginLeft: -(dialog.outerWidth()/2) + 'px'
    });
}

window.close_tomato_dialog = function() {
    $('#overlay').unbind('click');
    $('#dialog,#overlay,.bgi').remove();
    if (typeof document.body.style.maxHeight == "undefined") {//if IE6
        $('body','html').css({height: 'auto', width: 'auto'});
        $('html').css('overflow', '');
    }
    document.onkeydown = '';
    return false;
}

var source = `
<style>
  #resource-list-wrapper {
    margin-top: 10px
  }

  #resource-list-wrapper .resource-list .resource-item {
    border-bottom: 1px dashed #ddd;
    margin-bottom: 10px
  }

  #resource-list-wrapper .resource-list .resource-item .blank-tip {
    margin-bottom: 10px
  }

  #resource-list-wrapper .resource-list .resource-item .avatar {
    width: 48px;
    float: left;
    margin-right: 12px
  }

  #resource-list-wrapper .resource-list .resource-item h3 {
    font-size: 13px;
    background-color: #fff;
    margin: 0;
    padding: 0
  }

  #resource-list-wrapper .resource-list .resource-item h3 span {
    margin-bottom: 12px
  }

  #resource-list-wrapper .resource-list .resource-item h3 .resource-vote {
    float: right
  }

  #resource-list-wrapper .resource-list .resource-item h3 .user-stars {
    margin-bottom: 0
  }

  #resource-list-wrapper .resource-list .resource-item .resource-content {
    overflow: hidden
  }

  #resource-list-wrapper .resource-list.noshow {
    display: none
  }

  #resource-list-wrapper .resource-list.show {
    display: block
  }
</style>
<div class="mod-hd">
  <a class="redbutt j add-resource-btn rr">
    <span>我来贴链接</span>
  </a>
  <h2>
    <span>番茄</span>· · · · · ·
    <span class="pl">
      (<a href="{{resourcesUrl}}">查看全部</a>)
    </span>
  </h2>
</div>
<div class="nav-tab">
  <div class="tabs-wrapper  line">
    <a class="short-resource-tabs on-tab" href="javascript:;" data-tab="hot">热门</a>
    <span>/</span>
    <a class="short-resource-tabs " href="javascript:;" data-tab="latest">最新</a>
    <span>/</span>
    {{#if user}}
    <a class="short-resource-tabs " href="javascript:;" data-tab="user">@{{ user.username }}</a>
    |
    <a href="javascript:;" class="revoke">退出</a>
    {{else}}
    <a href="javascript:;" class="login">登录</a>
    {{/if}}
  </div>
</div>

<div class="indent" id="resource-list-wrapper">
  {{#each types}}
    <div class="resource-list {{type}} noshow {{#if isShown}}show{{/if}}">
      <ul>{{#each resources}}
        <li class="resource-item">
          <h3>
            <span class="resource-vote">
              <span class="vote-count">{{votes_count}}</span>
              {{#if has_voted}}
                <span>已投票</span>
              {{else}}
                <a href="javascript:;" class="j vote-resource" data-resource-id="{{id}}">有用</a>
              {{/if}}
            </span>
            <span class="resource-info">
              <a href="{{user.url}}">{{user.username}}</a>
              <span>{{created_at}}</span>
            </span>
          </h3>
          <p class="resource-content">
            <a href="{{url}}">{{title}}</a>
            <span>{{description}}</span>
          </p>
        </li>
      {{/each}}</ul>
    </div>
  {{/each}}
</div>
`
var template = Handlebars.compile(source)
var isbnMatch = $(".subject #info").html().match(/(97[89]\d{9}[\dXx])/)
var isbn = isbnMatch[1]
var G_subject
var G_max_retries = 5

var authUI = (user, subject) =>  {
  $.when(
    getResources(subject, 'latest', 5),
    getResources(subject, 'hot', 5),
    getResources(subject, 'user', 5, user)
  ).then(function(
    latestResources,
    hotResources,
    userResources
  ) {
    // build template data
    var data = {
      user: user,
      types: [
        {
          type: 'hot',
          isShown: true,
          resources: hotResources
        }, {
          type: 'latest',
          isShown: false,
          resources: latestResources
        }, {
          type: 'user',
          isShown: false,
          resources: userResources
        }
      ],
      resourcesUrl: `https://tomato.today/isbn/${ isbn }/`
    }

    // render template
    var $el = $(template(data))
    $el.insertAfter($("#db-tags-section"))

    // init account
    $(".revoke").on('click', function(e) {
      revoke().then((success) => {
        window.location.reload()
      }, (message) => {
        alert('番茄退出失败')
      })
    })

    // init tab
    $(".short-resource-tabs").on('click', function(e) {
      var type = $(e.target).data('tab')
      $(".short-resource-tabs").removeClass('on-tab')
      $(e.target).addClass('on-tab')
      $(".resource-list ").removeClass('show')
      $(`.resource-list.${ type }`).addClass('show')
    })

    // init vote
    $(".vote-resource").on('click', function(e) {
      var $this = $(e.target)
      var resourceID = $this.data('resource-id')
      voteResource(resourceID).done(function() {
        $this.parent().append($("<span>已投票</span>"))
        $this.remove()
      }).fail(function(reason) {
        if (reason == 'requestFailed') {
          alert('投票失败，可能网络不太好')
        } else {
          alert(`投票失败: ${ reason }`)
        }
      })
    })

    // init add button
    $(".add-resource-btn").on('click', function(e) {
      // init modal
      show_tomato_dialog(`
        <div>
          <div class="indentpop1 clearfix">
            <form class="j book-sns tomato-resource-form">
              <div class="resource-form-hd interest-form-hd">
                <span class="gact rr"><a href="javascript:;" onclick="close_dialog()">x</a></span>
                <h2>添加番茄资源</h2>
              </div>
              <ul class="interest_form resource_form" id="advtags">
              <li>标题</li>
              <li> <input name="title" type="text" class="inp-tags"> </li>
              <li>链接</li>
              <li> <input name="url" type="url" class="inp-tags"> </li>
              <li>文字</li>
              <li>
                <textarea name="description" class="comment" id="description" maxlength="350"></textarea>
              </li>
              </ul>
              <div id="tomato-submits">
                <input type="submit" value="保存" name="save">
              </div>
            </form>
          </div>
        </div>
      `)
      $('.tomato-resource-form').on('submit', function(e){
        e.preventDefault()
        var title = $('.tomato-resource-form input[name=title]').val()
        var url = $('.tomato-resource-form input[name=url]').val()
        var description = $('.tomato-resource-form input[name=description]').val()
        if (title === '') {
          alert('请填写标题')
          return false
        }
        if (url === '' && description === '') {
          alert('请填写链接或文字')
          return false
        }
        var $save = $('.tomato-resource-form input[name=save]')
        $save.val('保存中...')
        $save.attr('disabled', 'disabled')
        addResource(isbn, title, url, description).then(
          window.location.reload,
          function(message){ alert(message) }
        )
      })

    })
  })
}

  // for anonymous user.
var anonUI = (message) => {
  var data = {
    user: null,
    types: [
      {
        type: 'hot',
        isShown: true,
        resources: []
      }, {
        type: 'latest',
        isShown: false,
        resources: []
      }, {
        type: 'user',
        isShown: false,
        resources: []
      }
    ],
    resourcesUrl: `https://tomato.today/isbn/${ isbn }/resources`
  }
  var $el = $(template(data))
  $el.insertAfter($("#db-tags-section"))
  $(".tomato-loading").remove()

  $(".login").on('click', function(e) {
    requireLogin().then((token) => {
      window.location.reload()
    }, (message) => {
      alert('番茄登录失败')
    })
  })
}

var preparingUI = (isbn) => {
  var src = `
  <div class="mod-hd tomato-loading">
    <h2>
      <span>番茄正在初始化</span>
      · · · · · ·
    </h2>
  </div>
  `
  var tpl = Handlebars.compile(src)
  var $el = $(tpl({}))
  $el.insertAfter($("#db-tags-section"))

  var timer
  var check = () => {
    if (G_subject) {
      clearInterval(timer)
      $(".tomato-loading h2 span").remove()
    } else if (G_max_retries < 0) {
      clearInterval(timer)
      $(".tomato-loading h2 span").html('番茄初始化失败')
    } else {
      getSubjectByISBN(isbn).then((subject) => {
        G_subject = subject
        render(false)
      })
      G_max_retries = G_max_retries - 1
    }
  }
  timer = setInterval(check, 3000)
}

var  render
render = (needWait) => {
  getUserInfo().then(
    (user) => {
      getSubjectByISBN(isbn).then(
        (subject) => {
          G_subject = subject
          authUI(user, subject)
        },
        () => {
          if (needWait) {
            preparingUI(isbn)
          }
        }
      )
    },
    anonUI
  )
}

render(true)
