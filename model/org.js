'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const createError = require('http-errors');
const debug = require('debug')('promgmt:Org-model');
const Project = require('../model/project.js');

const orgSchema = Schema({
  name: {type: String, required: true},
  desc: {type: String, required: true},
  projects: [{type: Schema.Types.ObjectId, ref: 'project'}],
  admins: [{type: Schema.Types.ObjectId, ref: 'user', required: true }],
  users: [{type: Schema.Types.ObjectId, ref: 'user'}],
});

const Org = module.exports = mongoose.model('org', orgSchema);

Org.findByIdAndAddProject = function(id, project, userId){
  debug('findByIdAndAddTask');

  return Org.findById(id)
    .then( org => {
      if(!org) return createError(404);
      project.orgId = org._id;
      project.admins = [];
      project.admins.push(userId.toString());
      org.admins.forEach( admin => {
        if(!project.admins.includes(admin.toString())){
          project.admins.push(admin);
        }
      });
      this.tempOrg = org;
      return new Project(project).save();
    })
    .then( project => {
      this.tempOrg.projects.push(project._id);
      this.tempProject = project;
      return this.tempOrg.save();
    })
    .then(() => this.tempProject)
    .catch(err => Promise.reject(err));
};
      
      

