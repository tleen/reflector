Reflector
==========

[![Build Status](https://travis-ci.org/tleen/reflector.png?branch=master)](https://travis-ci.org/tleen/reflector)

Simple http server used as a stub for testing, will return any (GET/POST) parameters sent with some meta data as JSON. This allows you to define API calls on the fly, running requests through http, while controlling the expected output.

The server may optionally be configured to send some http errors at times replacing the expected response.

## Configuration
- **errors** If the server should return errors randomly (~5% of the time), defaults to *false*.
- **port** Port server should use for listening, defaults to *80*.

## Meta Data

Meta data is helpful for informing tests and debugging. The returned JSON object will also have a property '_meta'. This property contains three values:

- **date** When this response was generated.
- **path** The request path for this response.
- **count** Number of times this path has been requested during the lifetime of the server.

## Example

Here is reflector being used in a [mocha](http://mochajs.org/)/[should](https://github.com/visionmedia/should.js/)/[request](https://github.com/mikeal/request) test (see a more in-depth example at [retainer](https://github.com/tleen/retainer/blob/master/test/index.js)):

```javascript

describe('example test', function(){
  var reflector = require('reflector'),
  request = require('request');
  
  var server = reflector({port : 8001});
  before(server.start);
 
  it('should return name-value pairs', function(done){
    request({
      url : 'http://localhost:8001/some/path?someproperty=somevalue&anotherproperty=anothervalue',
      json : true}, function(err, response, json){
	  if(err) return done(err);
	  json._meta.should.be.an.Object.and.have.properties('count', 'date', 'path');
//
// Returned object is:
// { _meta: 
//  { date: '2014-02-16T17:53:27.624Z', // whatever the request time is
//    path: '/some/path', // arbritary path used
//    count: 1 }, // first time this path was used
//  someproperty: 'somevalue',
//  anotherproperty: 'anothervalue' }

	  return done();
    });
  });
  
  after(server.stop);
});

```

