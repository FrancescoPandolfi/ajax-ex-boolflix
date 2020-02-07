$(document).ready(function () {

  $(".search").focus();

  $('.search').on('keyup', function() {
    var query = $('.search').val();

    if (query != "") {
      ajaxRequest(query);
    } else {
      resetContent();
    }

  });

}); // end document ready


// FUNCTIONS ------------------------------------------

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
    roundTheVote(results);
    printResult(results, query);
  },
  error: function (richiesta, stato, errore) {
    alert("È avvenuto un errore. " + errore);
  }
  });
}


function printResult(results, query) {

  resetContent();

  // handlebars select source and compile template
  var source = $("#movies-template").html();
  var template = Handlebars.compile(source);

  orderResults(results);

  // Se la ricerca non va a buon fine viene avvisato l'utente
  if (results.length == 0) {
    $('.movies').append(`<li>Your search for ${query} did not have any matches.</li>`);
  }

  // handlebars generate and insert content
  results.forEach(function(item) {
    var context = {
      title: item.title,
      lang: item.original_language,
      vote: item.vote_average,
      star1: 'far',
      star2: 'far',
      star3: 'far',
      star4: 'far',
      star5: 'far'
    };
    changeStars(item, context);
    var html = template(context);
    $(".movies").append(html);
  });
}

  // Svuota tutto
function resetContent() {
  $(".movies").html('');
}

// Ordina in base alla popolarità
function orderResults(results) {
  results.sort(function(b, a){
    return a.vote_average - b.vote_average;
  });
}

function roundTheVote(results) {
  results.forEach(function(item) {
    item.vote_average = Math.ceil(item.vote_average / 2);
  });
}

function changeStars(item, context) {
  if (item.vote_average == 1) {
    context.star1 = 'fas';
  } else if (item.vote_average == 2) {
    context.star1 = context.star2 = 'fas';
  } else if (item.vote_average == 3) {
    context.star1 = context.star2 = context.star3 = 'fas';
  } else if (item.vote_average == 4) {
    context.star1 = context.star2 = context.star3 = context.star4 = 'fas';
  } else if (item.vote_average == 5) {
    context.star1 = context.star2 = context.star3 = context.star4 = context.star5 = 'fas';
  }
}
