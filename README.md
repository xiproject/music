# Music

The music agent for [Zeus](http://xiproject.github.io/zeus). This plays music by searching for and downloading it from YouTube.

## Prerequisites

- Install [youtube-dl] >= 2015.01.11.
- Install [VLC] and make sure it's on your path.
- On OS X, install VLC as usual.
- [bunyan](https://github.com/trentm/node-bunyan) for pretty printing logs.

[youtube-dl]: https://github.com/rg3/youtube-dl
[VLC]: http://www.videolan.org/vlc/

## Install

Clone the repo, `cd` into it, and run `npm install`.

## Run

```sh
$ node index.js --logfile music.log 2>&1 | bunyan
```
