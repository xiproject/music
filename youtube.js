var spawn = require('child_process').spawn;
var xal = require('../../xal-javascript');

var env = {};

env = {
    http_proxy: 'http://10.3.100.207:8080',
    https_proxy: 'http://10.3.100.207:8080'
};

function merge_options(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
}

var vlc = spawn('vlc', ['-I', 'rc', '--no-video'], {
    env: merge_options(process.env, env)
});

var MAX_TRIES = 3;

function getUrlForQuery(query, cb) {

    var tries = 0;
    var queryHelper = function() {
        var youtube_dl = spawn('youtube-dl', ['-f', '140', '-g', query], {
            env: env
        });
        url = "";
        youtube_dl.stdout.on('data', function(data) {
            url += data;
        });

        youtube_dl.on('close', function(code) {
            if (code !== 0) {
                if (tries != MAX_TRIES) {
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

function play() {
    vlc.stdin.write('play\n');
}

function pause() {
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
    add: add
};
