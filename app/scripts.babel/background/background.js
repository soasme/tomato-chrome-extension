chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
  chrome.pageAction.show(tabId);
});

console.log('\'Allo \'Allo! Event Page for Page Action');



chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  console.debug("receive", request)
  switch(request.action){
    case "addResource":
    case "voteResource":
      var url = 'http://127.0.0.1:8000/oauth2/authorize?client_secret=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&client_id=juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI&response_type=code&scope=read%20write&redirect_uri=' + encodeURI(chrome.identity.getRedirectURL("provider_cb"));
      console.log(url)
      chrome.identity.launchWebAuthFlow({
        'interactive': true,
        'url':  url
      }, function(token) {
        // Use the token.
        console.log(token)
      });

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
