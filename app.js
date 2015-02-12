var fs = require('fs'),
  util = require('util'),
  request = require('request'), // https://www.npmjs.com/package/request
  config = require('./config');

var lastestFile = ''; // watch is buggy and can trigger multiple times for one file with no reason

// check that photo folder folder exists
fs.exists(config.photoFolder, function(exists) {
  if (!exists) return console.log('ERROR! photoFolder not found.');
});

// start watching photo folder for changes
fs.watch(config.photoFolder, function(event, filename) {
  var photo = config.photoFolder + filename;

  // upload photo to rails app if it still exists, is jpeg file and is not same file as most recent photo
  fs.exists(photo, function(exists) {
    if (!exists || !photo.match(/\.jpg$/i) || lastestFile == photo) return false;
    lastestFile = photo;

    setTimeout(function() { // don't send broken photo
      var r = request.post(config.url + 'photos.json', function optionalCallback(err, res, body) {
        if (res) console.log('status code:', res.statusCode);
        if (err) console.log('upload failed:', err);

        // remove photo if keep image is false and upload is successful
        if (res.statusCode === 201 && !config.keepImage) {
          fs.unlink(photo);
        }

      }).auth(config.username, config.password); // auth if 401

      // set form data for upload
      var form = r.form();
      form.append('utf8', '✓');
      form.append('photo[image]', fs.createReadStream(photo));
    }, 1000);
  });
});

console.log('node simple uploader started...');