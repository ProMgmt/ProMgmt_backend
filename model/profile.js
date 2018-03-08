'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = Schema({
  userId: {type: Schema.Types.ObjectId, required: true},
  orgId: [{type: Schema.Types.ObjectId, ref: 'organization'}],
  desc: {type: String, required: true},
  createdDate: {type: Date, required: true, default: Date.now},
  company: {type: String},
  title: {type: String},
  avatarURI: {type: String, unique: true},
  avatarObjectKey: {type: String, unique: true},
});

module.exports = mongoose.model('profile', profileSchema);

