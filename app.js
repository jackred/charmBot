'use strict';
const Discord = require('discord.js');
const axios = require('axios');

const config = require('./config.json');

const listTalents = require('./talents.json');

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

function checkTalents(arg) {
  let r = /[^\d]+\d/g;
  let talents = arg.match(r);
  if (talents !== null) {
    talents = talents.map((d) => cleanStr(d));
    if (talents.length <= 2) {
      let tmp = arg;
      for (let i of talents) {
        tmp = tmp.replace(i, '');
      }
      if (cleanStr(tmp) === '') {
        let i = 0;
        let res = true;
        while (i < talents.length && res === true) {
          let idx = talents[i].lastIndexOf(' ');
          let value = talents[i].substr(idx + 1);
          if (
            /^\d$/.test(value) &&
            parseInt(value) > 0 &&
            parseInt(value) <= 4
          ) {
            let talent = talents[i].substr(0, idx);
            if (!listTalents.includes(talent.toLowerCase())) {
              res = `Talent ${talent} is not a skill. Check it's syntax`;
            }
          } else {
            res = 'Talent point should be a number between 1 and 4.';
          }
          i++;
        }
        return res;
      } else {
        return 'Talents should be written as `Talent name X`, X being a number.';
      }
    } else {
      return 'The maximum number of talents is 2.';
    }
  } else {
    return 'Talents badly written. Missing skill or point.';
  }
}

const validSlots = [
  '',
  '1',
  '2',
  '3',
  '1-1',
  '1-1-1',
  '2-1',
  '2-1-1',
  '2-2',
  '2-2-1',
  '3-1',
  '3-1-1',
  '3-2',
  '3-2-1',
];
function checkCharm(arg) {
  arg = arg.split(';');
  if (arg.length <= 2) {
    let slot = arg[1] || '';
    if (validSlots.includes(slot)) {
      return checkTalents(arg[0]);
    } else {
      return `List of valid slot: ${validSlots.slice(1).join(', ')}`;
    }
  } else {
    return (
      'You need to provide only one charm, with its slot\n' +
      'e.g: `Ice Attack 2 Thunder Attack 1;3-1`'
    );
  }
}

// arg should be like
// Talent1 point Talent2 point;slot
async function findCharm(msg, arg) {
  let resCheck = checkCharm(arg);
  if (resCheck === true) {
    const args = arg.split(';');
    const slot = args[1] || '';
    const talents = args[0];
    const data = { charm: talents, slot: slot };
    console.log(data);
    const res = await axios.post(`${config.url}/charm`, data);
    let text = '';
    switch (res.data.found) {
      case 0:
      case 1: {
        text = 'This charm was not found in any of the mystery tables.';
        break;
      }
      // case 1: {
      //   let s = res.data.tables.length == 1 ? '' : 's';
      //   text =
      //     'This charm with the those slots was not found in any of the mystery tables.\n' +
      //     `However it was found with different slots in the following table${s} (check for slot mistakes):\n`;
      //   text += res.data.tables.map((d) => `**${d}**`).join('\n');
      //   break;
      // }
      case 2: {
        let s = res.data.tables.length == 1 ? '' : 's';
        text = `This charm was found in the following table${s}:\n`;
        text += res.data.tables.map((d) => `**${d}**`).join('\n');
        break;
      }
    }
    await msg.channel.send(text);
  } else {
    await msg.channel.send(resCheck);
  }
}

function checkSequence(arg) {
  let args = arg.split('|');
  if (args.length !== 1) {
    let i = 0;
    let res = true;
    while (i < args.length && res) {
      let resCheck = checkTalents(args[i]);
      if (resCheck !== true) {
        res = resCheck;
      }
      i++;
    }
    return res;
  } else {
    return 'The sequence should have at least 2 charms. To check only one, use `!charm`';
  }
}

// arg should be like
// Talent1 point Talent2 point; Talent1 point Talent2 point;...
async function findSequence(msg, arg) {
  arg = arg.replace(/;|,/g, '|');
  let resCheck = checkSequence(arg);
  if (resCheck === true) {
    const data = { charm: arg };
    console.log(data);
    const res = await axios.post(`${config.url}/sequence`, data);
    let text = '';
    if (res.data.match.length > 0) {
      let s = res.data.match.length == 1 ? '' : 's';
      text = `A subsequence of charm was found in the following table${s}.`;
      for (let i = 0; i < res.data.match.length; i++) {
        let s = res.data.match[i] == 1 ? '' : 's';
        text += `\n**${res.data.name[i]}** has a subsequence of ${res.data.match[i]} charm${s} in common with the sequence you provided.`;
      }
    } else {
      text = 'This sequence of charm was not found in any mystery tables.';
    }
    await msg.channel.send(text);
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
