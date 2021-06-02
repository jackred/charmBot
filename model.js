const mongoose = require('mongoose');

const charmsSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  userName: { type: String, required: true },
  videos: [
    {
      url: { type: String, required: true },
      id: { type: String, required: true }, // kinda useless since it's already in url, but easier
      timestamp: { type: Date, default: Date.now },
      done: { type: Boolean, default: false },
      reading: [
        {
          skill_1: { type: String },
          value_1: { type: String },
          skill_2: { type: String },
          value_2: { type: String },
          slot_1: { type: String },
          slot_2: { type: String },
          slot_3: { type: String },
        },
      ],
    },
  ],
});

module.exports = charmsSchema;
