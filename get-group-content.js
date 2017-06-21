var request = require('request');
var auth = '';

function errorHandler(error, response, context){
  if (error !== null || response.statusCode !== 200) {
    console.log('error:', error);
    context.done(null, 'FAILURE');
  }
}

function getContents(result, context) {
  request({
    uri: 'https://thoughtworks-preview.jiveon.com/api/core/v3/places/' + result.list[0].placeID + '/contents',
    headers: {
      'Authorization': auth
    }
  }, function (error, response, body) {
    errorHandler(error, response, context);
    context.succeed(JSON.parse(body));
  });
}

exports.handler = function(event, context) {
  var searchGroup = 'https://thoughtworks-preview.jiveon.com/api/core/v3/search/places?filter=search(' + event.groupName+ ')';
  var options = {
    uri: searchGroup,
    headers: {
      'Authorization': auth
    }
  };

  request(options, function (error, response, body) {
    errorHandler(error, response, context);
    var result = JSON.parse(body);
    if (result.list.length > 1) {
      context.done(result.list, 'There are many groups');
    } else {
      console.log('place id', result.list[0].placeID);
      getContents(result, context);
    }
    console.log('statusCode:', response && response.statusCode);

  });

}
