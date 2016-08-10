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
    if (storage.token) {
      console.debug('tomato', 'using token in storage', storage.token)
      dfd.resolve(storage.token)
    } else {
      console.debug('tomato', 'lauching web auth flow')
      var url = 'http://127.0.0.1:8000/oauth2/authorize?client_secret=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&client_id=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&response_type=code&scope=read%20write&redirect_uri=' + encodeURI(chrome.identity.getRedirectURL("provider_cb"));
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

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {

  console.debug("receive", request)

  switch(request.action){
    case "addResource":
    case "voteResource":
      $.when(getAuthToken()).then(function(token) {
        var response = {message: 'OK'}
        console.log('tomato', 'vote resource', response, token)
        sendResponse(response)
      })
      return true
      break

    case "fetchUserResources":
    case "fetchHotResources":
    case "fetchLatestResources":
    case "logout":
      tomato.clearAccessToken()
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
