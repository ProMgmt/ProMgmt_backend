'use strict';

const mongoose = require('mongoose');
const debug = require('debug')('promgmt:project');
const createError = require('http-errors');
const Schema = mongoose.Schema;
const Task = require('./task.js');

const projectSchema = Schema({
  orgId: {type: Schema.Types.ObjectId, required: true},
  users: [{type: Schema.Types.ObjectId, ref: 'user'}],
  admins: [{type: Schema.Types.ObjectId, ref: 'user', required: true}],
  tasks: [{type: Schema.Types.ObjectId, ref: 'task'}],
  projectName: {type: String, required: true},
  desc: {type: String},
  startDate: {type: Date},
  dueDate: {type: Date},
});

const Project = module.exports = mongoose.model('project', projectSchema);

Project.findByIdAndAddTask = function(id, task, userId){
  debug('findByIdAndAddTask');

  return Project.findById(id)
    .then( project => {
      if(!project) return createError(404);
      task.projectId = project._id;
      task.orgId = project.orgId;
      task.admins = [];
      task.admins.push(userId.toString());
      project.admins.forEach( admin => {
        if(!task.admins.includes(admin.toString())) task.admins.push(admin);
      });
      this.tempProject = project;
      return new Task(task).save();
    })
    .then( task => {
      this.tempProject.tasks.push(task._id);
      this.tempTask = task;
      return this.tempProject.save();
    })
    .then(() => this.tempTask)
    .catch(err => Promise.reject(err));
};