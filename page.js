/*
* page.js contains all the JavaScript code that runs in the user's browser.
*
*/

// The fc object is the fabric canvas used to draw everything.
var fc = new fabric.Canvas("canvas", {isDrawingMode: true})

// This function toggles whether the fabric canvas is in draw or object view mode.
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

// This is the list of weird path-inside-'path' objects currently on the canvas.
var pathContainers = Array();

// Every TICK_INTERVAL milliseconds, the performTime function will be called by the browser window.
var TICK_INTERVAL = 100;
window.setInterval(performTime, TICK_INTERVAL);

// This is the time in milliseconds when the dissolve should start
var DISSOLVE_START_TIME = 5000;

// The performTime() method reduces the remaining amount of time for each path.
// If the remaining time is zero, the path is removed from the canvas. Else, if
// the remaining time is less than DISSOLVE_START_TIME, the opacity is reduced
// so that the path starts to fade away gradually.
function performTime() {
  var newPathContainersArray = Array();
  console.log("Performing time");
  for (var i = 0; i < pathContainers.length; i++) {
    var pathContainer = pathContainers[i];
    console.log(pathContainer);
    if (pathContainer.dissolveTime == 0) {
      pathContainer.path.remove();
    } else {
      if (pathContainer.dissolveTime < DISSOLVE_START_TIME) {
        pathContainer.path.setOpacity(pathContainer.dissolveTime / (DISSOLVE_START_TIME));
      }
      pathContainer.dissolveTime -= TICK_INTERVAL;
      newPathContainersArray.push(pathContainer);
    }
  }
  pathContainers = newPathContainersArray;
  // It is necessary to force the canvas to redraw when the opacity of any path changes
  fc.renderAll();
}

//event happens everytime new line created on canvas
//ypu can set functions as callback
//wheneer event happens, that calls the function
//the function is anonymous
fc.on("path:created", function(pathContainer) {
  pathContainer.dissolveTime = timeLimit.value * 1000;
	console.log("path:created");
	console.log(pathContainer)
	var pathAsString = JSON.stringify(pathContainer);
	ws.send(pathAsString)
  pathContainers.push(pathContainer);
});

//websocket; what it uses to comm in realtime
//websocket.send to send
var ws;
// serverAddress is set to be the current web address with the http:// or https:// taken off
var serverAddress = document.URL.substring(document.URL.indexOf(":") + 3, document.URL.length - 1);
setUpHost();
console.log("serverAddress: " + serverAddress);

// setUpHost() returns the 
function setUpHost() {
    var wshost = "ws://" + serverAddress;
    if (serverAddress.length > 0) {
        // Initialise ws to be a new WebSocket instance, connecting to the wshost address
        ws = new WebSocket(wshost);
        // When the ws opens, call this anonymous function
        ws.onopen = function() {
            console.log("WebSocket connected");
        };

        // When the ws has an error, call this anonymous function
        ws.onerror = function(e) {
            alert("WebSocket Error: " + e);
        };

        // When the ws closes, call this anonymous function
        ws.onclose = function(e) {
            alert("WebSocket closed. E:" + e);
        };

        // When the ws receives a message from the server, call this anonymous function.
        ws.onmessage = function(m) {
            console.log(m.data.toString());
            try {
            	var pathContainer = JSON.parse(m.data.toString());
            	console.log("JSON parsed");
            	console.log(pathContainer);
              //default path, don't do anything with it, replace attributes
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
      				for (var k in pathContainer.path) {
      					temp_path[k] = pathContainer.path[k];
      				}

            	console.log("Received path from server:");
            	console.log(temp_path);
            	//adds path to canvas
              fc.add(temp_path);
              pathContainer.path = temp_path;
              // Add the path container to the list of path containers
              pathContainers.push(pathContainer);
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
    else if (this.value === 'Square') {
      fc.freeDrawingBrush = squarePatternBrush;
    }
    else if (this.value === 'Diamond') {
      fc.freeDrawingBrush = diamondPatternBrush;
    }
    else if (this.value === 'Texture') {
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
	fc.freeDrawingBrush.shadowOffsetX = parseInt(this.value, 10) || 0;
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