var USERCONFIG  = require('./config.js').user_config(),
    https       = require('https'),
    optimist    = require('optimist'),
    path        = require('path'),
    querystring = require('querystring');

var post = function(program_option, command_argument, raw_argv) {

  var argv = optimist(raw_argv)
               .usage("Example: ./index.js post --to '0xf8c3b00kCommunity' --message 'Hello, 0xfb!'")
               .describe('to', 'ID/username of the target wall')
               .describe('message', 'message to post')
               .string('to', 'message') // treat these two argv as string
               .demand('message') // `messsage` is required
               .default('to', 'me') // post to the user's own wall if
                                    // `to` is not specified
               .alias('message', 'm') // --message, -m
               .alias('to', 't') // --to, -t
               .argv;

  var request_OK = 200;

  var post_data = querystring.stringify({
    'access_token': USERCONFIG['fb_auth_token'],
    'message': argv.message,
  });

  var options = {
    host: 'graph.facebook.com',
    port: 443,
    path: path.join('/', argv.to, 'feed'),
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': post_data.length
    }
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

  req.write(post_data);
  req.end();
};

exports.run = function(program_option, command_argument, raw_argv) {
  post(program_option, command_argument, raw_argv);
}
