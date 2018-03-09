'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orgSchema = Schema({
  name: {type: String, required: true},
  desc: {type: String, required: true},
  projects: [{type: Schema.Types.ObjectId, ref: 'project'}],
  admins: [{type: Schema.Types.ObjectId, ref: 'user'}],
  users: [{type: Schema.Types.ObjectId, ref: 'user'}],
});

module.exports = mongoose.model('org', orgSchema);