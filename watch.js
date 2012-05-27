var CONFIG     = require('./config.js').app_config();
var USERCONFIG = require('./config.js').user_config();
var https      = require('https');

var userId = '';
var getUserIdThenWatch = function() {
  if (userId !== '') {
    watch();
  } else {
    https.get({
      "host" : "graph.facebook.com",
      "path" : "/me/?access_token=" + USERCONFIG['fb_auth_token']
    }, function(resp) {
      var data = "";
      resp.on('data', function(d) {
        data += d.toString('utf8');
      });
      resp.on('end', function() {
        if (resp.statusCode == 200) {
          userId = JSON.parse(data)["id"];
          console.log("Id: " + userId);
          watch();
        } else {
          console.error("Fail to get userid, msg: " + data);
        }
      });
    });
  }
}

var watch = function() {
  // 1. Setup signal.
  // 2. Connect to app server, then long polling until be interrupted.
  https.get({
    'host': CONFIG['app_server'],
    'path': '/0xfb_client_watch?uid=' + userId
  }, function(resp) {
    var data = '';
    if (resp.statusCode == 200) {
      resp.on('data', function(buf) {
        data += buf.toString('utf8');
      });
      resp.on('end', function() {
        console.log('An update: ' + data);
        watch();  // Start another watch.
      });
    } else {
      console.error('Status code: ' + resp.statusCode);
    }
  });
}

exports.run = function(program_option, command_argument, raw_argv) {
  getUserIdThenWatch();
}
