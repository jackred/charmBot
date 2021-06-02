const Discord = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const util = require('util');
const stream = require('stream');
const config = require('./config.json');
const DB = require('./db');

const db = new DB();

const client = new Discord.Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const finished = util.promisify(stream.finished);

client.on('ready', async () => {
  console.log('Starting!');
  const chan = client.channels.resolve(config.channel.submit);
  let msgs;
  do {
    msgs = await chan.messages.fetch({ limit: 50 });
    for (let [, v] of msgs) {
      await handleNewMessageSubmitChan(v);
    }
  } while (msgs.size > 0);
});

async function addAuthorOrUrl(msg, vidMsgId) {
  if ((await db.findUserByDiscordID(msg.author.id)) !== null) {
    await db.updatePushOneUrl(
      msg.author.id,
      msg.attachments.first().url,
      msg.createdTimestamp,
      msg.attachments.first().id
    );
  } else {
    await db.addInCollection({
      userID: msg.author.id,
      userName: msg.author.username,
      videos: [
        {
          url: msg.attachments.first().url,
          timestamp: msg.createdTimestamp,
          id: vidMsgId,
        },
      ],
    });
  }
}

async function handleNewVideo(msg) {
  const vidChan = msg.guild.channels.resolve(config.channel.videos);
  const filename = await downloadVideoFromMessage(msg);
  console.log(filename);
  // await pingAPI(filename)
  const vidMsg = await vidChan.send({ files: [msg.attachments.first().url] });
  await addAuthorOrUrl(msg, vidMsg.id);
  await vidMsg.react('✅');
  await msg.delete();
}

async function handleNewMessageSubmitChan(msg) {
  if (isVideo(msg)) {
    await handleNewVideo(msg);
  } else {
    await msg.delete();
  }
}

// async function handleNewMessageVideoChan(msg) {
//   if (msg.author === client.user) {
//     await msg.react('✅');
//   }
// }

client.on('message', async function (msg) {
  let chan = msg.channel;
  if (chan.id === config.channel.submit) {
    await handleNewMessageSubmitChan(msg);
  }
  // if (chan.id === config.channel.videos) {
  //   await handleNewMessageVideoChan(msg);
  // }
});

function isVideo(msg) {
  return (
    msg.attachments.size > 0 &&
    msg.attachments.first().name.endsWith('.mp4') &&
    msg.attachments.first().width !== null &&
    msg.attachments.first().size <= 30000000
  );
}

async function downloadVideo(url, name, folder = './videos') {
  const streamVideo = await axios.get(url, { responseType: 'stream' });
  const filename = folder + '/' + name + '.mp4';
  const streamFile = fs.createWriteStream(filename);
  const writing = streamVideo.data.pipe(streamFile);
  await finished(writing);
  console.log('finished');
  return filename;
}

async function downloadVideoFromMessage(msg) {
  const tmp = msg.attachments.first().url;
  return await downloadVideo(tmp, `${msg.author.id}_${tmp.split('/')[5]}`);
}

client
  .login(config.token)
  .then(() => console.log("We're in!"))
  .catch((err) => console.log(err));
