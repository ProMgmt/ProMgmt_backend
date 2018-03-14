'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const hooks = require('../lib/test-hooks.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

const exampleAttach = {
  name: 'example attachment',
  type: 'PDF',
  attach: `${__dirname}/../data/sample.pdf`,
};

describe('Attach Routes', function(){
  beforeAll( done => serverToggle.serverOn(server, done));
  afterAll( done => serverToggle.serverOff(server, done));
  beforeAll( done => hooks.createUser(done));
  beforeAll( done => hooks.createOrg(done));
  beforeAll( done => hooks.createProject(done));
  beforeAll( done => hooks.createTask(done));
  afterAll( done => hooks.removeDBInfo(done));

  this.tempAttach = {};

  describe('POST: /api/task/:taskId/attach', () => {
    describe('with VALID usage', () => {
      beforeEach( done => {
        fs.copyFileProm(`${__dirname}/testdata/sample.pdf`, `${__dirname}/../data/sample.pdf`)
          .then( () => done())
          .catch(done);
      });

      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/task/${hooks.tempTask._id}/attach`)
          .set({
            Authorization: `Bearer ${hooks.tempToken}`,
          })
          .field('name', exampleAttach.name)
          .field('type', exampleAttach.type)
          .attach('attach', exampleAttach.attach)
          .end((err, res) => {
            if(err) return done(err);
            this.tempAttach = res.body;
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(exampleAttach.name);
            expect(res.body.type).toEqual(exampleAttach.type);
            expect(res.body.orgId).toEqual(hooks.tempOrg._id.toString());
            expect(res.body.projectId).toEqual(hooks.tempProject._id.toString());
            expect(res.body.taskId).toEqual(hooks.tempTask._id.toString());
            expect(res.body.admins).toEqual(expect.arrayContaining([hooks.tempUser._id.toString()]));
            done();
          });
      });
    });
  });

  describe('DELETE: /api/attach/:attachId', () => {
    describe('with VALID uasge', () => {
      it('should return a 204 status code', done => {
        console.log('this.tempAttach', this.tempAttach);
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
  });
});

