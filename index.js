var xal = require('../../xal-javascript');
var youtube = require('./youtube');
var _ = require('underscore');

xal.on('xi.event.input.text', function(state,next){
    var texts = state.get('xi.event.input.text');
    var text = _.reduce(texts, function(memo, value) {
        if (memo.certainty > value.certainty) {
            memo = value;
        }
        return memo;
    });

    //Provide the same interface as in Xi 1.0
    var match = text.value.match(/^play.*?(youtube)?(.*)/i);
    if (match) {
	if (match[2].length === 0) {
	    youtube.play();
	}
        else {
            if (youtube.state.playing) {
                youtube.pause();
            }
            xal.createEvent('xi.event.output.text', function(state, done) {
                state.put('xi.event.output.text', 'Playing \'' + match[2] + '\'');
                youtube.add(match[2]);
                done(state);
            });
        }
	return;
    }
    if (text.value.match(/stop playing/i)) {
	youtube.pause();
	return;
    }
    if (text.value.match(/\pause\b/i)) {
	youtube.pause();
	return;
    }
    next(state);
});

xal.start({
    name: 'Music'
});
