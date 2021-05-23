const mongoose = require('mongoose');

const charmsSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  userName: { type: String, required: true },
  urls: [
    {
      url: { type: String, required: true },
      id: { type: String, required: true }, // kinda useless since it's already in url, but easier
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = charmsSchema;
