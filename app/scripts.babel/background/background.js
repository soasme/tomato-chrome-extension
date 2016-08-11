var ENV = {
  remote: null,
  // remote: 'http://127.0.0.1:8000',
  // remote: 'https://tomato.today',
}

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

console.log('\'Allo \'Allo! Event Page for Page Action');

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
      var url = 'http://${ ENV.remote }/oauth2/authorize?client_secret=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&client_id=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&response_type=code&scope=read%20write&redirect_uri=' + encodeURI(chrome.identity.getRedirectURL("provider_cb"));
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
      url: `http://${ ENV.remote }/api/1/isbn/${ isbn }`,
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
    url: `http://${ ENV.remote }/api/1/subjects/${ subjectId }/resources`,
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
      url: `http://${ ENV.remote }/api/1/resources/${ resourceId }/vote`,
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

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

  console.debug("receive", request)

  switch(request.action){
    case "getSubjectIdByISBN":
      $.when(
        getSubjectIdByISBN(request.payload.isbn)
      ).done(function(id) {
        sendResponse({message: 'OK', existed: true, id: id})
      }).fail(function(message) {
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
      $.when(getAuthToken()).then(function(token) {
        return voteResource(token, request.payload.resourceId)
      }).done(function() {
        sendResponse({message: 'OK', voted: true})
      }).fail(function(message) {
        sendResponse({message: message, voted: false})
      })
      return true

    case "fetchUserResources":
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
