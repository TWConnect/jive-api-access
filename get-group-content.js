var request = require('request');

exports.handler = function(event, context) {
  var searchGroup = 'https://thoughtworks-preview.jiveon.com/api/core/v3/search/places?filter=search(' + event.groupName+ ')';
  var auth = '';
  var options = {
    uri: searchGroup,
    headers: {
      'Authorization': auth
    }
  };

  request(options, function (error, response, body) {
    if (error !== null || response.statusCode !== 200) {
      console.log('error:', error);
      context.done(null, 'FAILURE');
    }
    var result = JSON.parse(body);
    context.succeed(result.list.length);
    console.log('statusCode:', response && response.statusCode);

  });

}
