'use strict';
const Discord = require('discord.js');

const config = require('./config.json');

const client = new Discord.Client({});

client.on('ready', async () => {
  console.log('Starting!');
  client.user.setActivity(config.activity);
});

client.on('message', async (msg) => {
  if (msg.author.bot) {
    return;
  }
  console.log(msg.content);
});

client
  .login(config.token)
  .then(() => console.log("We're in!"))
  .catch((err) => console.log(err));
