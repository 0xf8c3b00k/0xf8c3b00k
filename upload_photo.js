var https = require('https');
var http = require('http');
var crypto = require('crypto');
var fs = require('fs');
var USERCONFIG = require('./config.js').user_config();

var fieldMapper = {
  'message' : 'message'
};

// Make a multipart boundary.
var makeBoundary = function() {
  var hash = crypto.createHash('sha1');
  hash.update(Date.now() + '');
  return '----' + hash.digest('base64');
}

var makePostData = function(cfg) {
  var kvp = [];
  if (cfg.hasOwnProperty('message')) {
    kvp.push('message='+encodeURIComponent(cfg['message']));
  }
  return kvp.join('&');
}

var uploadFromFile = function(cb, filename, config) {
  uploadToWebsite(cb,
                  config,
                  fs.createReadStream(filename),
                  filename);
}

var uploadStdin = function(cb, config) {
  process.stdin.resume();
  uploadToWebsite(cb, config, process.stdin, '1.jpg');
}

var uploadToWebsite = function(cb, config, istream, filename) {

  var uploadPath = !config.hasOwnProperty('albumId') ?
    '/me/photos' : '/' + config['albumId'] + '/photos';

  var multipartBoundary = makeBoundary();

  var options = {
    host: 'graph.facebook.com',
    port: 443,
    path: uploadPath + '?access_token=' + USERCONFIG['fb_auth_token'],
    headers: {
      'Content-Type' : 'multipart/form-data; boundary=' + multipartBoundary
    },
    method: 'POST'
  };

  // Build request and handle response.
  var req = https.request(options, function(resp) {
    var success = false;
    if (resp.statusCode == 200) {
      console.log('Photo uploaded successfully');
      success = true;
    } else {
      console.log('Fail to upload photo, status code = ' + resp.statusCode);
      success = false;
    }

    // Print response data. Then end the process.
    resp.on('data', function(d) {
      if (success) {
        var j = JSON.parse(d.toString('ascii'));
        console.log('Photo ID: ' + j.id);
        console.log('Post ID: ' + j.post_id);
      } else {
        // Handle error.
        console.log(d.toString('ascii'));
      }
    });

    resp.on('end', function() {
      cb();
    });
  });

  // Send data section.
  Object.keys(config).forEach(function(v) {
    if (fieldMapper.hasOwnProperty(v)) {
      req.write('--' + multipartBoundary + '\r\n');
      req.write('Content-Disposition: form-data; name="' + fieldMapper[v] + '"\r\n');
      req.write('\r\n');
      req.write(config[v]);
      req.write('\r\n');
    }
  });

  // Here we start to redirect data to server.
  req.write('--' + multipartBoundary + '\r\n');
  req.write('Content-Disposition: form-data; name="image"; filename="' + filename + '"\r\n');
  req.write('Content-Type: image/jpeg\r\n');
  req.write('\r\n');

  // Read from stdin until reach end.
  istream.on('data', function(d) {
    req.write(d);
  });

  istream.on('end', function() {
    req.write('\r\n--' + multipartBoundary + '--\r\n');
    req.end();
  });
};

var upload = function(cb, cfg) {
  // Disable debug message.
  // console.log("config:");
  // console.log(JSON.stringify(cfg));

   if (cfg.hasOwnProperty('filename')) {
     var count = 0;
     cfg['filename'].forEach(function(v) {
       uploadFromFile(function() {
         count++;
         if (count == cfg['filename'].length) {
           cb();
         }
       }, v, cfg);
     });
   } else {
     // from standard in.
     uploadStdin(cb, cfg);
   }
}

exports.run = function(progOpt, cmdArgs) {
  var expecting = 'key';
  var key = ''
  var parsed = {};
  for (var i = 0; i < cmdArgs.length; ++i) {
    var v = cmdArgs[i];
    if (expecting == 'key') {
      if ((v == '--album')
          || (v == '--msg')
          || (v == '-m')) {
        expecting = 'value';
        key = v;
      }
      parsed[v] = '';
    } else {
      parsed[key] = v;
      expecting = 'key';
    }
  }

  var cfg = {};
  Object.keys(parsed).forEach(function(v) {
    if (v == '--album') {
      cfg['albumId'] = parsed[v];
    } else if (v == '--msg' || v == '-m') {
      cfg['message'] = parsed[v];
    } else {
      if (cfg.hasOwnProperty('filename')) {
        cfg['filename'].push(v);
      } else {
        cfg['filename'] = [v];
      }
    }
  });
  
  upload.bind(this, function() {
    process.exit(0);
  })(cfg);
}