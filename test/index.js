'use strict';

var async = require('async'),
moment = require('moment'),
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


var port = 8111;
var testUrl = _.partial(url.resolve, 'http://localhost:' + port);
var client = request.defaults({json : true});

describe('server', function(){

  describe('response JSON',function(){    
    var reflector = require('..')({port : port});
    before(reflector.start);

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
	{'a deeper object' : {'key one' : 'value one', key2 : 2}},
	{'date' : (new Date()).toString()}
      ];
      describe('http method',  function(){
	['GET','PUT','DELETE'].forEach(function(method){
	  describe(method, function(){
	    tests.forEach(function(test, i){
	      it('should match for test #' + i, function(done){
		client({
		  uri : testUrl('test/get/' + i),
		  method : method,
		qs : test}, function(err, response, json){
		  if(err) return done(err);
		  _.omit(json,'_meta').should.eql(test);
		  return done();
		});	      
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
    after(reflector.stop);

  });

  describe('errors', function(){
    var reflector = require('..')({errors : true, port : port});
    before(reflector.start);

    it('should return ~5% errors', function(done){
      this.timeout(10000);
      async.times(1000, function(i, next){
	client.get(testUrl(''), function(err, response, json){
	  if(err) return next(err);
	  else return next(null, response.statusCode);
	});
      }, function(err, codes){
	var codeCount = _.countBy(codes, function(code){ return code; });
	var errCount = _.chain(codeCount).omit('200').reduce(function(sum, count){ return (sum + count); }, 0).value();
	errCount.should.be.approximately(50,15);
	return done(err);
      });
    });

    after(reflector.stop);

  });

  
});
