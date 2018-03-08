'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orgSchema = Schema({
  name: {type: String, required: true},
  users: [{type: Schema.Types.ObjectId, ref: 'user'}],
});

module.exports = mongoose.model('org', orgSchema);