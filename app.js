var api = require('./controllers/api.js');
var convnetjs = require('convnetjs');
var bodyParser = require('body-parser');
var express = require('express');
var gm = require('gm');
var path = require('path')

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));
app.post('/guess', api.guess);

var server = app.listen(8080, function() {
	console.log('Express app listening on port ' + server.address().port + '...');
});