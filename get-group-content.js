var request = require('request');
var Buffer = require('buffer').Buffer;
var auth = 'Basic ' + new Buffer('username:password').toString('base64');


exports.handler = function(event, context) {
  console.log('place id', event.placeId);
  var jiveApiUrl = 'https://thoughtworks-preview.jiveon.com/api/core/v3/places/' + event.placeId + '/contents';

  var options = {
    uri: jiveApiUrl,
    headers: {
      'Authorization': auth
    }
  };

  request(options, function (error, response, body) {
    if (error !== null) {
      console.log('error:', error);
      context.done(null, 'FAILURE');
    }
    context.succeed(body);
    console.log('statusCode:', response && response.statusCode);

  });

}
