'use strict';

'use strict';

const superagent = require('superagent');
const server = require('../server.js');
const serverToggle = require('../lib/toggle.js');
const User = require('../model/user.js');
const Org = require('../model/org.js');
const PORT = process.env.PORT || 3000;

require('jest');

const url = `http://localhost:${PORT}`;

const exampleUser = {
  username: 'test name',
  email: 'test@email.com',
  password: '1234',
};

const exampleOrg = {
  name: 'example org',
  desc: 'this is a test',
};

const updateOrg = {
  name: 'update org',
  desc: 'update test',
};

describe('Org Routes', function() {
  beforeAll( done => {
    serverToggle.serverOn(server, done);
  });

  afterAll( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Org.remove({}),
    ])
      .then( () => done())
      .catch(done);
  });

  describe('POST /api/org', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.post(`${url}/api/org`)
          .send(exampleOrg)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(exampleOrg.name);
            expect(res.body.desc).toEqual(exampleOrg.desc);
            done();
          });
      });
    });



    describe('with INVALID usage', () => {
      it('should respond with a 400 if the request body is invalid', done => {
        superagent.post(`${url}/api/org`)
          .send({})
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });
    });
  });
        

  describe('GET /api/org/:orgId', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleOrg.userID = this.tempUser._id.toString();
      new Org(exampleOrg).save()
        .then( org => {
          this.tempOrg = org;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleOrg.userID;
    });
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.get(`${url}/api/org/${this.tempOrg._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(exampleOrg.name);
            expect(res.body.desc).toEqual(exampleOrg.desc);
            done();
          });
      });
    });

    describe('with invalid usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.get(`${url}/api/org/12345`)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            console.log(err.message);
            expect(res.status).toEqual(404);
            expect(err.message).toEqual('Not Found');
            done();
          });
        
      });

      
        

      it('should respond with a 401 if no token was provided', done => {
        superagent.get(`${url}/api/org/${this.tempOrg}`)
          .set({
            Authorization: ``,
          })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(err.message).toEqual('Unauthorized');
            done();
          });
      });  
    });
  });

  describe('PUT /api/org/:orgId', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleOrg.userID = this.tempUser._id.toString();
      new Org(exampleOrg).save()
        .then( org => {
          this.tempOrg = org;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleOrg.userID;
    });
    describe('with VALID usage', () => {
      it('should return a 200 status code for valid requests', done => {
        superagent.put(`${url}/api/org/${this.tempOrg._id}`)
          .send(updateOrg)
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).toEqual(200);
            expect(res.body.name).toEqual(updateOrg.name);
            expect(res.body.desc).toEqual(updateOrg.desc);
            done();
          });
      });
    });

    describe('with INVALID usage', () => {
      it('should respond with a 404 for an ID that is not found', done => {
        superagent.put(`${url}/org/12345`)
          .send(updateOrg)
          .set({
            Authorization: `Beaer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(404);
            expect(err.message).toEqual('Not Found');
            done();
          });
      });

      it('should respond with a 400 if no body is provided', done => {
        superagent.put(`${url}/api/org/${this.tempOrg._id}`)
          .send({})
          .set({
            Authorization: `Bearer ${this.tempToken}`,
          })
          .end((err, res) => {
            expect(res.status).toEqual(400);
            expect(err.message).toEqual('Bad Request');
            done();
          });
      });

      it('should respond with a 401 if no token was provided', done => {
        superagent.put(`${url}/api/org/${this.tempOrg._id}`)
          .send(updateOrg)
          .set({
            Authorization: ``,
          })
          .end((err, res) => {
            expect(res.status).toEqual(401);
            expect(err.message).toEqual('Unauthorized');
            done();
          });
      });  
    });
  });

  describe('DELETE /api/org/:orgId', () => {
    beforeEach( done => {
      new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
    });

    beforeEach( done => {
      exampleOrg.userID = this.tempUser._id.toString();
      new Org(exampleOrg).save()
        .then( org => {
          this.tempOrg = org;
          done();
        })
        .catch(done);
    });

    afterEach( () => {
      delete exampleOrg.userID;
    });
    describe('with VALID usage', () => {
      it('should return a 204 when item has been deleted', done => {
        superagent.delete(`${url}/api/org/${this.tempOrg._id}`)
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