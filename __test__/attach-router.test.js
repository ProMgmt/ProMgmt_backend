'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});
const server = require('../server.js');
const hooks = require('../lib/test-hooks.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

describe('Attach Routes', function(){
  beforeAll( done => server.serverOn(done));
  afterAll( done => server.serverOff(done));
  beforeAll( done => hooks.createUser(done));
  beforeAll( done => hooks.createOrg(done));
  beforeAll( done => hooks.createProject(done));
  beforeAll( done => hooks.createTask(done));
  afterAll( done => hooks.removeDBInfo(done));
  beforeEach( done => {
    fs.copyFileProm(`${__dirname}/testdata/sample.pdf`, `${__dirname}/../data/sample.pdf`)
      .then( () => done())
      .catch(done);
  });

  this.tempAttach = {};

  describe('POST: /api/task/:taskId/attach', () => {
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/task/${hooks.tempTask._id}/attach`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .field('name', hooks.exampleAttach.name)
          .field('type', hooks.exampleAttach.type)
          .attach('attach', hooks.exampleAttach.attach)
          .end((err, res) => {
            if(err) return done(err);
            this.tempAttach = res.body;
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(hooks.exampleAttach.name);
            expect(res.body.type).toEqual(hooks.exampleAttach.type);
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            expect(res.body.projectId).toEqual(hooks.tempProject._id.toString());
            expect(res.body.taskId).toEqual(hooks.tempTask._id.toString());
            expect(res.body.admins).toEqual(expect.arrayContaining([hooks.tempUser._id.toString()]));
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should return a 404 for an task ID that is not found', done => {
        superagent.post(`${url}/api/task/5aa843de02f4f95338baaaaa/attach`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .field('name', hooks.exampleAttach.name)
          .field('type', hooks.exampleAttach.type)
          .attach('attach', hooks.exampleAttach.attach)
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });

      it('should return a 400 if no file path is not found', done => {
        superagent.post(`${url}/api/task/${hooks.tempTask._id}/attach`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .field('name', hooks.exampleAttach.name)
          .field('type', hooks.exampleAttach.type)
          .attach('attach', '')
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });

      it('should return a 400 if the name or type is not supplied', done => {
        superagent.post(`${url}/api/task/${hooks.tempTask._id}/attach`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .field('type', hooks.exampleAttach.type)
          .attach('attach', hooks.exampleAttach.attach)
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });
    });
  });

  describe('DELETE: /api/attach/:attachId', () => {
    describe('with VALID uasge', () => {
      it('should return a 204 status code', done => {
        superagent.delete(`${url}/api/attach/${this.tempAttach._id}`)
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

    describe('with INVALID usage', () => {
      it('should return a 400 if no ID is provided', done => {
        superagent.delete(`${url}/api/attach`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            done();
          });
      });

      it('should return a 404 for an ID that is not found', done => {
        superagent.delete(`${url}/api/attach/5aa843de02f4f95338baaaaa`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            done();
          });
      });
    });
  });
});

