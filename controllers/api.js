var cnn = require('../models/cnn.js');
var convnetjs = require('convnetjs');
var express = require('express');
var gm = require('gm');
var PNG = require('pngjs').PNG

var digits = cnn.parseTrainingData();
var net = cnn.initNetwork();
var trainer = new convnetjs.SGDTrainer(net, {method: 'adadelta', l2_decay: 0.001,
                                    batch_size: 20});
cnn.trainNetwork(trainer, digits);

var resizeAndParse = function(dataUrl, callback) {
	dataUrl = dataUrl.replace('data:image/png;base64,', '');
  	var img = new Buffer(dataUrl, 'base64');
	gm(img).resize(28, 28).toBuffer('PNG', function(err, buffer) {
		if (err) {
			callback(err);
			return;
		}
		var png = new PNG();
	    png.parse(buffer, function (err, image) {
	      	if (err) {
	        	callback(err);
	        	return;
	      	}
	      	for (var i = 0; i < image.height; i++) {
	        	for (var j = 0; j < image.width; j++) {
	          		var idx = (image.width * i + j) << 2;
	         		process.stdout.write((image.data[idx + 3] >= 128 ? 1 : 0) + '');
	        	}
	        	console.log('');
	      	}
			var input = [];
			for (var i = 3; i < image.width * image.height * 4; i += 4) {
				input.push(image.data[i]);
			}
			var vol = new convnetjs.Vol(cnn.IMAGE_SIZE, cnn.IMAGE_SIZE, 1);
			vol.w = input;
			callback(null, vol);
		});
	});
};

exports.guess = function(req, res) {
	var dataUrl = req.body.image;
	resizeAndParse(dataUrl, function (err, input) {
		if (err) {
		  	res.json({error: err});
		  	return;
		}
		var result = net.forward(input);
		var bestProb = -1;
		var bestCandidate = -1;
		for (var j = 0; j < 10; j++) {
		  	if (result.w[j] > bestProb) {
		    	bestProb = result.w[j];
		    	bestCandidate = j;
		  	}
		  	console.log(result.w[j]);
		}
		res.json({result: bestCandidate});
	});

};

exports.train = function(req, res) {
	
};
