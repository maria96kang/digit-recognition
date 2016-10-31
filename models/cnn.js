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
		/*
		layerDefs.push({type:'input', out_sx:24, out_sy:24, out_depth:1}); // declare size of input
		// output Vol is of size 32x32x3 here
		layerDefs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
		// the layer will perform convolution with 16 kernels, each of size 5x5.
		// the input will be padded with 2 pixels on all sides to make the output Vol of the same size
		// output Vol will thus be 32x32x16 at this point
		layerDefs.push({type:'pool', sx:2, stride:2});
		// output Vol is of size 16x16x16 here
		layerDefs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
		// output Vol is of size 16x16x20 here
		layerDefs.push({type:'pool', sx:3, stride:3});
		// output Vol is of size 8x8x20 here
		layerDefs.push({type:'softmax', num_classes:10});
		// output Vol is of size 1x1x10 here
		*/
		layer_defs.push({type:'input', out_sx:24, out_sy:24, out_depth:1});
		layer_defs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
		layer_defs.push({type:'pool', sx:2, stride:2});
		layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
		layer_defs.push({type:'pool', sx:3, stride:3});
		layer_defs.push({type:'softmax', num_classes:10});

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
