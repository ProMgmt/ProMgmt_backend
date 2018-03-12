'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const User = require('../model/user.js');
const Project = require('../model/project.js');
const Org = require('../model/org.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'orgtestuser',
  password: 'password~',
  email: 'orgtestemail@gmail.com',
};

const exampleOrg = {
  name: 'example organization',
  desc: 'this is my description',
};

const exampleProject = {
  projectName: 'example project name',
};

const manuallySavedProject = {
  projectName: 'project for get put and delete route tests',
};

describe('Project Routes', function() {
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
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
  });

  beforeEach( done => {
    exampleOrg.admin = this.tempUser._id.toString();

    new Org(exampleOrg).save()
      .then( org => {
        this.tempOrg = org;
        done();
      })
      .catch(done);
  });

  beforeEach( done => {
    manuallySavedProject.orgId = this.tempOrg._id.toString();
    manuallySavedProject.admins = this.tempUser._id.toString();

    new Project(manuallySavedProject).save()
      .then(project => {
        this.tempProject = project;
        done();
      })
      .catch(done);
  });

  afterEach( done => {
    delete exampleOrg.admin;
    done();
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Org.remove({}),
      Project.remove({}),
    ])
      .then(() => done())
      .catch(done);
  });

  describe('POST /api/org/:orgId/project', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/org/${this.tempOrg._id}/project`)
          .send(exampleProject)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.orgId).toEqual(this.tempOrg._id.toString());
            expect(res.body.admins).toContain(this.tempUser._id.toString());
            expect(res.body.projectName).toEqual(exampleProject.projectName);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        superagent.post(`${url}/api/org/${this.tempOrg._id}/project`)
          .send({ desc: 'wooo' })
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });        
      });

      it('should respond with a 401 if the user is not authorized', done => {
        superagent.post(`${url}/api/org/${this.tempOrg._id}/project`)
          .send(exampleProject)
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
        superagent.get(`${url}/api/project/${this.tempProject._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectName).toEqual(this.tempProject.projectName);
            expect(res.body.orgId).toEqual(this.tempOrg._id.toString());
            done();
          });
      });
    });

    describe('with invalid usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/project/4aa6f27fa2e45c6d26827bb1`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });

      it('should respond with a 400 if no ID is provided', done => {
        superagent.get(`${url}/api/project/`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/project/${this.tempProject._id}`)
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
        superagent.put(`${url}/api/project/${this.tempProject._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .send({ projectName: 'weeee' })
          .end((err, res) => {
            if (err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.projectName).toEqual('weeee');
            expect(res.body.orgId).toEqual(this.tempOrg._id.toString());
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.put(`${url}/api/project/12345`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
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
            Authorization: `Bearer ${this.tempToken}`,
          })
          .send({ projectName: 'no ID provided test'})
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(res.text).toEqual('BadRequestError');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.put(`${url}/api/project/${this.tempProject._id}`)
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
        superagent.delete(`${url}/api/project/${this.tempProject._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(204);
            done();
          });
      });
    });
  });
});