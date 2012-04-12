var https = require('https');
var CONFIG = require('./config.js').app_config();

var getTokenWithUsersHelp = function(success_callback,
                                     failure_callback) {
  var token = '';

  // Long lived http connection.
  var waitServerResult = function() {
    https.get({
      'host': 'zeroxf8c3b00k.herokuapp.com',
      'path': '/0xfb_client_wait?t=' + token
    }, function(resp) {
      var result = '';
      resp.on('data', function(d) {
        result = result + d.toString('utf8');
      });

      resp.on('end', function() {

        console.log('Auth result: %s', result); // Debug message.

        // Parse result.
        var r = JSON.parse(result);
        if (r.success > 0) {
          success_callback(
            r.payload.access_token,
            r.payload.expires
          );
        } else {
          failure_callback();
        }
      });
    });
  };

  // Fetch token.
  https.get({
    'host': 'zeroxf8c3b00k.herokuapp.com',
    'path': '/0xfb_client_token'
  }, function(resp) {
    resp.on('data', function(d) {
      token = token + d.toString('utf8');
    });
    resp.on('end', function() {
      console.log("Use browser to open: ");
      console.log("  https://zeroxf8c3b00k.herokuapp.com/" + 
                  "auth_client_request?t="+token);
      
      // Wait for result.
      waitServerResult();
    });
  });

}

exports.getAuthToken = function(success_callback,
                                failure_callback) {
  var USER_CONFIG = require('./config.js').user_config();

  if (USER_CONFIG.hasOwnProperty('fb_auth_token')
      && USER_CONFIG['fb_auth_token_expire'] > Date.now()/1000) {
    // Success callback
    success_callback(USER_CONFIG['fb_auth_token'],
                     USER_CONFIG['fb_auth_token_expire']);
  } else {
    getTokenWithUsersHelp(
      function(access_token, expires_in) { // When success.

        // Record to user config.
        USER_CONFIG['fb_auth_token'] = access_token;
        USER_CONFIG['fb_auth_token_expire'] = 
          parseInt(Date.now()/1000) + parseInt(expires_in);

        // Success callback
        success_callback(USER_CONFIG['fb_auth_token'],
                         USER_CONFIG['fb_auth_token_expire']);
      },
      failure_callback);
  }
};