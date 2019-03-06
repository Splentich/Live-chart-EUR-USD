var https = require('https');
var parseString = require('xml2js').parseString;
var db = require('./db');
var timerId = null;


module.exports.listen = function(pollInterval, callback) {


  updateQuotes(callback);
  timerId = setInterval(function() {
    updateQuotes(callback);
  }, pollInterval);


}

module.exports.stop = function() {
  clearInterval(timerId);
  timerId = null;
}


var pairs = ['EURUSD'];

function parseQuotes(rawXml, callback){

  parseString(rawXml, function(err, result){
    var quotes = result.Rates.Rate.map(function(quote) {
      return { symbol: quote['$'].Symbol, bid: quote.Bid[0], ask: quote.Ask[0], high: quote.High[0], low: quote.Low[0] }
    }).filter(function(element) {
      if (pairs.indexOf(element.symbol) >= 0) {
        return true;
      }

      return false;


    });

    callback(err, quotes);
  });
}

function updateQuotes(callback) {
  https.get('https://rates.fxcm.com/RatesXML', function(res){
    var data = '';

    res.on('data', function(chunk) {
      data += chunk;
    })

    res.on('end', function() {
      parseQuotes(data, function(err, quotes) {
        if (err !== null) {
          console.log(err);
          return;
        }
        db.insertQuotes(quotes, function(err, result) {
          if (err !== null) {
            console.log('Failed to update DB: ' + err);
            return;
          }

          console.log("DB updated " + new Date());
        });
        callback(err, quotes);
      });
    })

    res.on('error', function(error) {
      console.log('Failed to read the response: ' + error);
      callback(error);
    })
  }).on('error', function(error) {
    console.log('Failed to connection: ' + error);
    callback(error);
  });
}
