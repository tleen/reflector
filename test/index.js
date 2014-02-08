'use strict';

var pkg = require('../package.json'),
request = require('request'),
should = require('should'),
url = require('url'),
_ = require('underscore');

describe('versioning', function(){
  var reflector = require('..')();
  it('should have a version matching package', function(){
    reflector.should.have.property('version').and.be.exactly(pkg.version);
  });
});

describe('server', function(){
  var reflector = require('..')();
  var port = 8111;

  var testUrl = _.partial(url.resolve, 'http://localhost:' + port);

  var client = request.defaults({json : true});

  before(function(){
    reflector.listen(port);
  });

  describe('response JSON',function(){    
    it('meta info', function(done){
      
      client.get(testUrl(''), function(err, response, json){
	if(err) return done(err);
	json.should.be.an.Object.and.have.properties('date', 'path');
	return done();
      });
    });
  });

  after(function(){
    reflector.listen(4000);
  });

});
