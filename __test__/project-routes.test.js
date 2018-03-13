'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const hooks = require('../lib/test-hooks.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

describe('Project Routes', function() {
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

  afterEach( done => {
    delete hooks.exampleOrg.admin;
    done();
  });

  afterEach( done => {
    hooks.removeDBInfo(done);
  });

  describe('POST /api/org/:orgId/project', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/org/${hooks.tempOrg._id}/project`)
          .send(hooks.exampleProject)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            expect(res.body.admins).toContain(hooks.tempUser._id.toString());
            expect(res.body.projectName).toEqual(hooks.exampleProject.projectName);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        superagent.post(`${url}/api/org/${hooks.tempOrg._id}/project`)
          .send({ desc: 'wooo' })
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });        
      });

      it('should respond with a 401 if the user is not authorized', done => {
        superagent.post(`${url}/api/org/${hooks.tempOrg._id}/project`)
          .send(hooks.exampleProject)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(res.text).toEqual('UnauthorizedError');
            done();
          });
      });
    });
  });

  describe('GET /api/project/:projectId', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.get(`${url}/api/project/${hooks.tempProject._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectName).toEqual(hooks.tempProject.projectName);
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            done();
          });
      });
    });

    describe('with invalid usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/project/4aa6f27fa2e45c6d26827bb1`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });

      it('should respond with a 400 if no ID is provided', done => {
        superagent.get(`${url}/api/project/`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/project/${hooks.tempProject._id}`)
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(res.text).toEqual('UnauthorizedError');
            done();
          });
      });  
    });
  });

  describe('PUT /api/project/:projectId', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.put(`${url}/api/project/${hooks.tempProject._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .send({ projectName: 'weeee' })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectName).toEqual('weeee');
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.put(`${url}/api/project/12345`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .send({ projectName: 'id not found test' })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(res.text).toEqual('NotFoundError');
            done();
          });
      });

      it('should respond with a 400 if no ID is provided', done => {
        superagent.put(`${url}/api/project/`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .send({ projectName: 'no ID provided test'})
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.put(`${url}/api/project/${hooks.tempProject._id}`)
          .send({ projectName: 'no TOKEN provided test' })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(res.text).toEqual('UnauthorizedError');
            done();
          });
      });  
    });
  });

  describe('DELETE /api/project/:projectId', () => {
    describe('with VALID usage', () => {
      it('should return a 204 when item has been deleted', done => {
        superagent.delete(`${url}/api/project/${hooks.tempProject._id}`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(204);
            done();
          });
      });
    });
  });
});