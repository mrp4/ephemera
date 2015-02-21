var common = require("./common");

var apiKey = common.apiKey();

var net = require("net");
var ws = require("ws");
var http = require("http");
var fs = require("fs");
var line = require("line-by-line");

process.on("uncaughtException", function(err) {
  console.log("Error, there was some uncaught exception: " + err + " on line no: " + err.lineNumber);
})

var webPort = common.webPort();
var processPort = common.rankPort();
var flickrPot = common.flickrPort();



/*
WebSocket connection - web client to message server
 */

var httpServer = http.createServer(serveApp).listen(webPort);
var wsServer = new ws.Server({server: httpServer});
var wsList = [];

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function serveApp(request, response) {
  var request_url = String(request.url);
  if (request_url === "/") {request_url = "/index.html"};
  var filename = __dirname + request_url;
  console.log("Requested filename: " + filename);
  fs.readFile(filename,
  function (error, data) {
    if (error) {
      console.log(JSON.stringify(error));

      if (error.code === "ENOENT") {
        response.writeHead(404);
        response.end(filename + " not found");
      } else {
        response.writeHead(500);
        response.end("Error loading " + request_url);
      }

    } else {
      if (request_url.endsWith("html")) {
        response.writeHead(200, {"Content-Type": "text/html"});
      } else if (request_url.endsWith("css")) {
        response.writeHead(200, {"Content-Type": "text/css"});
      } else if (request_url.endsWith("js")) {
        response.writeHead(200, {"Content-Type": "application/javascript"});
      } else {
        response.writeHead(200, {"Content-Type" : "text/plain"});
      }
      response.end(data);
    }
  });
}

wsServer.on("connection", function(ws) {
  console.log("WebSocket: Connection received");
  wsList.push(ws);

  ws.on("close", function(code, message) {
    var i = wsList.indexOf(this);
    wsList[i] = null;
    for (var n = i; n < wsList.length; ++n) {
      wsList[n] = wsList[n + 1];
    }
    --wsList.length;
    console.log("WebSocket: Disconnected");
  })
  ws.on("message", function(data) {
    console.log("WebSocket: Received message: " + data.toString());
    try {
      var object = JSON.parse(data);
      switch (object["type"]) {
        case "SENDING_TRIP_INFO":

          break;
        default:

      }
    } catch (err) {

    }
  });
});

function sendToWebClients(line) {
  console.log("Sending line: " + line + " to web clients");
  for (var i = 0; i < wsList.length; i++) {
    if (wsList[i] != this) {
      console.log("Sending line: " + line + " to web client " + i);
      wsList[i].send(line.toString());
    }
  }
}

console.log("Message server is running, web port: " + webPort);
