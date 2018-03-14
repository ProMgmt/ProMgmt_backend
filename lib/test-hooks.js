'use strict';

const faker = require('faker');
const User = require('../model/user.js');
const Org = require('../model/org.js');
const Project = require('../model/project.js');
const Task = require('../model/task.js');
const Profile = require('../model/profile.js');

const hooks = module.exports = {};

hooks.exampleUser = {
  username: faker.internet.userName(),
  password: faker.internet.password(),
  email: faker.internet.email(),
};

hooks.exampleOrg = {
  name: faker.company.companyName(),
  desc: faker.lorem.sentence(),
};

hooks.updateOrg = {
  name: faker.company.companyName(),
  desc: faker.lorem.sentence(),
};

hooks.exampleProject = {
  projectName: faker.name.jobType(),
  desc: faker.name.jobDescriptor(),
  startDate: new Date(),
  dueDate: new Date(),
};

hooks.exampleProfile = {
  firstName: faker.name.firstName(), 
  lastName: faker.name.lastName(), 
  desc: faker.name.jobDescriptor(),
  avatarURI: faker.image.imageUrl(),
  avatarObjectKey: '5aa823724ecd4c24b1b5e5f4',
};

hooks.updatedProfile = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  desc: faker.name.jobDescriptor(),
  avatarURI: faker.image.imageUrl(),
  avatarObjectKey: '5aa823724ecd4c24b1b5e5f4',
};

hooks.exampleAttach = {
  name: 'example attachment',
  type: 'PDF',
  attach: `${__dirname}/../data/sample.pdf`,
};

hooks.exampleTask = {
  desc: faker.name.jobType(),
  startDate: new Date(),
  dueDate: new Date(),
  expectedDuration: faker.random.number(),
  status: 'open',
};

hooks.exampleProfilePic = {
  image: `${__dirname}/../data/tester.png`,
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

hooks.createProfile = function (done) {
  this.exampleProfile.userId = this.tempUser._id.toString();
  new Profile(this.exampleProfile).save()
    .then( profile => {
      this.tempProfile = profile;
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