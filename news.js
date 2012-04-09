var USERCONFIG = require('./config.js').user_config();
var https = require('https');
var optimist = require('optimist');


var doPrintFeed = function(cb, data) {
  var postList = data.data;
  USERCONFIG['fb_prev_to_list'] = {};

  for (var i = 0; i < postList.length; ++i) {
    var post = postList[i];

    // Record status, started from 1
    USERCONFIG['fb_prev_to_list'][i+1] = post.id;

    console.log('#%d', i+1);
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
    
    // Collect like, comments and shares
    if (post.hasOwnProperty('actions')) {
      var likes = 0,
          comments = 0,
          share = 0;
      var act = post['actions'];
      for (var a = 0; a < act.length; ++a) {
        var name = act[a]['name'];
        if (name == 'Share')
          share++;
        else if (name == 'Comment')
          comments++;
        else if (name == 'Like')
          likes++;
      }
      var outputStrings = [];
      if (likes > 0)
        outputStrings.push('Likes: ' + likes);
      if (comments > 0)
        outputStrings.push('Comments: ' + comments);
      if (share > 0)
        outputStrings.push('Share: ' + share);
      console.log(outputStrings.join(' '));
    }
    console.log('--'); // End
  }

};

var printFeed = function(suc_cb, fail_cb, id) {
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

exports.run = function(progOpts, cmdArgs, rawArgv) {
  var end = function() {
    process.exit(0);
  };

//    var argv = optimist(rawArgv)
//                 .usage("Usage: ./0xfb post --event [Article id|#number] --who [Username|User id]")
//                 .describe('to', 'ID/username of the target wall, or #-started pr')
//                 .describe('message', 'message to post')
//                 .string('to', 'message') // treat these two argv as string
//                 .demand('message') // `messsage` is required
//                 .default('to', 'me') // post to the user's own wall if
//                                      // `to` is not specified
//                 .alias('message', 'm') // --message, -m
//                 .alias('to', 't') // --to, -t
//                 .argv;

  printFeed(doPrintFeed.bind(this, end), end);
};