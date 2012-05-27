

exports.run = function(progOpts, cmdArgv, rawArgv) {
  var argv = optimist(cmdArgv).
    usage("Usage: ./0xfb comment [article id|@number] [-m|--message] comment")
    .describe('message', 'comment text.')
    .string('message') // treat these argvs as string
    .alias('message', 'm') // --message, -m
    .argv;
  
  getFeed(doPrintFeed.bind(this, end), end, argv['_'][0] || 'me');
};