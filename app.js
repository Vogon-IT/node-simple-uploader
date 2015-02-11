var fs = require('fs'),
  util = require('util'),
  // request = require('request-json'), // https://www.npmjs.com/package/request-json
  request = require('request'), // https://www.npmjs.com/package/request
  jsdom = require('jsdom').jsdom, // https://www.npmjs.org/package/jsdom
  RSVP = require('rsvp'); // promise https://www.npmjs.org/package/rsvp

var config = require('./config');

var lastestFile = '';

fs.exists(config.photoFolder, function(exists) {
  if (!exists) return console.log('ERROR! photoFolder not found.');
});

fs.watch(config.photoFolder, function(event, filename) {
  var photo = config.photoFolder + filename;

  fs.exists(photo, function(exists) {
    if (!exists || !photo.match(/\.JPG$/i) || lastestFile == photo) return false;
    console.log(photo);
    lastestFile = photo;

    setTimeout(function() {
      var r = request.post(config.url + 'photos.json', function optionalCallback(err, res, body) {
        console.log(res.statusCode);

        if (err) {
          return console.log('upload failed:', err);
        }

        if (res.statusCode === 201 && !config.keepImage) { // remove photo if response 201 OK
          fs.unlink(photo);
        }

      });

      var form = r.form();
      form.append('utf8', '✓');
      form.append('photo[image]', fs.createReadStream(photo));
    }, 1000);



  });
});

console.log('node simple uploader started...');
