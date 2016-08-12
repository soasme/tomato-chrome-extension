'use strict';

console.log('\'Allo \'Allo! Option');

var getLogin = () => {
  var dfd = $.Deferred()
  chrome.storage.sync.get(null, (storage) => {
    if (storage.token) {
      dfd.resolve(true)
    } else {
      dfd.resolve(false)
    }
  })
  return dfd.promise()
}

$.when(
  getLogin()
).then(function(
  isLogin
) {
  if (isLogin) {
    $(".login").hide()
    $(".logout").show()
  } else {
    $(".logout").hide()
    $(".login").show()
  }

  $(".logout").on('click', function(e) {
    chrome.extension.sendMessage({
      action: "logout"
    }, function(response) {
      if (response.loggedOut) {
        $(".logout").hide()
        $(".login").show()
      } else {
        alert(response.message)
      }
    })
  })

  $(".login").on('click', function(e) {
    chrome.extension.sendMessage({
      action: "login"
    }, function(response) {
      if (response.loggedIn) {
        $(".logout").show()
        $(".login").hide()
      } else {
        alert(response.message)
      }
    })
  })

})
