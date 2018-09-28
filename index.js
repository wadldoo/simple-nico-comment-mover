'use strict';

// TODO: Pause and resume function
// TODO: Seek function
// TODO: Configure from GUI
// TODO: Archive with electron-packager
// TODO: Fix random position for y axis
// TODO: padding y axis

// I can't use remote...
// var remote = require('remote');
// var d3 = remote.require('d3');

var d3 = require('./lib/d3.min.js');
var xml2js = require('xml2js');
var Screen = require('screen');
var NicoApiClient = require('./lib/nico_api_client');
var conf = require('./conf.json');

function parseXML(xmlStr) {
    return new Promise(function(resolve, reject) {
        var parser = new xml2js.Parser();
        parser.parseString(xmlStr, function (error, result) {
            if (!error) {
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}

function moveComments(parsedXML) {
    var size = Screen.getPrimaryDisplay().size;
    var w = size.width;
    var h = size.height;

    var commentsData = parsedXML.packet.chat.map(function(chat) {
        return {
            comment: chat._,
            vpos: +chat.$.vpos
        };
    });

    d3.select('#board')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .selectAll('text')
        .data(commentsData)
        .enter()
        .append('text')
        .text(function(d) {
            return d.comment;
        })
        .attr('x', w)
        .attr('y', function(d) {
            return d3.random.bates(0.1)() * h / 13 + 110;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", conf.comment.fontSize)
        .attr("fill", "white")
        .transition().ease("linear")
        .attr('x', function() {
            return -(this.getComputedTextLength()+10);
        })
        .duration(conf.comment.displayDuration)
        .delay(function(d) {
            return d.vpos * 10 - (conf.start.min * 60 + conf.start.sec) * 1000;
        });
}

var mainFlow = Promise.resolve({
    smId: conf.smId,
    mail: conf.mail,
    pass: conf.pass
});

mainFlow
    .then(NicoApiClient.login)
    .then(NicoApiClient.getFlvInfo)
    .then(NicoApiClient.getThreadKey)
    .then(NicoApiClient.getCommentXML)
    .then(parseXML)
    .then(moveComments)
    .catch(function(error) {
        console.log(error);
    });
