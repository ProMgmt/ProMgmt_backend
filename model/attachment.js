const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attachSchema = Schema({
  name: {type: String, required: true},
  taskId: {type: Schema.Types.ObjectId, required: true},
  projectId: {type: Schema.Types.ObjectId, required: true},
  orgId: {type: Schema.Types.ObjectId, required: true},
  admins: [{type: Schema.Types.ObjectId, required: true}],
  type: {type: String, required: true},
  attURI: {type: String, required: true, unique: true},
  objectKey: {type: String, required: true, unique: true},
  created: {type: Date, default: Date.now},
});

module.exports = mongoose.model('attach', attachSchema);