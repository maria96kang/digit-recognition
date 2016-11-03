var convnetjs = require('convnetjs');
var fs = require('fs');
var path = require('path');

var dataFileBuffer = fs.readFileSync(path.join(__dirname, 'data/train-images-idx3-ubyte'));
var labelFileBuffer = fs.readFileSync(path.join(__dirname, 'data/train-labels-idx1-ubyte'));

var DATA_OFFSET = 16; 
var LABEL_OFFSET = 8; 
var IMAGE_SIZE = 28;
var TRAINING_IMAGE_COUNT = 60000;

var labeledDigit = function(image, label) {
	this.image = image;
	this.label = label;
};

module.exports = {
	IMAGE_SIZE: 28,
	initNetwork: function() {
		var layerDefs = [];
		layerDefs.push({type:'input', out_sx:24, out_sy:24, out_depth:1});
		layerDefs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
		layerDefs.push({type:'pool', sx:2, stride:2});
		layerDefs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
		layerDefs.push({type:'pool', sx:3, stride:3});
		layerDefs.push({type:'softmax', num_classes:10});

		var net = new convnetjs.Net();
		net.makeLayers(layerDefs);
		return net;
	},
	parseTrainingData: function() {
		var digits = [];

		for (var imageIndex = 0; imageIndex < TRAINING_IMAGE_COUNT; imageIndex++) {
			var image = [];
			for (var pos = 0; pos < IMAGE_SIZE * IMAGE_SIZE; pos++) {
				image.push(dataFileBuffer[DATA_OFFSET + imageIndex * IMAGE_SIZE * IMAGE_SIZE + pos]);
			}
			digits.push(new labeledDigit(image, labelFileBuffer[imageIndex + LABEL_OFFSET]));
		}

		return digits; 
	},
	trainNetwork: function(trainer, digits) {
		console.log('Training network...');
		digits.slice(0, TRAINING_IMAGE_COUNT).forEach(function (digit, index) {
			var vol = new convnetjs.Vol(IMAGE_SIZE, IMAGE_SIZE, 1);
			vol.w = digit.image; 
			trainer.train(vol, digit.label);
			index && index % 1000 == 0 && console.log('trained ' + index + ' images');
		});
		console.log('Training took ' + process.uptime() + ' seconds.');
	}
};
