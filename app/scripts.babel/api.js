'use strict'

var ENV = {
  // fixture: true,
  fixture: false,

  // remote: 'http://127.0.0.1:8000',

  // needAuthorization: false,
  needAuthorization: true,
}

function getResourcesByISBN(isbn, filter, limit) {
  var dfd = jQuery.Deferred();
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
  return dfd.promise();
}

function voteResource(resourceId) {
  var dfd = jQuery.Deferred()
  dfd.resolve(true)
  return dfd.promise()
}

function addResource(title, url, text) {
  var dfd = jQuery.Deferred()
  dfd.resolve(true)
  return dfd.promise()
}

