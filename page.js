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
					console.log(k.toString());
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