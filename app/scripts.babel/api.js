'use strict'

var ENV = {
  // fixture: true,
  fixture: false,

  // remote: 'https://tomato.today',
  remote: 'http://127.0.0.1:8000',

  // needAuthorization: false,
  needAuthorization: true,
}

function getSubjectByISBN(isbn) {
  var dfd = $.Deferred()
  sendMessage({
    action: "getSubjectIdByISBN",
    payload: {isbn: isbn}
  }, function(response) {
    if (response.existed) {
      dfd.resolve(response.subject)
    } else {
      dfd.reject(response.message)
    }
  })
  return dfd.promise()
}

function getResourcesByISBN(isbn, type, limit, user) {
  var dfd = jQuery.Deferred();

  var action = 'fetchUserResources';
  if (type === 'user') {
    action = 'fetchUserResources'
  } else if (type === 'hot') {
    action = 'fetchHotResources'
  } else if (type === 'latest') {
    action = 'fetchLatestResources'
  }

  getSubjectByISBN(isbn).then(function(subject) {
    sendMessage({
      action: action,
      payload: {subjectId: subject.id, user: user}
    }, function(response) {
      if (response.fetched) {
        dfd.resolve(response.resources)
      } else {
        dfd.resolve([])
      }
    })
  })

  return dfd.promise();
}

function getUserInfo() {
  var dfd = jQuery.Deferred()
  chrome.runtime.sendMessage({
    action: "getUserInfo"
  }, (response) => {
    if (response.fetched) {
      dfd.resolve(response.user)
    } else {
      dfd.reject(response.message)
    }
  })
  return dfd.promise()
}

function revoke() {
  var dfd = jQuery.Deferred()
  chrome.runtime.sendMessage({
    action: 'revoke'
  }, function(response) {
    if (response.message === 'OK') {
      dfd.resolve(true)
    } else {
      dfd.reject(resposne.message)
    }
  })
  return dfd.promise()
}

function requireLogin() {
  var dfd = jQuery.Deferred()
  chrome.runtime.sendMessage({
    action: 'login'
  }, function(response) {
    if (response.token) {
      dfd.resolve(response.token)
    } else {
      dfd.reject(response.message)
    }
  })
  return dfd.promise()
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

function addResource(isbn, title, url, description) {
  var dfd = jQuery.Deferred()
  if (ENV.fixture) {
    dfd.resolve(true)
  } else {
    getSubjectByISBN(isbn).then((subject) => {
      sendMessage({
        action: 'addResource',
        payload: {
          title: title,
          url: url,
          description: description,
          subjectId: subject.id
        }
      }, (response) => {
        if (response.created) {
          dfd.resolve(true)
        } else {
          dfd.reject(response.message)
        }
      })
    })
  }
  return dfd.promise()
}
