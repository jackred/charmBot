'use strict';

const mongoose = require('mongoose');
const config = require('./config.json');
const charmsSchema = require('./model.js');

class DB {
  constructor() {
    this.initDb();
  }

  async initDb() {
    // this.db = await mongoose.connect('mongodb://172.18.0.2:27017/charms', {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
    this.db = await mongoose.connect(config.mongo, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
    });
    this.db.model('charm_reading', charmsSchema);
  }

  findOneAndUpdateInCollection(
    filter = {},
    update = {},
    options = {},
    collection = 'charm_reading'
  ) {
    return this.db.models[collection]
      .findOneAndUpdate(filter, update, options)
      .exec();
  }

  findOneInCollection(
    filter = {},
    projection = {},
    collection = 'charm_reading'
  ) {
    console.log('DB: to find', filter);
    return this.db.models[collection].findOne(filter, projection).lean().exec();
  }

  findInCollection(
    filter = {},
    projection = {},
    limit = 0,
    collection = 'charm_reading'
  ) {
    return this.db.models[collection]
      .find(filter, projection)
      .lean()
      .limit(limit)
      .exec();
  }

  findByIdInCollection(id, collection = 'charm_reading') {
    return this.db.models[collection].findById(id).lean().exec();
  }

  addInCollection(added = {}, options = {}, collection = 'charm_reading') {
    console.log('DB: to add', added);
    return this.db.models[collection].insertMany(added, options).then((res) => {
      let msg = `${res.length} object(s) added to collection ${collection}`;
      console.log('DB:', msg);
      return msg;
    });
  }

  updateOneInCollection(
    filter = {},
    doc = {},
    options = {},
    collection = 'charm_reading'
  ) {
    console.log('DB: filter', filter);
    console.log('DB: update', doc);
    return this.db.models[collection]
      .updateOne(filter, doc, options)
      .then((updatedObject) => {
        let msg = `${updatedObject.nModified} object(s) updated to collection ${collection}`;
        console.log('DB:', msg);
        return msg;
      });
  }

  deleteInCollection(filter = {}, options = {}, collection = 'charm_reading') {
    return this.db.models[collection]
      .deleteMany(filter, options)
      .then((res) => {
        let msg = `${res.n} object(s) removed from collection ${collection}`;
        console.log('DB:', msg);
        return msg;
      });
  }

  findOneAndDeleteInCollection(
    filter = {},
    option = {},
    collection = 'charm_reading'
  ) {
    return this.db.models[collection]
      .findOneAndDelete(filter, option)
      .lean()
      .then((deletedConfig) => {
        let msg = '';
        if (deletedConfig !== null) {
          msg = `1 object removed from collection ${collection}`;
        } else {
          msg = `no objects matched in collection ${collection}`;
        }
        console.log(`DB: ${msg}`);
        return { deletedConfig, msg };
      });
  }

  updatePushOneUrl(userID, url, timestamp, id, options = {}) {
    return this.updateOneInCollection(
      { userID },
      { $push: { videos: { url, timestamp, id } } },
      options,
      'charm_reading'
    );
  }

  findUserByDiscordID(userID) {
    return this.findOneInCollection({ userID }, {}, 'charm_reading');
  }
}

module.exports = DB;
