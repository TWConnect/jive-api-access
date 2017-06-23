var request = require('request');
var auth = '';
var jiveApiUrl = 'https://thoughtworks-preview.jiveon.com/api/core/v3';
var serverUrl = 'https://eswqegmop4.execute-api.us-east-1.amazonaws.com/prod';

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function errorHandler(error, response, context) {
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

function getContents(placeID, context) {
    request({
        uri: jiveApiUrl + '/places/' + placeID + '/contents',
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

exports.handler = function (event, context) {
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
        if (result.list.length <= 0) {
            context.fail('There is no group');
        } else {
            var groupArray = result.list.filter((group) => group.groupTypeV2 === 'PUBLIC');

            var groupNameArray = groupArray.map((group) => group.name);

            if (groupArray.length === 0) {
                context.fail('There is no public group');
            } else if (groupArray.length > 1) {
                context.fail('There are many groups, please choose one. ' + JSON.stringify(groupNameArray));
            } else {
                console.log('place id', groupArray);
                getContents(groupArray[0].placeID, context);
            }
            console.log('statusCode:', response && response.statusCode);
        }
    });

};
