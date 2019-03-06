

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var db = require('./db');
var dataSource = require('./data_source');

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var lastQuotes;

io.on('connection', function(socket){
  io.emit('quotes_updated', lastQuotes); 

  socket.on('chat_message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat_message', msg);
  });
});


http.listen(3000, function(){
  dataSource.listen(10000, function(err, data) {
    if (err === null) {
      lastQuotes = data;
      io.emit('quotes_updated', data); 

      db.getQuotes('EURUSD', function(err, rows) {
        var series = rows.map(function(row) { return row.ask });
        var labels = rows.map(function(row) { return row.created_at });

        var maxValue = Math.max.apply(Math, series);
        var minValue = Math.min.apply(Math, series);

        io.emit('chart_updated', {
          data: { labels: labels, series: [ series ]},
          options: { min: minValue, max: maxValue }
        });
      });
    }
  });

  console.log('listening on *:3000');
});