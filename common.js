if (!(typeof module == 'undefined')) {
  module.exports = {
    createUniqueId: createUniqueId,
    webPort: function() {return webPort},
    rankPort: function() {return rankPort},
    flickrPort: function() {return flickrPort},
    flightsPort: function() {return flightsPort},
    hotelsPort: function() {return hotelsPort},
    apiKey: function() {return apiKey}
  }
}

function createUniqueId() {
  return Math.random().toString(36);
}

var webPort = 28009;
var rankPort = 28010;
var flickrPort = 28011;
var flightsPort = 28012;
var hotelsPort = 28013;
var apiKey = "ilw26804345122540530808033734936";
