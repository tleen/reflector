'use strict';

var moment = require('moment'),
pkg = require('../package.json'),
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

    describe('structure', function(){
      it('should have meta info', function(done){      
	client.get(testUrl(''), function(err, response, json){
	  if(err) return done(err);
	  json.should.be.an.Object.and.have.property('_meta');
	  return done();
	});
      });

      describe('meta info', function(){
	it('should have properties', function(done){
	  client.get(testUrl(''), function(err, response, json){
	    if(err) return done(err);
	    json._meta.should.be.an.Object.and.have.properties('date', 'path');
	    return done();
	  });
	});

	it('should have parsable date', function(done){
	  client.get(testUrl(''), function(err, response, json){
	    if(err) return done(err);
	    json._meta.date.should.be.a.String;
	    var m = moment(json._meta.date);
	    m.isValid().should.be.true;
	    return done();
	  });
	});

      });
    });

    describe('returned content',function(){
      describe('empty input', function(){	
	it('should return just meta', function(done){      
	  client.get(testUrl(''), function(err, response, json){
	    if(err) return done(err);
	    _.omit(json, '_meta').should.be.empty;
	    return done();
	  });
	});

	it('should have "/" as _meta.path', function(done){      
	  client.get(testUrl(''), function(err, response, json){
	    if(err) return done(err);
	    json._meta.path.should.equal('/');
	    return done();
	  });
	});
      });


      var tests = [
	{first: 1, second : 2, third : 3},
	{'a string' : 'a value'},
	{'a deeper object' : {'key one' : 'value one', key2 : 2}}
      ];
      describe('http method',  function(){
	describe('GET', function(){
	  tests.forEach(function(test, i){
	    it('should match for test #' + i, function(done){
	      client({
		uri : testUrl('test/get/' + i),
		method : 'GET',
		qs : test}, function(err, response, json){
		  if(err) return done(err);
		  _.omit(json,'_meta').should.eql(test);
		  return done();
	      });	      
	    });
	  });
	});

	describe('POST', function(){
	  tests.forEach(function(test, i){
	    it('should match for test #' + i, function(done){
	      client({
		uri : testUrl('test/post/' + i),
		method : 'POST',
		form : test}, function(err, response, json){
		  if(err) return done(err);
		  _.omit(json,'_meta').should.eql(test);
		  return done();
	      });	      
	    });
	  });
	});
      });

    });
  });

  describe('forced errors', function(){

  });

  

  after(function(){
    reflector.listen(4000);
  });

});
