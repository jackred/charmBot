'use strict';
const Discord = require('discord.js');
const axios = require('axios');

const config = require('./config.json');

const client = new Discord.Client({
  // partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'],
});

client.on('ready', async () => {
  console.log('Starting!');
  client.user.setActivity(config.activity);
});

function cleanStr(s) {
  return s.trim().replace(/\s\s+/g, ' ');
}

function checkCharm(arg) {
  return true;
}

// arg should be like
// Talent1 point Talent2 point;slot
async function findCharm(msg, arg) {
  let resCheck = checkCharm(arg);
  if (resCheck === true) {
    const args = arg.split(';');
    const slot = args[1];
    const talents = args[0];
    const data = { charm: talents, slot: slot };
    console.log(data);
    const res = await axios.post(`${config.url}/charm`, data);
    await msg.channel.send(res.data);
  } else {
    await msg.channel.send(resCheck);
  }
}

function checkSequence(arg) {
  return true;
}

// arg should be like
// Talent1 point Talent2 point; Talent1 point Talent2 point;...
async function findSequence(msg, arg) {
  let resCheck = checkSequence(arg);
  if (resCheck === true) {
    const talents = arg.replace(/;/g, '|');
    const data = { charm: talents };
    console.log(data);
    const res = await axios.post(`${config.url}/sequence`, data);
    await msg.channel.send(res.data);
  } else {
    await msg.channel.send(resCheck);
  }
}

client.on('message', async (msg) => {
  if (msg.author.bot) {
    return;
  }
  if (msg.content.startsWith(config.prefix)) {
    const content = msg.content.substr(config.prefix.length);
    switch (content.split(' ')[0]) {
      case 'charm': {
        const arg = cleanStr(content.substr('charm'.length));
        await findCharm(msg, arg);
        break;
      }
      case 'sequence': {
        const arg = cleanStr(content.substr('sequence'.length));
        await findSequence(msg, arg);
        break;
      }
      default:
        break;
    }
  }
});

client
  .login(config.token)
  .then(() => console.log("We're in!"))
  .catch((err) => console.log(err));
