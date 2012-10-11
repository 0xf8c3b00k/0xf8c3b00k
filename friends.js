var https = require('https'),
    USERCONFIG = require('./config.js').user_config();

var error = function(data) {
  console.log(JSON.stringify(data));
};

var listFriends = function(data) {
  if (data.hasOwnProperty('data')) {
    var d = data['data'];
    d.forEach(function(v) {
      console.log('%d - %s', v.id, v.name);
    });
  } else if (data.hasOwnProperty('error')) {
    // Print error message
    console.log('Error!');
    console.log('Message: %s', data.error.message);
  } else {
    console.log('error');
  }
  process.exit(0);
};

var getFriendsList =  function(scall_back, fcall_back) {
    var opt = {
    host: 'graph.facebook.com',
    path: '/me/friends?access_token=' + USERCONFIG['fb_auth_token']
  };

  https.get(opt, function(resp) {
    var jsonData = '',
        cb = (resp.statusCode == 200) ? scall_back : fcall_back;

    resp.on('data', function(d) {
        jsonData = jsonData + d.toString('utf8');
    });

    resp.on('end', function() {
        cb(JSON.parse(jsonData));
    });

  });
};

exports.run = function(progOpt, cmdArg) {
  if (cmdArg.length == 0) {
    getFriendsList(listFriends, error);
  }
};
