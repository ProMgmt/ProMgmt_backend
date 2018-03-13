'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const hooks = require('../lib/test-hooks.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

describe('Task Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  beforeEach( done => {
    hooks.createUser(done);
  });

  beforeEach( done => {
    hooks.createOrg(done);
  });

  beforeEach( done => {
    hooks.createProject(done);
  });

  beforeEach( done => {
    hooks.createTask(done);
  });

  beforeEach( done => {
    hooks.createTask1(done);
  });

  beforeEach( done => {
    hooks.createTask2(done);
  });

  afterEach( done => {
    hooks.removeDBInfo(done);
  });

  describe('POST: /api/project/:projectId/task', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/project/${hooks.tempProject._id}/task`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .send(hooks.exampleTask)
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectId).toEqual(hooks.tempProject._id.toString());
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            expect(res.body.admins).toEqual(expect.arrayContaining([hooks.tempUser._id.toString()]));
            expect(res.body.expectedDuration).toEqual(hooks.exampleTask.expectedDuration);
            expect(res.body.status).toEqual(hooks.exampleTask.status);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        superagent.post(`${url}/api/project/${hooks.tempProject._id}/task`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
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
        superagent.get(`${url}/api/task/${hooks.tempTask._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectId).toEqual(hooks.tempProject._id.toString());
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            expect(res.body.admins).toEqual(expect.arrayContaining([hooks.tempUser._id.toString()]));
            expect(res.body.desc).toEqual(hooks.exampleTask.desc);
            done();
          });
      });
    });

    describe('with invalid usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/task/5aa825aaaaace7271e93f5aa`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
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
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(err.status).toEqual(400);
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/task/${hooks.tempTask._id}`)
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
        superagent.put(`${url}/api/task/${hooks.tempTask._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .send({ desc: 'newDesc'})
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.desc).toEqual('newDesc');
            expect(res.body._id).toEqual(hooks.tempTask._id.toString());
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            expect(res.body.projectId).toEqual(hooks.tempProject._id.toString());
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.put(`${url}/api/task/5aa825aaaaace7271e93f5aa`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
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
            Authorization: `Bearer ${hooks.tempToken}`,
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
        superagent.put(`${url}/api/task/${hooks.tempTask._id}`)
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
        superagent.delete(`${url}/api/task/${hooks.tempTask._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
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