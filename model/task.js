'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = Schema({
  projectId: {type: Schema.Types.ObjectId, ref: 'project', required: true},
  orgId: {type: Schema.Types.ObjectId, ref: 'org', required: true},
  admins: [{type: Schema.Types.ObjectId, ref: 'user'}],
  desc: {type: String, required: true},
  startDate: {type: Date},
  dueDate: {type: Date},
  endDate: {type: Date},
  expectedDuration: {type: Number},
  actualDuration: {type: Number},
  status: {type: String},
  subTasks: [{type: Schema.Types.ObjectId, ref: 'task'}],
  isDependency: {type: Boolean},
  dependentTasks: [{type: Schema.Types.ObjectId, ref: 'task'}],
});

module.exports = mongoose.model('task', taskSchema);