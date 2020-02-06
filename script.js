$(document).ready(function () {

  // $(document).on( "", "", function() {
  // });

  $(".search").focus();

  $('.search').on('keyup', function() {
    var query = $('.search').val();

    if (query != "") {
      ajaxRequest(query);
    }

  });

});

// FUNZIONI


function ajaxRequest(query) {
  $.ajax({
  url: "https://api.themoviedb.org/3/search/movie",
  method: "GET",
  data: {
    api_key: 'b7db4886e799d733a0c24ab663a6b884',
    query: query
  },
  success: function (data, stato) {
    var results = data.results;
    printResult(results);
  },
  error: function (richiesta, stato, errore) {
    alert("È avvenuto un errore. " + errore);
  }
  });
}


function printResult(results) {
  var source = $("#movies-template").html();
  var template = Handlebars.compile(source);
  $(".movies").html('');

  results.forEach(function(item, i) {
    var context = {
      original_title: item.original_title,
      original_language: item.original_language,
      vote_average: item.vote_average,
      release_date: item.release_date
    };
    var html = template(context);
    $(".movies").append(html);
  });
}
