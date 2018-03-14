'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profilePicSchema = Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  profileId: { type: Schema.Types.ObjectId, required: true },
  avatarURI: {type: String, unique: true},
  avatarObjectKey: {type: String, unique: true},
});

module.exports = mongoose.model('profilePic', profilePicSchema);