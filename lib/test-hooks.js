'use strict';

const User = require('../model/user.js');

const hooks = module.exports = {};

hooks.exampleUser = {
  username: 'orgtestuser',
  password: 'password~',
  email: 'orgtestemail@gmail.com',
};

hooks.createExUser = function (done) {
  new User(hooks.exampleUser)
    .generatePasswordHash(hooks.exampleUser.password)
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