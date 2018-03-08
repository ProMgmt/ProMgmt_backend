'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('promgmt:project');
const createError = require('http-errors');
const Schema = mongoose.Schema;
const Task = require('./task.js');

const projectSchema = Schema({
  orgId: {type: Schema.Types.ObjectId, required: true},
  users: [{type: Schema.Types.ObjectId, ref: 'user'}],
  adminId: {type: Schema.Types.ObjectId, required: true},
  tasks: [{type: Schema.Types.ObjectId, ref: 'task'}],
  projectName: {type: String, required: true},
  desc: {type: String},
  startDate: {type: Date},
  dueDate: {type: Date},
});

const Project = module.exports = mongoose.model('project', projectSchema);

Project.findByIdAndAddTask = function(id, task){
  debug('findByIdAndAddTask');

  return Project.findById(id)
    .then( project => {
      task.projectId = project._id;
      this.tempProject = project;
      return new Task(task).save();
    }).then( task => {
      this.tempProject.tasks.push(task._id);
      this.tempTask = task;
      return this.tempTask.save();
    }).then(() => this.tempTask)
    .catch(err => Promise.reject(createError(400, err.message)));
};