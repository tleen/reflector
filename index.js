'use strict';

var express= require('express'),
pkg = require('./package.json'),
_ = require('underscore');

module.exports = function(config){
  var configuration = _.defaults({}, config, {
   // add defaults here
    errors : {}
  });

  var app = express();
  app.use(express.bodyParser());

  app.all('*',function(req, res){
    // bounce as error  
    var meta = _.extend({date : new Date()}, _.pick(req, 'path'));
    var response = _.extend({ _meta : meta}, req.query, req.body);
    res.json(response);
  });

  app.use(app.router);
  app.version = pkg.version;
  return app;
};
