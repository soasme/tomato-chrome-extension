'use strict';

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
  <a class="redbutt j a_collect_btn rr" href="javascript:;" >
    <span>我来贴链接</span>
  </a>
  <h2>
    <span>番茄</span>· · · · · ·
    <span class="pl">
      (<a href="{{resources_url}}">全部 {{resources_count}} 条</a>)
    </span>
  </h2>
</div>
<div class="nav-tab">
  <div class="tabs-wrapper  line">
    <a class="short-resource-tabs on-tab" href="hot" data-tab="hot">热门</a>
    <span>/</span>
    <a class="short-resource-tabs " href="new" data-tab="new">最新</a>
    <span>/</span>
    <a class="short-resource-tabs " href="follows" data-tab="follows">自己的</a>
  </div>
</div>
<div class="indent" id="resource-list-wrapper">
  <div class="resource-list hot noshow show">
    <ul>{{#each hot_resources}}
      <li class="resource-item">
        <h3>
          <span class="resource-vote">
            <span class="vote-count">{{votes_count}}</span>
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
</div>
`
var template = Handlebars.compile(source)
var data = {
  hot_resources: getResourcesByISBN('whatever'),
  resources_count: 100,
  resources_url: 'https://tomato.today/subjects/1/resources' + '?icn=crx',
}
var $el = $(template(data))
$el.insertAfter($("#db-tags-section"))
