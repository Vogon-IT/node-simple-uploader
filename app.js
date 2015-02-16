var fs = require('fs'),
  chokidar = require('chokidar'), // https://github.com/paulmillr/chokidar
  request = require('request'), // https://www.npmjs.com/package/request
  config = require('./config');

var watcher = chokidar.watch(config.photoFolder, {
  ignored: /[\/\\]\./, persistent: true
});

var log = console.log.bind(console);

watcher
.on('add', function(path) {
    log('File', path, 'has been added');

    if (!path.match(/\.jpg$/i)) return false;

    var r = request.post(config.url + 'photos.json', function optionalCallback(err, res, body) {
      if (res) log('File', path, 'has uploaded. Status code', res.statusCode);
      if (err) log('Upload failed:', err);

      // remove photo if keep image is false and upload is successful
      if (res.statusCode === 201 && !config.keepImage) {
        fs.unlink(path);
      }

    }).auth(config.username, config.password); // if 401

    // set form data for upload
    var form = r.form();
    form.append('utf8', '✓');
    form.append('photo[image]', fs.createReadStream(path));

  })
  .on('unlink', function(path) {
    log('File', path, 'has been removed');
  })
  .on('error', function(error) {
    log('Error happened', error);
  })
  .on('ready', function() {
    log('Initial scan complete. Ready for changes.');
  });

console.log('Node simple uploader started.');
