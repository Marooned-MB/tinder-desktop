(function() {
  var module = angular.module('tinder-desktop.common', []);

  module.controller('MenuController', function($scope) {
    $scope.getCookie = function(cookieName) {
      return localStorage[cookieName];
    };
  });

  module.filter('distanceToUnits', function(Settings) {
    return function(distanceMi) {
      if (Settings.get('distanceUnits') == 'mi') {
        return distanceMi + ' mi';
      } else {
        return Math.round(distanceMi * 1.60934) + ' km';
      }
    };
  });

  module.filter('bdayToAge', function() {
    return function(bday) {
      return moment.duration(moment().diff(moment(bday))).years();
    };
  });

  module.filter('timeFromNow', function() {
    return function(time) {
      return moment(time).fromNow();
    };
  });

  module.filter('timeToLocalized', function () {
    return function(time) {
      return moment(time).format('L HH:mm');
    };
  });

  module.factory('download', function() {
    var factoryObj = {};

    factoryObj.single = function(url, user, callback) {
      const fs = require('fs');
      const request = require('request');
      const path = require('path');
      const destFolder = 'images';

      var filename = url.substring(url.lastIndexOf('/')+1);
      fs.existsSync(destFolder) || fs.mkdirSync(destFolder);	//make sure path exists
      var dest = path.normalize(destFolder + '/' + user.name + ' (' + (moment.duration(moment().diff(moment(user.birth_date))).years()) + ' lat) - [' + user._id.substr(0,6) + ']' + '-' + filename);

      var file = fs.createWriteStream(dest);
      var sendReq = request.get(url);

      // verify response code
      sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
          if (callback) {
            return callback('Response status was ' + response.statusCode);
          }
        }
      });

      // check for request errors
      sendReq.on('error', function (err) {
        fs.unlink(dest);

        if (callback) {
          return callback(err.message);
        }
      });

      sendReq.pipe(file);

      file.on('finish', function() {
        file.close(callback);  // close() is async, call callback after close completes.
      });

      file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)

        if (callback) {
          return callback(err.message);
        }
      });
    };

    return factoryObj;
  });
})();
