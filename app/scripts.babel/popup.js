'use strict';

var tomato = new OAuth2("tomato-dev", {
  client_id: "juCBOQe1KDB6rcXks8ezCviaAffH7sc9ZMZwhsxI",
  client_secret: 'OWkpLM2Fox1O2MbbnJx5kIbQlRExJDjVQo9BFepVuXdJVQUeHpVZKZrYE7Rolqfi1AgNpibyMb9gG9g6m59lxZU7MpYVAFhkME0v26daJpoXvvuKKOwaSd7MijRiV8i5',
  redirect_uri: 'http://127.0.0.1:8000/chrome/extensions/success',
  api_scope: 'read write',
})

tomato.authorize(function() {
  var token = tomato.getAccessToken()
  console.debug(token)
})
