'use strict';

const hooks = require('../lib/test-hooks.js');
require('jest');

describe('Test Hook Module', function() {
  describe('#createUser function', function() {
    it('should create an example user', done => {
      let res = hooks.createUser();
      console.log(hooks.createUser());
      expect(User.name).toEqual(hooks.exampleUser.name);
      done();
    });
  });
});