'use strict';

const User = require('../model/user.js');
const Org = require('../model/org.js');
const Project = require('../model/project.js');
const Task = require('../model/task.js');
const Profile = require('../model/profile.js');

const hooks = module.exports = {};

hooks.exampleUser = {
  username: 'orgtestuser',
  password: 'password~',
  email: 'orgtestemail@gmail.com',
};

hooks.exampleOrg = {
  name: 'example organization',
  desc: 'this is my description',
};

hooks.updateOrg = {
  name: 'update org',
  desc: 'update test',
};

hooks.exampleProject = {
  projectName: 'example project name',
  desc: 'example project',
  startDate: new Date(),
  dueDate: new Date(),
};

hooks.exampleTask = {
  desc: 'taskDesc',
  startDate: new Date(),
  dueDate: new Date(),
  expectedDuration: 10,
  status: 'open',
};


hooks.createUser = function (done) {
  new User(this.exampleUser)
    .generatePasswordHash(this.exampleUser.password)
    .then(user => user.save())
    .then(user => {
      this.tempUser = user;
      return user.generateToken();
    })
    .then(token => {
      this.tempToken = token;
      done();
    })
    .catch(done);
};

hooks.createOrg = function (done) {
  this.exampleOrg.admin = this.tempUser._id.toString();

  new Org(this.exampleOrg).save()
    .then( org => {
      this.tempOrg = org;
      done();
    })
    .catch(done);
};

hooks.createTask = function (done) {
  let task = new Task(this.exampleTask);
  task.projectId = this.tempProject._id;
  task.orgId = this.tempOrg._id;
  task.admins.push(this.tempUser._id);
  task.save()
    .then(task => {
      this.tempTask = task;
      this.tempProject.tasks.push(task._id);
      done();
    });
};

hooks.createTask1 = function(done) {
  let task = new Task(this.exampleTask);
  task.projectId = this.tempProject._id;
  task.orgId = this.tempOrg._id;
  task.admins.push(this.tempUser._id);
  task.subTasks.push(this.tempTask._id);
  task.save()
    .then(task => {
      this.tempTask1 = task;
      this.tempProject.tasks.push(task._id);
      done();
    });
};

hooks.createTask2 = function(done) {
  let task = new Task(this.exampleTask);
  task.projectId = this.tempProject._id;
  task.orgId = this.tempOrg._id;
  task.admins.push(this.tempUser._id);
  task.dependentTasks.push(this.tempTask._id);
  task.save()
    .then(task => {
      this.tempTask2 = task;
      this.tempProject.tasks.push(task._id);
      done();
    });  
};

hooks.createProject = function (done) {
  this.exampleProject.orgId = this.tempOrg._id.toString();
  this.exampleProject.admins = this.tempUser._id.toString();

  new Project(this.exampleProject).save()
    .then(project => {
      this.tempProject = project;
      done();
    })
    .catch(done);
};

hooks.removeDBInfo = function(done) {
  return Promise.all([
    User.remove({}),
    Org.remove({}),
    Profile.remove({}),
    Project.remove({}),
    Task.remove({}),
  ])
    .then(() => done())
    .catch(done);
};