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
      var github = new OAuth2('github', {
        client_id: '09450dfdc3ae76768b08',
        client_secret: '8ecfc23e0dba1ce1a295fbabc01fa71db4b80261',
        api_scope: 'resource:read,resource:write',
      });
      sendResponse({
        status: "success"
      })
      break
    case "storeToken":
      break
  }
})
