/** @jsx React.DOM */

var mouseX = 0, 
	mouseY = 0, 
	mouseDown = 0;

var DigitRecognizer = React.createClass({
	clearCanvas: function() {
		var drawingArea = this.refs.drawingArea.getDOMNode();
    	var ctx = drawingArea.getContext('2d');
		ctx.clearRect(0, 0, drawingArea.width, drawingArea.height);
	},
	drawCanvas: function(x, y, size) {
		var drawingArea = this.refs.drawingArea.getDOMNode();
    	var ctx = drawingArea.getContext('2d');
		
		var r = 0, g = 0, b = 0, a = 255;
		ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
		ctx.beginPath();
		ctx.arc(x, y, size, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	},	
	getInitialState: function() {
		return{
			digit: -1,
			probability: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] 
		};
	},
	getMousePosition: function(e) {
		if (!e)
            var e = window.event;

        //console.log(e);

        if (e.offsetX) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        }
        else if (e.layerX) {
            mouseX = e.layerX;
            mouseY = e.layerY;
        }
	},
	initializeCanvas: function() {

		var drawingArea = this.refs.drawingArea.getDOMNode();
    	var ctx = drawingArea.getContext('2d');

        if (ctx) {
            // React to mouse events on the canvas, and mouseup on the entire document
            drawingArea.addEventListener('mousedown', this.onMouseDown, false);
            drawingArea.addEventListener('mousemove', this.onMouseMove, false);
            window.addEventListener('mouseup', this.onMouseUp, false);
        }
	},
	onMouseDown: function() {
		mouseDown = 1;
        this.drawCanvas(mouseX, mouseY, 10);
	},
	onMouseMove: function(e) {
		this.getMousePosition(e);

        // Draw a dot if the mouse button is currently being pressed
        if (mouseDown == 1) {
            this.drawCanvas(mouseX, mouseY, 10);
        }
	},
	onMouseUp: function() {
		mouseDown = 0;
	},
	recognize: function() {
		var dataUrl = this.refs.drawingArea.getDOMNode().toDataURL();
		//console.log('------dataURL------');
		//console.log(dataUrl);
		var digitRecognizer = this; 
		$.post('/guess', {image: dataUrl}, function (data) {
			console.log(data);
			digitRecognizer.setState({
				digit: data.result, 
				probability: data.probability
			});
		});
	},
	renderChart: function() {
		var bars = []
		var count = 0;
		for (var prob in this.state.probability) {
			bars.push(<div className="digit">count<div className="percent">prob</div></div>)
			count++;
		}
		return <div className="content">bars</div>;
	},
	render: function() {
		var digit = this.state.digit;
		var barChart = this.state.probability.map(function(item, index) {
			var percent = (item * 100).toFixed(2); 
			if (digit == index) {
	      		return (
	        		<div className="probability">
	        			<canvas className="choosen" width={25} height={percent / 2.5}></canvas>
	        			<div className="digit">{index}</div>
	        		</div>
	      		);
      		} else {
      			return (
	        		<div className="probability">
	        			<canvas className="percent" width={25} height={percent / 2.5}></canvas>
	        			<div className="digit">{index}</div>
	        		</div>
	      		);
      		}
    	});
		return(
			<div className="block">
				<canvas className="drawingArea" ref="drawingArea"
				onMouseEnter={this.initializeCanvas}
				onMouseLeave={this.recognize} 
				width={250} 
				height={250}>	
				</canvas>
				<div className="clear-button" onClick={this.clearCanvas}>
					Clear
				</div>
				<div className="result">
					<div className="chart">{barChart}</div>
				</div>
			</div>
		);
	}
});

React.render(<DigitRecognizer />, document.getElementById('digitRecognizer'));