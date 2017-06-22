var request = require('request');
var auth = '';
var jiveApiUrl = 'https://thoughtworks-preview.jiveon.com/api/core/v3';
var serverUrl = 'https://eswqegmop4.execute-api.us-east-1.amazonaws.com/prod';

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function errorHandler(error, response, context){
  if (error !== null) {
    context.fail(error);
  }
  if (response.statusCode !== 200) {
    context.fail(response);
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
    uri: jiveApiUrl + '/places/' + result.list[0].placeID + '/contents',
    headers: {
      'Authorization': auth
    }
  }, function (error, response, body) {
    errorHandler(error, response, context);
    body = body.replaceAll(jiveApiUrl, serverUrl);
    var result = JSON.parse(body);
    result.list = filterContentsFiled(result);
    context.succeed(result);
  });
}

exports.handler = function(event, context) {
  var groupName = event.params.querystring.groupName;
  var searchGroup = jiveApiUrl + '/search/places?filter=nameonly&filter=type(group)&filter=search(' + groupName + ')';
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
      context.fail('There is no group');
    } else if (result.list.length > 1) {
      var groupNameArray = result.list.map(function (group) {
        return group.name;
      });
      context.fail('There are many groups, please choose one. ' + JSON.stringify(groupNameArray));
    } else {
      if (result.list[0].groupTypeV2 !== 'PUBLIC') {
        context.fail('There is no public group');
      }
      console.log('place id', result.list[0].placeID);
      getContents(result, context);
    }
    console.log('statusCode:', response && response.statusCode);

  });

}
