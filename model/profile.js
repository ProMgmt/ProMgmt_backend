'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  userId: {type: Schema.Types.ObjectId, required: true},
  orgId: [{type: Schema.Types.ObjectId, ref: 'org'}],
  desc: {type: String, required: true},
  createdDate: {type: Date, required: true, default: Date.now},
  company: {type: String},
  title: {type: String},
  avatarURI: {type: String, unique: true},
  avatarObjectKey: {type: String, unique: true},
});

module.exports = mongoose.model('profile', profileSchema);

