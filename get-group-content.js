var request = require('request');
var auth = '';

function errorHandler(error, response, context){
  if (error !== null || response.statusCode !== 200) {
    console.log('error:', error);
    context.done(null, 'FAILURE');
  }
}

function filterContentsFiled(contents) {
  return contents.list.map(function (content) {
    delete content["resources"];
    delete content["outcomeTypes"];
    delete content.author["resources"];
    delete content.author["followerCount"];
    delete content.author["followed"];
    delete content.author["published"];
    delete content.author["updated"];
    delete content.author["followingCount"];
    delete content.author["jive"];
    delete content.author["phoneNumbers"];
    delete content.author["photos"];
    delete content.author["thumbnailId"];
    delete content.author["thumbnailUrl"];
    delete content.author["initialLogin"];
    delete content.author["type"];
    delete content.author["typeCode"];
    content.author.emails = content.author.emails.filter(function (email) {
      return email.type === 'work'
    });
    return content;
  });
}

function getContents(result, context) {
  request({
    uri: 'https://thoughtworks-preview.jiveon.com/api/core/v3/places/' + result.list[0].placeID + '/contents',
    headers: {
      'Authorization': auth
    }
  }, function (error, response, body) {
    errorHandler(error, response, context);
    var contents = filterContentsFiled(JSON.parse(body));
    context.succeed(contents);
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
    if(result.list.length === 0 ) {
      context.done(null, 'There is no group');
    } else if (result.list.length > 1) {
      context.done(JSON.stringify(result.list), 'There are many groups');
    } else {
      if (result.list[0].groupTypeV2 !== 'PUBLIC') {
        context.done(null, 'There is no public group');
      }
      console.log('place id', result.list[0].placeID);
      getContents(result, context);
    }
    console.log('statusCode:', response && response.statusCode);

  });

}
