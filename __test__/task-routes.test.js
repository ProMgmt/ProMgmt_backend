'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const User = require('../model/user.js');
const Org = require('../model/org.js');
const Project = require('../model/project.js');
const Task = require('../model/task.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'exampleName',
  password: '2468',
  email: 'email@email.com'
};

const exampleOrg = {
  name: 'orgName',
  desc: 'orgDesc',
};

const exampleProject = {
  projectName: 'projectName',
  desc: 'projectDesc',
  startDate: new Date(),
  dueDate: new Date(),
};

const exampleTask = {
  desc: 'taskDesc',
  startDate: new Date(),
  dueDate: new Date(),
  expectedDuration: 10,
  status: 'open',
};

describe('Task Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOn(server, done);
  });

  beforeEach( done => {
    new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      }).then(token => {
        this.tempToken = token;
        done();
      }).catch(done);
  });

  beforeEach( done => {
    let org = new Org(exampleOrg);
    org.admins.push(this.tempUser._id);
    org.save()
      .then(org => {
        this.tempOrg = org;
        done();
      }).catch(done);
  });

  beforeEach( done => {
    let project = new Project(exampleProject);
    project.orgId = this.tempOrg._id;
    project.admins.push(this.tempUser._id);
    project.save()
      .then(project => {
        this.tempProject = project;
        done();
      }).catch(done);
  });

  beforeEach( done => {
    let task = new Task(exampleTask);
    task.projectId = this.tempProject._id;
    task.orgId = this.tempOrg._id;
    task.admins.push(this.tempUser._id);
    task.save()
      .then(task => {
        this.tempTask = task;
        done();
      });
  });

  describe('POST /api/project/:projectId/task', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        expect(res.status).toEqual(200);
        expect(res.body.projectId).toEqual(this.tempProject._id.toString());
        expect(res.body.orgId).toEqual(this.tempOrg._id.toString());
        expect(res.body.admins).toEqual(expect.arrayContaining([this.tempUser._id]));
        expect(res.body.expectedDuration).toEqual(exampleTask.expectedDuration);
        expect(res.body.status).toEqual(exampleTask.status);
        done();
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        // TODO: add test
        done();
      });
    });
  });

  describe('GET /api/task/:taskId', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        // TODO: add test
        done();
      });
    });

    describe('with invalid usage', () => {
      it('should respond with a 404 for an ID that is not found', () => {
        // TODO: add test
        done();
      });

      it('should respond with a 400 if no ID is provided', done => {
        // TODO: add test
        done();
      });

      it('should respond with a 401 if no token was provided', done => {
        // TODO: add test
        done();
      });  
    });
  });

  describe('PUT /api/task/:taskId', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        // TODO: add test
        done();
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', () => {
        // TODO: add test
        done();
      });

      it('should respond with a 400 if no ID is provided', done => {
        // TODO: add test
        done();
      });

      it('should respond with a 401 if no token was provided', done => {
        // TODO: add test
        done();
      });  
    });
  });

  describe('DELETE /api/task/:taskId', () => {
    describe('with VALID usage', () => {
      it('should return a 204 when item has been deleted', done => {
        // TODO: add test
        done();
      });
    });
  });
});