var USERCONFIG  = require('./config.js').user_config(),
    uploadphoto = require('./upload_photo.js'),
    https       = require('https'),
    optimist    = require('optimist'),
    path        = require('path'),
    querystring = require('querystring');

var post = function(program_option, command_argument, raw_argv) {

  // Parse only command arguments, so we can exclude the 'post' token,
  // any token other then options will be treated as filename, inlcude '-'
  // token.
  var argv = optimist(command_argument)
               .usage("Usage: ./0xfb post --to [ID/username] --link [link] --message [message]")
               .describe('to', 'ID/username of the target wall')
               .describe('link', 'link to post')
               .describe('message', 'message to post')
               .string('to', 'link', 'message') // treat these argvs as string
               .check(function (argv) {
                 if (!('link' in argv) && !('message' in argv) && !(argv['_'].length > 0)) {
                   throw 'Either link, message, or filename argument is required';
                 }
               })
               .default('to', 'me') // post to the user's own wall if
                                    // `to` is not specified
               .alias('to', 't') // --to, -t
               .alias('link', 'l') // --link, -t
               .alias('message', 'm') // --message, -m
               .argv;

  if (argv['_'].length > 0) {
    // Contains filenames, handle it with upload.
    uploadphoto.upload(argv);
  } else {
    // Text only, as a status update.
    doPost(argv);
  }
};

var doPost = function(argv) {

  var request_OK = 200;

  var post_data = querystring.stringify({
    'link': argv.link,
    'message': argv.message,
    'access_token': USERCONFIG['fb_auth_token'],
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
