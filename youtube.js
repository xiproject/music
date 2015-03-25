var childProcess = require('child_process');
var spawn = childProcess.spawn;
var exec = childProcess.exec;
var xal = require('../../xal-javascript');
var _ = require('underscore');
var async = require('async');

var vlc;

async.waterfall([
    function detectVlc(callback) {
        exec('which vlc', function(err, stdout, stderr) {
            var vlcExec;
            if (err) {
                xal.log.info('`which vlc` failed, looking for fallbacks.');
            }
            if (stdout.length !== 0) {
                callback(null, stdout);
            } else if (process.platform === 'darwin') {
                // 'vlc' not found on path, fallback to usual OS X installed VLC
                callback(null, '/Applications/VLC.app/Contents/MacOS/VLC');
            } else {
                xal.log.warn('Couldn\'t find VLC. Falling back to `vlc`.');
                callback(null, 'vlc');
            }
        });
    },
    function runVlc(vlcExec, callback) {

        vlc = spawn(vlcExec, ['-I', 'rc', '--no-video'], {
            env: process.env
        });

        vlc.on('error', function(err) {
            xal.log.fatal(err);
            if (err.code === 'ENOENT') {
                xal.log.fatal('Couldn\'t start VLC. Please make sure it is installed and in your path. See http://www.videolan.org/vlc/ for more details.');
            } else {
                xal.log.fatal('VLC crashed. Stopping music agent...');
            }
            process.exit(1);
        });

        callback();
    }
]);

function getUrlForQuery(query, cb) {

    var maxTries = 3, tries = 0;

    // Put this into a function so we can retry on failure
    var queryHelper = function() {

        var youtubeDl = spawn('youtube-dl', ['-f', '140', '-g', 'ytsearch:' + query], {
            env: process.env
        });

        var url = '';

        youtubeDl.stdout.on('data', function(data) {
            url += data;
        });

        youtubeDl.on('error', function(err) {
            xal.log.fatal(err);
            if (err.code === 'ENOENT') {
                xal.log.fatal('Couldn\'t find youtube-dl. Please make sure it is installed and in your path.\n\nFor example, `pip install youtube-dl`. See http://rg3.github.io/youtube-dl/ for more details.');
            } else {
                xal.log.fatal('youtube-dl encountered an error. Please make sure you have version 2015.01.11 or newer (youtube-dl --version).');
            }
            process.exit(1);
        });

        youtubeDl.stderr.on('data', function(data) {
            xal.log.warn({'youtube-dl': data});
        });

        youtubeDl.on('close', function(code) {
            if (code !== 0) {
                if (tries != maxTries) {
                    xal.log.debug('Couldn\'t get url, retrying');
                    tries += 1;
                    queryHelper();
                }
            } else {

                cb(null, url);
                xal.log.debug({
                    url: url
                }, 'Found url');
            }
        });
    };

    queryHelper();
}

var state = {
    playing: false
};

function play() {
    state.playing = true;
    vlc.stdin.write('play\n');
}

function pause() {
    state.playing = false;
    vlc.stdin.write('pause\n');
}

function add(query) {
    getUrlForQuery(query, function(err, url) {
        if (!err) {
            vlc.stdin.write('add ' + url + '\n');
            play();
        }
    });
}

module.exports = {
    play: play,
    pause: pause,
    add: add,
    state: state
};
