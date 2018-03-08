'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = Schema({
  userId: {type: Schema.Types.ObjectId},
  projectId: {type: Schema.Types.ObjectId, required: true},
  orgId: {type: Schema.Types.ObjectId, required: true},
  adminId: {type: Schema.Types.ObjectId},
  desc: {type: String, required: true},
  startDate: {type: Date},
  dueDate: {type: Date},
  endDate: {type: Date},
  estimatedTime: {type: Number},
  status: {type: String},
  isDependency: {type: Boolean},
  dependentTasks: [{type: Schema.Types.ObjectId}],
});

module.exports = mongoose.model('task', taskSchema);