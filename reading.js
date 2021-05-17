const Discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const config = require('./config.json');

const client = new Discord.Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const finished = util.promisify(stream.finished);
let lastProcessedMessage;

client.on('ready', () => {
  console.log('Starting!');
});

client.on('message', async function (msg) {
  let chan = msg.channel;
  if (chan.id == config.channel.videos) {
    const msgs = await downloadVideosNotProcessed(chan);
    const logChan = msg.guild.channels.resolve(config.channel.log);
    const answer = `${msgs.length} message(s) treated:
${msgs.map((e) => e.id).join('\n')}`;
    await logChan.send(answer);
    for (let m of msgs) {
      await m.react('✅');
    }
  }
});

async function getVideosMessages(channel, option = {}) {
  const messages = await channel.messages.fetch(option);
  return messages.filter(
    (m) =>
      m.attachments.size > 0 &&
      m.attachments.first().name.endsWith('.mp4') &&
      m.attachments.first().width !== null
  );
}

async function downloadVideo(url, name, folder = './videos') {
  const streamVideo = await axios.get(url, { responseType: 'stream' });
  const streamFile = fs.createWriteStream(folder + '/' + name + '.mp4');
  const writing = streamVideo.data.pipe(streamFile);
  return await finished(writing);
}

function requestIDLastMessageProcessed() {
  return;
}

function getIDLastMessageProcessed() {
  if (lastProcessedMessage === undefined) {
    lastProcessedMessage = requestIDLastMessageProcessed();
  }
  return lastProcessedMessage;
}

async function downloadVideosNotProcessed(channel) {
  const id_last = getIDLastMessageProcessed();
  const videosMsg = await getVideosMessages(channel, { after: id_last });
  let res = [];
  for (let [k, v] of videosMsg) {
    await downloadVideo(v.attachments.first().url, `${k}_${v.author.id}`);
    res.push(v);
  }
  return res;
}

client
  .login(config.token)
  .then(() => console.log("We're in!"))
  .catch((err) => console.log(err));
