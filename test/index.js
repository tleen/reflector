'use strict';

var pkg = require('../package.json'),
should = require('should');

describe('versioning', function(){
  var bounceback = require('..')();
  it('should have a version matching package', function(){
    bounceback.should.have.property('version').and.be.exactly(pkg.version);
  });
});
