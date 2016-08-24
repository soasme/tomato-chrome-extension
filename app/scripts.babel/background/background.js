var ENV = {
  // remote: null,
  // client_id: '',

  remote: 'http://127.0.0.1:8000',
  client_id: 'juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI',

  //remote: 'https://tomato.today',
  //client_id: '5jyAB2ZXGcHX8P9l9rllayl3FHp7PnCDjRhDYaJv',
}

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

function getAuthToken(config) {
  var dfd = jQuery.Deferred()
  var config = config || {}
  var required = config.required || false
  var token = chrome.storage.local.get(null, function(storage) {
    console.log('tomato', 'storage', storage)
    if (!ENV.remote) {
      dfd.resolve('THIS_IS_MOCK_TOKEN')
    } else if (storage.token) {
      console.debug('tomato', 'using token in storage', storage.token)
      dfd.resolve(storage.token || null)
    } else if (required){
      var url = `${ ENV.remote }/oauth2/authorize/?client_id=${ ENV.client_id }&response_type=token&scope=resource&redirect_uri=` + encodeURI(chrome.identity.getRedirectURL("provider_cb"));
      console.debug('tomato', 'lauching web auth flow', url)
      chrome.identity.launchWebAuthFlow({
        'interactive': true,
        'url':  url
      }, function(url) {
        // Use the token.
        console.debug('tomato', 'parsing token', url)
        var match = url.match(/access_token=([^&]*)/)
        if (match) {
          token = match[1]
          console.debug('tomato', 'web auth flow token got', token)
          chrome.storage.local.set({token: token}, function() {
            console.debug('tomato', 'save token', token)
            dfd.resolve(token)
          })
        } else {
          dfd.reject(url)
        }
      });
    } else {
      dfd.resolve(null)
    }
  })
  return dfd.promise()
}

function revoke(token) {
  var dfd = $.Deferred()
  if (!ENV.remote) {
    dfd.resolve(true)
  } else {
    $.ajax({
      method: "POST",
      url: `${ ENV.remote }/oauth2/revoke_token/`,
      data: {
        token: token,
        client_id: ENV.client_id,
      }
    }).then((data, status, xhr) => {
      if (xhr.status === 200) {
        chrome.storage.local.remove(['token'], function(storage) {
          dfd.resolve(true)
        })
      } else {
        dfd.resolve(data)
      }
    }, (xhr) => {
      dfd.reject('requestFailed')
    })
  }
}

function getUserInfo(token) {
  var dfd = $.Deferred()
  if (!ENV.remote) {
    dfd.resolve({'username': 'testuser', 'email': 'testuser@example.org'})
  } else {
    $.ajax({
      method: 'GET',
      url: `${ ENV.remote }/api/1/user/`,
      dataType: 'json',
      headers: {
        'Authorization': `Bearer ${ token }`
      }
    }).then((data, status, xhr) => {
      if (xhr.status === 200) {
        dfd.resolve(data)
      } else {
        dfd.reject(data.detail)
      }
    }, (xhr) => {
      dfd.reject('requestFailed')
    })
  }
  return dfd.promise()
}

function getSubjectIdByISBN(token, isbn) {
  var dfd = $.Deferred()
  if (!ENV.remote) {
    dfd.resolve({id: 1})
  } else {
    return $.ajax({
      method: 'GET',
      url: `${ ENV.remote }/api/1/isbn/${ isbn }/?vendor=douban`,
      dataType: 'json',
      headers: {
        'Authorization': `Bearer ${ token }`
      }
    }).done(function(data, status, xhr) {
      if (xhr.status === 200) {
        dfd.resolve(data)
      } else {
        dfd.reject(data.detail)
      }
    }).fail(function(xhr) {
      dfd.reject('requestFailed')
    })
  }
  return dfd.promise()
}

function addResource(token, subjectId, title, url, description) {
  var dfd = $.Deferred()
  $.ajax({
    method: 'POST',
    url: `${ ENV.remote }/api/1/resources/`,
    dataType: 'json',
    data: JSON.stringify({
      subject_id: subjectId,
      title: title,
      url: url,
      description: description
    }),
    headers: {
      'Authorization': `Bearer ${ token }`,
      'Content-Type':'application/json'
    }
  }).done(function(data, status, xhr) {
    if (xhr.status === 201) {
      dfd.resolve(data.id)
    } else {
      dfd.reject(data.detail)
    }
  }).fail(function(xhr) {
    dfd.reject('requestFailed')
  })
  return dfd.promise()
}

function voteResource(token, resourceId) {
  var dfd = $.Deferred()
  if (!ENV.remote) {
    dfd.resolve(true)
    // dfd.reject('UncommentToTestVoteFailed')
  } else {
    $.ajax({
      method: 'PUT',
      url: `${ ENV.remote }/api/1/resources/${ resourceId }/vote/`,
      dataType: 'json',
      headers: {
        'Authorization': `Bearer ${ token }`,
        'Content-Type':'application/json'
      }
    }).done(function(data, status, xhr) {
      if (xhr.status == 204) {
        dfd.resolve(true)
      } else {
        dfd.reject(data.message)
      }
    }).fail(function(xhr) {
      dfd.reject('requestFailed')
    })
  }

  return dfd.promise()
}

function fetchResources(token, subjectId, filter, sort, user) {
  var dfd = $.Deferred()
  if (!ENV.remote) {
    dfd.resolve([
      {
        'id': 1,
        'title': 'This is mocking data.',
        'url': 'https://tomato.today',
        'description': '老年人之间的小春日和，长情相伴，春种秋收。',
        'created_at': '2016-07-06',
        "votes_count": 10,
        'user': {
          'username': 'soasme',
          'url': 'https://tomato.today/users/1/',
        }
      }
    ])
  } else {
    var filter = filter === undefined ? '' : filter
    var sort = sort === undefined ? 'created_at' : sort
    var visibility = user === undefined ? 'public' : 'all'
    var user = user === undefined ? '' : user.username
    var url = `${ ENV.remote }/api/1/resources/?limit=5&subject_id=${ subjectId }&ordering=${ sort }&owner=${ user }&visibility=${ visibility }`
    return $.ajax({
      method: 'GET',
      url: url,
      dataType: 'json',
      headers: {
        'Authorization': `Bearer ${ token }`
      }
    }).done(function(data, status, xhr) {
      if (xhr.status === 200) {
        dfd.resolve(data)
      } else {
        dfd.reject(data.message)
      }
    }).fail(function(xhr) {
      dfd.reject('requestFailed')
    })
  }
  return dfd.promise()
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

  console.debug("receive", request)

  switch(request.action){
    case "login":
      getAuthToken({required: true}).then(
        (token) => { sendResponse({ message: "OK", loggedIn: true, token: token}) },
        (message) => { sendResponse({ message: message, loggedIn: false}) }
      )
      return true
    case "getUserInfo":
      $.when(
        getAuthToken({required: false})
      ).then(
        getUserInfo,
        (message) => { sendResponse({ message: message, fetched: false })}
      ).then(
        (user) => { sendResponse({ message: "OK", fetched: true, user: user})},
        (message) => { sendResponse({ message: message, fetched: false })}
      )
      return true
    case "getSubjectIdByISBN":
      $.when(
        getAuthToken({required: true})
      ).then(
        (token) => { return getSubjectIdByISBN(token, request.payload.isbn) },
        (message) => { sendResponse({message: message, existed: false})}
      ).then(
        (subject) => { sendResponse({message: 'OK', existed: true, subject: subject}) },
        (message) => { sendResponse({message: message, existed: false}) }
      )
      return true

    case "addResource":
      $.when(getAuthToken()).then(function(token) {
        return addResource(token,
                           request.payload.subjectId,
                           request.payload.title,
                           request.payload.url,
                           request.payload.description)
      }).then(
        (id) => { sendResponse({message: 'OK', created: true, id: id}) },
        (message) => { sendResponse({message: message, created: false}) }
      )
      return true

    case "voteResource":
      $.when(
        getAuthToken({required: true})
      ).then((token) => {
        return voteResource(token, request.payload.resourceId)
      }).done(() => {
        sendResponse({message: 'OK', voted: true})
      }).fail((message) => {
        sendResponse({message: message, voted: false})
      })
      return true

    case "fetchUserResources":
      $.when(
        getAuthToken({required: false})
      ).then((token) => {
        return fetchResources(token, request.payload.subjectId, 'user', '-created_at', request.payload.user)
      }, (message) => {
        sendResponse({message: message, fetched: false})
      }).then((data) => {
        sendResponse({message: 'OK', fetched: true, resources: data})
      }, (message) => {
        sendResponse({message: message, fetched: false})
      })
      return true
    case "fetchHotResources":
      $.when(
        getAuthToken({required: false})
      ).then((token) => {
        return fetchResources(token, request.payload.subjectId, '', '-weight')
      }, (message) => {
        sendResponse({message: message, fetched: false})
      }).then((data) => {
        sendResponse({message: 'OK', fetched: true, resources: data})
      }, (message) => {
        sendResponse({message: message, fetched: false})
      })
      return true
    case "fetchLatestResources":
      $.when(
        getAuthToken({required: false})
      ).then((token) => {
        return fetchResources(token, request.payload.subjectId, '', '-created_at')
      }, (message) => {
        sendResponse({message: message, fetched: false})
      }).then((data) => {
        sendResponse({message: 'OK', fetched: true, resources: data})
      }, (message) => {
        sendResponse({message: message, fetched: false})
      })
      return true
    case "revoke":
      getAuthToken({required: false}).then(
        revoke,
        (message) => { sendResponse({message: message, revoked: false})}
      ).then(
        (revoked) => { sendResponse({message: 'OK', revoked: true})},
        (message) => { sendResponse({message: message, revoked: false})}
      )
      return true
    default:
      sendResponse({
        message: 'unknownAction'
      })

  }
})
