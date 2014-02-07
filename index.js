'use strict';

var pkg = require('./package.json'),
_ = require('underscore');

module.exports = function(config){


  var configuration = _.defaults({}, config, {
   // ad defaults here
  });

  return {
    version : pkg.version
  };

};
