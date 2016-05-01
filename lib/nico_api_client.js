var request = require('request');
var querystring = require('querystring');

request = request.defaults({jar: true});

var NicoApiClient = {};

function login(h) {
    return new Promise(function(resolve, reject) {
        var jar = request.jar();
        request.post('https://secure.nicovideo.jp/secure/login', {
            jar: jar,
            form: { mail: h.mail, password: h.pass }
        }, function(error, response, body) {
            if (!error) {
                console.log('login result: ' + response.statusCode);
                h.jar = jar;
                resolve(h);
            } else {
                reject('login error: ' + response.statusCode);
            }
        });
    });
}

function getFlvInfo(h) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'http://flapi.nicovideo.jp/api/getflv/' + h.smId,
            jar: h.jar
        };
        request.get(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var parsedBody = querystring.parse(body);
                h.msgServerURL = parsedBody.ms;
                h.userId = parsedBody.user_id;
                console.log('getflv result: ' + parsedBody.ms);
                resolve(h);
            } else {
                reject('getflv error: '+ response.error);
            }
        });
    });
}

function getThreadKey(h) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: 'http://flapi.nicovideo.jp/api/getthreadkey?thread=' + h.smId,
            jar: h.jar
        };
        request.get(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('getthreadkey result: ' + body);
                h['threadKey'] = body.split("&").map(function(t) {
                    return t.split("=")[1];
                })[0];
                resolve(h);
            } else {
                reject('getthreadkey error: '+ response.error);
            }
        });
    });
}

function getCommentXML(h) {
    return new Promise(function(resolve, reject) {
        var commentHistoryRangeMin = '30';
        // TODO: Modify to something xml builder
        var requestBody = '<packet><thread thread="' + h.smId +
                '" version="20090904" user_id="' + h.userId +
                '" threadkey="' + h.threadKey +
                '" force_184="1" />' +
                '<thread_leaves scores="1" thread="' + h.smId +
                '" user_id="' + h.userId +
                '" threadkey="' + h.threadKey +
                '" force_184="1">' +
                '0-' + commentHistoryRangeMin +
                ':100,1000</thread_leaves></packet>';
        // In 0-30 min...
        //   get 100/min comments
        //   get newest 1000 comments
        var options = {
            url: h.msgServerURL,
            jar: h.jar,
            method: "POST",
            body: requestBody
        };
        // console.log(options);
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log('msg result: ' + body);
                resolve(body);
            } else {
                reject('error: '+ response.statusCode);
            }
        });
    });
}


NicoApiClient.login = login;
NicoApiClient.getFlvInfo = getFlvInfo;
NicoApiClient.getThreadKey = getThreadKey;
NicoApiClient.getCommentXML = getCommentXML;

module.exports = NicoApiClient;
