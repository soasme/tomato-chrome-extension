'use strict'

var ENV = {
  // fixture: true,
  fixture: false,

  // remote: 'https://tomato.today',
  remote: 'http://127.0.0.1:8000',

  // needAuthorization: false,
  needAuthorization: true,
}

function getSubjectIdByISBN(isbn) {
  var dfd = $.Deferred()
  var tomatoMaps = window.sessionStorage.getItem('tomato-maps')
  if (!tomatoMaps || tomatoMaps === undefined) {
    window.sessionStorage.setItem('tomato-maps', JSON.stringify({}))
  } else {
    tomatoMaps = JSON.parse(tomatoMaps)
  }
  sendMessage({
    action: "getSubjectIdByISBN",
    payload: {isbn: isbn}
  }, function(response) {
    if (response.existed) {
      tomatoMaps[isbn] = response.id
      window.sessionStorage.setItem('tomato-maps', JSON.stringify(tomatoMaps))
      dfd.resolve(response.id)
    } else {
      dfd.reject(response.message)
    }
  })
  return dfd.promise()
}

function getResourcesByISBN(isbn, filter, limit) {
  var dfd = jQuery.Deferred();
  if (filter === 'user' || filter === 'hot' || filter === 'latest') {
    getSubjectIdByISBN(isbn).then(function(id) {
      sendMessage({
        action: 'fetchUserResources',
        payload: {isbn: isbn}
      }, function(response) {
        if (response.fetched) {
          dfd.resolve(response.resources)
        } else {
          dfd.resolve([])
        }
      })
    })
  } else {
    dfd.reject('unknownFilter')
  }
  return dfd.promise();
}

function voteResource(resourceId) {
  var dfd = jQuery.Deferred()
  chrome.runtime.sendMessage({
    action: 'voteResource',
    payload: {
      resourceId: resourceId
    }
  }, function(response) {
    if (response.voted) {
      dfd.resolve(true)
    } else {
      dfd.reject(response.message)
    }
  })
  return dfd.promise()
}

function addResource(title, url, description) {
  var dfd = jQuery.Deferred()
  if (ENV.fixture) {
    dfd.resolve(true)
  } else {
    sendMessage({
      type: 'addResource',
      payload: {
        title: title,
        url: url,
        description: description
      }
    }, function(response) {
      if (response.created) {
        dfd.resolve(true)
      } else {
        dfd.reject(response.message)
      }
    })
  }
  return dfd.promise()
}

