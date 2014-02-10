'use strict';

var express = require('express'),
http = require('http'),
pkg = require('./package.json'),
_ = require('underscore');

module.exports = function(config){
  var configuration = _.defaults({}, config, {
   // add defaults here
    errors : false,
    port : 80
  });

  var app = express();
  app.use(express.bodyParser());

  // if errors is true
  var errorGenerate = (function(hasErrors){
    if(!hasErrors) return function(req, res, next){ return next(); };
    else return function(req, res, next){
      if(_.random(20)) return next();
      
      res.statusCode = _.sample([400, 401, 403, 404, 405, 500, 501, 502, 503, 504]);
      res.send('Reflector has returned a randomly generated error, ' + res.statusCode);
    };
  })(configuration.errors);
  
  app.all('*', errorGenerate, function(req, res){
    var meta = _.extend({date : new Date()}, _.pick(req, 'path'));
    var response = _.extend({ _meta : meta}, req.query, req.body);
    return res.json(response);
  });

  app.use(app.router);

  var server = http.createServer(app);

  return {
    start : function(callback){
      return server.listen(configuration.port, callback);
    },
    stop : function(callback){
      return server.close(callback);
    },
    version : pkg.version
  };
};
