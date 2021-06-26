const assert = require("assert");
global.fetch = require("node-fetch");
const utils = require("../utils.node.js");

const Main = async (videoId) => {
  const subtitleInfo = await utils.getYoutubeSubtitleInfo(videoId);
  console.log(JSON.stringify(subtitleInfo, null, 2));
};

const [videoId] = process.argv.slice(2);
assert(videoId, 'Argument for "videoId" is required');
Main(videoId);
