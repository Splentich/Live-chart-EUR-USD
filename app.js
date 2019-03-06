$(function(){


  var socket = io();
  $('form').submit(function(e){
    socket.emit('chat_message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat_message', function(msg) {
    $('#messages').append($('<li>').text(msg).addClass('alert alert-info p10'));
  });

  socket.on('quotes_updated', updateQuotesTable);

  socket.on('chart_updated', updateChart);

  window.quotesChart = drawChart();

});

function updateQuotesTable(quotes) {
  var quotesTable = $('#quotes');
  quotesTable.html(
    quotes.map(function(quote) {
      return $('<tr>').append(
        $('<td>').text(quote.symbol),
        $('<td>').text(quote.bid),
        $('<td>').text(quote.ask),
        $('<td>').text(quote.high),
        $('<td>').text(quote.low)
      )
    })
  )
}

function updateChart(chartData) {
  chartData.options.showArea = true;
  chartData.options.showPoint = false;
  window.quotesChart.update(chartData.data, chartData.options);
}

function drawChart() {
  return new Chartist.Line('#chart', {}, { showArea: true });
}