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

  .dialog-overlay, .dialog-box, .dialog-shadow {margin:0; padding:0; position:fixed; _position:absolute;}
  .dialog-overlay {left:0; top:0; width:100%; height:100%; min-height:100px; background:#FFF;}
  .dialog-shadow {background:#333; border-radius:6px; overflow:hidden;}
  .dialog-box {background:#FFF; border:1px solid #BBB; font-size:14px; font-style:normal; font-weight:normal; text-align:left;}
  .dialog-box .dialog-header {padding-left:10px; padding-right:10px; font:14px/150% Arial,Helvetica,sans-serif; -moz-user-select:none; -webkit-user-select:none; -ms-user-select:none;}
  .dialog-box .dialog-header, .dialog-box .dialog-footer {background:#EBF5EA;}
  .dialog-box .dialog-header {color:#006600; line-height:1.2; padding-top:12px; padding-bottom:12px;}
  .dialog-box .dialog-header .dialog-close, .dialog-box .dialog-header .dialog-close:visited {outline:none; cursor:pointer; display:block; margin-right:-4px; _margin-right:-2px; margin-top:-2px; padding:1px 4px; text-decoration:none; color:#CCC; float:right; font-family:Georgia,Times,"Times New Roman",serif; font-size:14px;}
  .dialog-box .dialog-header .dialog-close:hover, .dialog-box .dialog-header .dialog-close:active {background:#FFF6ED; color:#F00; border-radius:5px;}
  .dialog-box .dialog-content {font-size:12px; background:#FFF; color:#111; float:left;}
  .dialog-box .dialog-content .dialog-content-box, .dialog-box .dialog-content .dialog-tips {padding: 10px 10px 25px;}
  .dialog-box .dialog-content .dialog-content-tips {text-align:center; vertical-align:middle;}
  .dialog-box .dialog-content, .dialog-box .dialog-content p {word-wrap:break-word; word-break:break-all;}
  .dialog-confirm .dialog-content {background-color:#FFC;}
  .dialog-error .dialog-header, .dialog-error .dialog-content {color:#C00;}
  .dialog-box .dialog-button {float:right; margin-left:5px; display:-moz-inline-box; display:inline-block; border-width:1px; _border:0; border-style:solid; border-color:#bbb #bbb #999; *display:inline; *zoom:1; color:#444; -moz-border-radius:3px; -webkit-border-radius:3px; border-radius:3px; overflow:hidden; vertical-align:middle;}
  .dialog-box .dialog-button:hover {border-color:#999 #999 #666; color:#333; }
  .dialog-box .dialog-button input {float:left; text-align:center; border:none; height:25px; margin:0 !important; padding:0 14px; color:#333; background:transparent url(images/dialog-button.png) repeat-x 0 0\9; font-size:12px; *padding:3px 8px 0; cursor:pointer; -webkit-appearance:none; -moz-border-radius:2px; -webkit-border-radius:2px; border-radius:2px; background-image:-moz-linear-gradient(-90deg, #fcfcfc 0, #e9e9e9 100%); background-image:-webkit-gradient(linear,left top,left bottom, color-stop(0, #fcfcfc), color-stop(1, #e9e9e9));}
  .dialog-box .dialog-button input {_border-width:1px; _border-style:solid; _border-color:#bbb #bbb #999;}
  .dialog-box .dialog-button input:hover,
  .dialog-box .dialog-button-over input{color:#333 !important; background-color:transparent !important; background-position:1px -6px\9; background-image:-moz-linear-gradient(-90deg, #f8f8f8 0, #ddd 100%); background-image:-webkit-gradient(linear,left top,left bottom, color-stop(0, #f8f8f8), color-stop(1, #ddd));}
  .dialog-box .dialog-button-over input{_border-color:#999 #999 #666; _color:#333;}
  .dialog-box .dialog-button input:active,
  .dialog-box .dialog-button-active input{background:#ddd !important; color:#333 !important; border-color:#999 #999 #666 !important;}
  @media all and (-webkit-min-device-pixel-ratio:10000),not all and (-webkit-min-device-pixel-ratio:0){
      .dialog-box .dialog-button input { background:transparent url(images/dialog-button.png) repeat-x 0 0;}
      .dialog-box .dialog-button input:hover, .dialog-box .dialog-button-over input {background-position:1px 6px;}
  }
  .dialog-box .dialog-footer {border-top:1px solid #D9E2E9; padding-top:10px; padding-bottom:10px; width:100%; overflow:hidden;}
  .dialog-box .dialog-footer .dialog-buttons {margin-right:10px;}
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
    <a class="short-resource-tabs " href="javascript:;" data-tab="user">自己的</a>
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
              {{#if isVoted}}<span>已投票</span>{{/if}}
              <a href="javascript:;" class="j vote-resource" data-resource-id="{{id}}">有用</a>
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



$.when(
  getResourcesByISBN(isbn, 'latest', 5),
  getResourcesByISBN(isbn, 'hot', 5),
  getResourcesByISBN(isbn, 'user', 5)
).done(function(
  latestResources,
  hotResources,
  userResources
) {
  // build template data
  var data = {
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
    resourcesUrl: `https://tomato.today/isbn/${ isbn }/resources`,
    addResourceUrl: `https://tomato.today/isbn/${ isbn }/resources`,
  }

  // render template
  var $el = $(template(data))
  $el.insertAfter($("#db-tags-section"))

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
    voteResource(resourceID).done(function(voted) {
      if (voted) {
        $this.parent().append($("<span>已投票</span>"))
        $this.remove()
      }
    })
  })

  // init add button
  $(".add-resource-btn").on('click', function(e) {
    // init modal
    show_tomato_dialog(null)
    var title = 'title'
    var url = 'https://tomato.today'
    var text = 'text'
    addResource(title, url, text).done(function(isSuccess) {
      alert('success')
    })

  })
})
