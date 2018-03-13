'use strict';

const superagent = require('superagent');
const debug = require('debug')('promgmt:task-routes.test');
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
  email: 'email@email.com',
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
    serverToggle.serverOff(server, done);
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
    return org.save()
      .then(org => {
        this.tempOrg = org;
        done();
      }).catch(done);
  });

  beforeEach( done => {
    let project = new Project(exampleProject);
    project.orgId = this.tempOrg._id;
    project.admins.push(this.tempUser._id);
    return project.save()
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
        this.tempProject.tasks.push(task._id);
        done();
      });
  });

  beforeEach( done => {
    let task = new Task(exampleTask);
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
  });

  beforeEach( done => {
    let task = new Task(exampleTask);
    task.projectId = this.tempProject._id;
    task.orgId = this.tempOrg._id;
    task.admins.push(this.tempUser._id);
    task.dependentTasks.push(this.tempTask1._id);
    task.save()
      .then(task => {
        this.tempTask2 = task;
        this.tempProject.tasks.push(task._id);
        done();
      });
  });

  beforeEach( done => {
    this.tempProject.save()
      .then( project => {
        this.tempProject = project;
        done();
      });
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Org.remove({}),
      Project.remove({}),
      Task.remove({}),
    ]).then( () => done())
      .catch(done);
  });

  describe('POST: /api/project/:projectId/task', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/project/${this.tempProject._id}/task`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .send(exampleTask)
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectId).toEqual(this.tempProject._id.toString());
            expect(res.body.orgId).toEqual(this.tempOrg._id.toString());
            expect(res.body.admins).toEqual(expect.arrayContaining([this.tempUser._id.toString()]));
            expect(res.body.expectedDuration).toEqual(exampleTask.expectedDuration);
            expect(res.body.status).toEqual(exampleTask.status);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        superagent.post(`${url}/api/project/${this.tempProject._id}/task`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .send({ key: 'value'})
          .end((err, res) => {
            expect(err.status).toEqual(400);
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });
    });
  });

  describe('GET /api/task/:taskId', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.get(`${url}/api/task/${this.tempTask._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectId).toEqual(this.tempProject._id.toString());
            expect(res.body.orgId).toEqual(this.tempOrg._id.toString());
            expect(res.body.admins).toEqual(expect.arrayContaining([this.tempUser._id.toString()]));
            expect(res.body.desc).toEqual(exampleTask.desc);
            done();
          });
      });
    });

    describe('with invalid usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/task/123`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(err.status).toEqual(404);
            expect(res.status).toEqual(404);
            expect(err.message).toEqual('Not Found');
            done();
          });
      });

      it('should respond with a 400 if no ID is provided', done => {
        superagent.get(`${url}/api/task/`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(err.status).toEqual(400);
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/task/${this.tempTask._id}`)
          .end((err, res) => {
            expect(err.status).toEqual(401);
            expect(res.status).toEqual(401);
            expect(err.message).toEqual('Unauthorized');
            done();
          });
      });  
    });
  });

  describe('PUT /api/task/:taskId', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.put(`${url}/api/task/${this.tempTask._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .send({ desc: 'newDesc'})
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.desc).toEqual('newDesc');
            expect(res.body._id).toEqual(this.tempTask._id.toString());
            expect(res.body.orgId).toEqual(this.tempOrg._id.toString());
            expect(res.body.projectId).toEqual(this.tempProject._id.toString());
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.put(`${url}/api/task/123`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .send({ desc: 'newDesc'})
          .end((err, res) => {
            expect(err.status).toEqual(404);
            expect(res.status).toEqual(404);
            expect(err.message).toEqual('Not Found');
            done();
          });
      });

      it('should respond with a 400 if no ID is provided', done => {
        superagent.put(`${url}/api/task/`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .send({ desc: 'newDesc'})
          .end((err, res) => {
            expect(err.status).toEqual(400);
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.put(`${url}/api/task/${this.tempTask._id}`)
          .send({ desc: 'newDesc'})
          .end((err, res) => {
            expect(err.status).toEqual(401);
            expect(res.status).toEqual(401);
            expect(err.message).toEqual('Unauthorized');
            done();
          });
      });  
    });
  });

  describe('DELETE /api/task/:taskId', () => {
    describe('with VALID usage', () => {
      it('should return a 204 when item has been deleted', done => {
        superagent.delete(`${url}/api/task/${this.tempTask._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(204);
            done();
          });
      });
    });
  });
});