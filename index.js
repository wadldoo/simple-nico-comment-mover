'use strict';

// TODO: Pause and resume function
// TODO: Seek function
// TODO: Configure from GUI
// TODO: Archive with electron-packager
// TODO: Fix random position for y axis
// TODO: padding y axis

// I can't use remote...
// let remote = require('remote');
// let d3 = remote.require('d3');

const d3 = require('./lib/d3.min.js');
const xml2js = require('xml2js');
const Screen = require('screen');
const NicoApiClient = require('./lib/nico_api_client');
const conf = require('./conf.json');

function parseXML(xmlStr) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    parser.parseString(xmlStr, (error, result) => {
      return error ? reject(error) : resolve(result);
    });
  });
}

function moveComments(parsedXML) {
  const size = Screen.getPrimaryDisplay().size,
        w = size.width,
        h = size.height;

  const commentsData = parsedXML.packet.chat.map((chat) => ({
    comment: chat._,
    vpos: +chat.$.vpos
  }));

  d3.select('#board')
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .selectAll('text')
    .data(commentsData)
    .enter()
    .append('text')
    .text((d) => d.comment)
    .attr('x', w)
    .attr('y', () => d3.random.bates(0.1)() * h / 10)
    .attr("font-family", "sans-serif")
    .attr("font-size", conf.comment.fontSize)
    .attr("fill", "white")
    .transition()
    .ease("linear")
    .attr('x', function() {
      return -(this.getComputedTextLength() + 10);
    })
    .duration(conf.comment.displayDuration)
    .delay((d) => d.vpos * 10);
}

const mainFlow = Promise.resolve({
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
  .catch((error) => console.log(error));
