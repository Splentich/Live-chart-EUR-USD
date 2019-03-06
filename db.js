var mysql = require('mysql');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'finance'
});

connection.connect();

module.exports.insertQuotes = function(quotes, callback) {

  var sql = 'INSERT INTO quotes (pair, bid, ask, high, low, created_at) VALUES ';

  var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  sql += quotes.map(function(quote) {
    return '("' + quote.symbol + '",' + quote.bid + ', ' + quote.ask + ', ' + quote.high + ', ' + quote.low + ', "' + date  + '")'; 
  }).join(', ');

  connection.query(sql, callback);
}


module.exports.getQuotes = function(symbol, callback) {

  var sql = 'SELECT pair, bid, ask, high, low, created_at '
          + 'FROM (SELECT * from quotes as q1 WHERE pair = ? ORDER BY created_at DESC LIMIT 30) as q1 '
          + 'ORDER BY created_at ASC';
  connection.query(sql, symbol, callback);
}