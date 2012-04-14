var USERCONFIG = require('./config.js').user_config();
var https = require('https');
var optimist = require('optimist');

// -----------------------------------------------------------------------------

var doPrintFeed = function(cb, data) {
  var postList = data.data;
  USERCONFIG['fb_prev_to_list'] = {};

  for (var i = postList.length - 1; i >= 0; --i) {
    var post = postList[i];

    // Record status, started from 1
    USERCONFIG['fb_prev_to_list'][i+1] = post.id;

    console.log('@%d', i+1);
    console.log('From: %s', post.from.name);

    // 'type' of a post can be: status, photo, video, link.   
    var type = post['type'];
    console.log('Type: %s', type);
    if (type == 'status') {
      console.log(post.message);
    } else if (type == 'photo') {
      console.log('Photo Link: %s', post.link);
    } else if (type == 'video') {
      console.log('Caption: %s', post.caption);
      if (post.hasOwnProperty('description'))
        console.log('Description:\n%s', post.description);
      console.log('Video Link: %s', post.source);
    } else if (type == 'link') {
      console.log('Name: %s', post.name);
      if (post.hasOwnProperty('description'))
        console.log('Description:\n%s', post.description);
      console.log('Link: %s', post.link);
    }
    
    // Lower Banner: Like, comment, share
    var lowerBanner = [];
    var lbMap = {
      'likes' : 'Like',
      'comments': 'Comment',
      'shares': 'Share'
    };

    for (var j = 0; j < Object.keys(lbMap).length; ++j) {
      var key = Object.keys(lbMap)[j];
      if (post.hasOwnProperty(key)) {
        lowerBanner.push(lbMap[key] + ': ' + post[key]['count']);
      }
    }
    if (lowerBanner.length > 0) {
      console.log(lowerBanner.join(', '));
    }      
    // End of lower banner.

    console.log('--'); // End
  }

};

var getFeed = function(suc_cb, fail_cb, id) {
  var reqPath = id ? '/'+id+'/feed' : '/me/home';
  https.get({
    host: 'graph.facebook.com',
    path: reqPath + '?access_token=' + USERCONFIG['fb_auth_token'],
  }, function(resp) {
    var sc = resp.statusCode;
    if (sc == 200) {
      outputFunc = console.log;
    } else {
      outputFunc = console.error;
      console.error('Error, code: %d', sc);
    }

    var dataInJson = '';

    resp.on('data', function(d) {
        dataInJson = dataInJson + d.toString('utf-8');
    });

    resp.on('end', function() {
      if (sc == 200) {
        suc_cb(JSON.parse(dataInJson));
      } else {
        console.error(dataInJson);
        fail_cb(JSON.parse(dataInJson));
      }
    });

  });
};

var end = function() {
  process.exit(0);
};

exports.showUserNews = function(argv) {
  getFeed(doPrintFeed.bind(this, end), end);
};

exports.run = function(progOpts, cmdArgv, rawArgv) {
  var argv = optimist(cmdArgv).
    usage("Usage: ./0xfb wall [ID/username]").
    argv;
  
  getFeed(doPrintFeed.bind(this, end), end, argv['_'][0] || 'me');
};