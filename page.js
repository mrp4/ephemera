var fc = new fabric.Canvas("canvas", {isDrawingMode: true})

function toggledrawmode() {
	fc.isDrawingMode = !fc.isDrawingMode;
    if (fc.isDrawingMode) {
      modebutton.innerHTML = 'Cancel drawing mode';
      //drawingOptionsEl.style.display = '';
    }
    else {
      modebutton.innerHTML = 'Enter drawing mode';
      //drawingOptionsEl.style.display = 'none';
    }
}

//event happens everytime new line created on canvas
//ypu can set functions as callback
//wheneer event happens, that calls the function
//the function is anonymous
fc.on("path:created", function(path) {
	console.log("path:created");
	console.log(path)
	var pathAsString = JSON.stringify(path);
	ws.send(pathAsString)

});

//websocket; what it uses to comm in realtime
//websocket.send to send
var ws;
var serverAddress = document.URL.substring(document.URL.indexOf(":") + 3, document.URL.length - 1);
setUpHost();
console.log("serverAddress: " + serverAddress);

function setUpHost() {
    var wshost = "ws://" + serverAddress;
    if (serverAddress.length > 0) {
        ws = new WebSocket(wshost);
        ws.onopen = function() {
            console.log("WebSocket connected");
        };

        ws.onerror = function(e) {
            alert("WebSocket Error: " + e);
        };

        ws.onclose = function(e) {
            alert("WebSocket closed. E:" + e);
        };

        ws.onmessage = function(m) {
            console.log(m.data.toString());
            try {
            	var path = JSON.parse(m.data.toString());
            	console.log("JSON parsed");
            	console.log(path);
              //deafault path, don't do anything with it, replace attributes
            	var temp_path = new fabric.Path('M 0 0 L 50 0 M 0 0 L 4 -3 M 0 0 L 4 3 z', {
				    //default, deleted
            left: 100,
				    top: 100,
				    stroke: 'red',
				    strokeWidth: 1,
				    fill: false
				});
        //replace all data attributes with the remote one
        //k will be things like width, size; k is name instead of actual values
				for (var k in path.path) {
					temp_path[k] = path.path[k];
				}
            	console.log("Received path from server:");
            	console.log(temp_path);
            	//adds path to canvas
              fc.add(temp_path);
           	} catch (ex) {
           		console.log(ex)
           	}
        };
    }
}



var drawingOptionsEl = $('#drawing-mode-options')[0],
	drawingColorEl = $('#drawing-color')[0],
	drawingShadowColorEl = $('#drawing-shadow-color')[0],
	drawingLineWidthEl = $('#drawing-line-width')[0],
	drawingShadowWidth = $('#drawing-shadow-width')[0],
	drawingShadowOffset = $('#drawing-shadow-offset')[0];
  timeLimit = $('#time-limit')[0];

if (fabric.PatternBrush) {
    var vLinePatternBrush = new fabric.PatternBrush(fc);
    vLinePatternBrush.getPatternSrc = function() {
		var patternCanvas = fabric.document.createElement('fc');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx = patternCanvas.getContext('2d');

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(0, 5);
		ctx.lineTo(10, 5);
		ctx.closePath();
		ctx.stroke();

		return patternCanvas;
	}

    var hLinePatternBrush = new fabric.PatternBrush(fc);
    hLinePatternBrush.getPatternSrc = function() {
		var patternCanvas = fabric.document.createElement('fc');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx = patternCanvas.getContext('2d');

		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(5, 0);
		ctx.lineTo(5, 10);
		ctx.closePath();
		ctx.stroke();

		return patternCanvas;
    };

    var squarePatternBrush = new fabric.PatternBrush(fc);
    squarePatternBrush.getPatternSrc = function() {
		var squareWidth = 10, squareDistance = 2;

		var patternCanvas = fabric.document.createElement('fc');
		patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
		var ctx = patternCanvas.getContext('2d');

		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, squareWidth, squareWidth);

		return patternCanvas;
    };

    var diamondPatternBrush = new fabric.PatternBrush(fc);
    diamondPatternBrush.getPatternSrc = function() {

      var squareWidth = 10, squareDistance = 5;
      var patternCanvas = fabric.document.createElement('fc');
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color
      });

      var canvasWidth = rect.getBoundingRectWidth();

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext('2d');
      rect.render(ctx);

      return patternCanvas;
    };

    var img = new Image();
    img.src = 'http://fabricjs.com/assets/honey_im_subtle.png';

    var texturePatternBrush = new fabric.PatternBrush(fc);
    texturePatternBrush.source = img;
 }

  $('#drawing-mode-selector')[0].onchange = function() {

    if (this.value === 'hline') {
      fc.freeDrawingBrush = vLinePatternBrush;
    }
    else if (this.value === 'vline') {
      fc.freeDrawingBrush = hLinePatternBrush;
    }
    else if (this.value === 'square') {
      fc.freeDrawingBrush = squarePatternBrush;
    }
    else if (this.value === 'diamond') {
      fc.freeDrawingBrush = diamondPatternBrush;
    }
    else if (this.value === 'texture') {
      fc.freeDrawingBrush = texturePatternBrush;
    }
    else {
      fc.freeDrawingBrush = new fabric[this.value + 'Brush'](fc);
    }

    if (fc.freeDrawingBrush) {
      fc.freeDrawingBrush.color = drawingColorEl.value;
      fc.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
      fc.freeDrawingBrush.shadowBlur = parseInt(drawingShadowWidth.value, 10) || 0;
    }
 };

drawingColorEl.onchange = function() {
	fc.freeDrawingBrush.color = this.value;
};
drawingShadowColorEl.onchange = function() {
	fc.freeDrawingBrush.shadowColor = this.value;
};
drawingLineWidthEl.onchange = function() {
	fc.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
	this.previousSibling.innerHTML = this.value;
};

drawingShadowWidth.onchange = function() {
	fc.freeDrawingBrush.shadowBlur = parseInt(this.value, 10) || 0;
	this.previousSibling.innerHTML = this.value;
};

drawingShadowOffset.onchange = function() {
	fc.freeDrawingBrush.shadowOffsetX =
	fc.freeDrawingBrush.shadowOffsetY = parseInt(this.value, 10) || 0;
	this.previousSibling.innerHTML = this.value;
};

timeLimit.onchange = function() {
  this.previousSibling.innerHTML = this.value;
}

if (fc.freeDrawingBrush) {
	fc.freeDrawingBrush.color = drawingColorEl.value;
	fc.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
	fc.freeDrawingBrush.shadowBlur = 0;
}