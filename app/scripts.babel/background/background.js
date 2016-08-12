var ENV = {
  remote: null,
  // remote: 'http://127.0.0.1:8000',
  // remote: 'https://tomato.today',
}

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

function getAuthToken() {
  var dfd = jQuery.Deferred()
  var token = chrome.storage.local.get(null, function(storage) {
    console.log('tomato', 'storage', storage)
    if (!ENV.remote) {
      dfd.resolve('THIS_IS_MOCK_TOKEN')
    } else if (storage.token) {
      console.debug('tomato', 'using token in storage', storage.token)
      dfd.resolve(storage.token)
    } else {
      console.debug('tomato', 'lauching web auth flow')
      var url = '${ ENV.remote }/oauth2/authorize?client_secret=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&client_id=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&response_type=code&scope=read%20write&redirect_uri=' + encodeURI(chrome.identity.getRedirectURL("provider_cb"));
      chrome.identity.launchWebAuthFlow({
        'interactive': true,
        'url':  url
      }, function(url) {
        // Use the token.
        var match = url.match(/\?code=(.*)/)
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
    }
  })
  return dfd.promise()
}

function getSubjectIdByISBN(isbn) {
  var dfd = $.Deferred()
  if (!ENV.remote) {
    dfd.resolve(1)
  } else {
    return $.ajax({
      method: 'GET',
      url: `${ ENV.remote }/api/1/isbn/${ isbn }`,
      dataType: 'json',
    }).done(function(data, status, xhr) {
      if (xhr.status === 200) {
        dfd.resolve(data.id)
      } else {
        dfd.reject(data.message)
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
    url: `${ ENV.remote }/api/1/subjects/${ subjectId }/resources`,
    dataType: 'json',
    data: JSON.stringify({
      title: title,
      url: url,
      description: description
    }),
    headers: {
      'Authorization': `Bearer ${ token }`,
      'Content-Type':'application/json'
    }
  }).done(function(data, status, xhr) {
    if (xhr.status == 200) {
      dfd.resolve(data.id)
    } else {
      dfd.reject(data.message)
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
      url: `${ ENV.remote }/api/1/resources/${ resourceId }/vote`,
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

function fetchUserResources(token, subjectId) {
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
    return $.ajax({
      method: 'GET',
      url: `${ ENV.remote }/api/1/users/resources?limit=5`,
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
    case "getSubjectIdByISBN":
      $.when(
        getSubjectIdByISBN(request.payload.isbn)
      ).then(function(id) {
        sendResponse({message: 'OK', existed: true, id: id})
      }, function(message) {
        sendResponse({message: message, existed: false})
      })
      return true

    case "addResource":
      $.when(getAuthToken()).then(function(token) {
        return addResource(token,
                           request.payload,subjectId,
                           request.payload.title,
                           request.payload.url,
                           request.payload.description)
      }).done(function(id) {
        sendResponse({message: 'OK', created: true, id: id})
      }).fail(function(message) {
        sendResponse({message: message, created: false})
      })
      return true

    case "voteResource":
      $.when(
        getAuthToken()
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
        getAuthToken()
      ).then((token) => {
        return fetchUserResources(token, request.payload.subjectId)
      }, (message) => {
        sendResponse({message: message, fetched: false})
      }).then((data) => {
        sendResponse({message: 'OK', fetched: true, resources: data})
      }, (message) => {
        sendResponse({message: message, fetched: false})
      })
      return true
    case "fetchHotResources":
    case "fetchLatestResources":
    case "logout":
      sendResponse({
        status: 'success',
      })
      break
    default:
      sendResponse({
        status: 'unknown'
      })

  }
})
