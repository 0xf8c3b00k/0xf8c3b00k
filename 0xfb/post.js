var https = require('https');
var USERCONFIG = require('./config.js').user_config();

var post = function(program_option, command_argument) {

  if(command_argument.join(' ').trim() === '') {
    console.log('Oops! Even you are a hacker, you should say something!');
    process.exit(0);
  } else {
    var message = command_argument.join(' ');
  }

  var request_OK = 200;
  var profile_id = 'me';  // FIXME: why can't we post to others' wall?

  var options = {
    host: 'graph.facebook.com',
    port: 443,
    path: profile_id + '/feed' + '?access_token=' + USERCONFIG['fb_auth_token'],
    method: 'POST'
  };

  var req = https.request(options, function(res) {
    // debug message
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));

    // set ending to utf8 in advance, or we will get a `buffer` object
    res.setEncoding('utf8');

    res.on('data', function(d) {
      // debug message
      // console.log(d);

      if (res.statusCode === request_OK) {
        console.log('Post message successfully with id = ' + JSON.parse(d).id);
      } else {
        console.log('Fail to post message, status code = ' + res.statusCode);
        // [TODO] Handle error here, for now, just dump raw messages
        console.log(d);
      }
    });

    res.on('end', function() {
      process.exit(0);
    });
  });

  // Handle errors encountered during the request
  req.on('error', function(e) {
    console.log('Problem with request: ' + e.message);
  });

  req.write("message=" + message);
  req.end();
};

exports.run = function(program_option, command_argument) {
  post(program_option, command_argument);
}
