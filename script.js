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
  total_results: 10,
  data: {
    api_key: 'b7db4886e799d733a0c24ab663a6b884',
    query: query
  },
  success: function (data, stato) {
    var movies = data.results;
    secondAjaxReq(movies, query);
  },
  error: function (richiesta, stato, errore) {
    $('.movies').append("<li>È avvenuto un errore. " + errore + "</li>");
  }
  });
}

function secondAjaxReq(movies, query) {
  $.ajax({
  url: "https://api.themoviedb.org/3/search/tv",
  method: "GET",
  data: {
    api_key: 'b7db4886e799d733a0c24ab663a6b884',
    query: query
  },
  success: function (data, stato) {
    var series = data.results;
     var results = movies.concat(series);
     console.log(results);
    roundTheVote(results);
    printResult(results, query);
  },
  error: function (richiesta, stato, errore) {
    $('.movies').append("<li>È avvenuto un errore. " + errore + "</li>");
  }
  });
}



function printResult(results, query) {

  resetContent();

  // select source and select template for handlebars
  var source = $("#movies-template").html();
  var template = Handlebars.compile(source);

  orderResults(results);

  // Se la ricerca non va a buon fine viene avvisato l'utente
  if (results.length == 0) {
    $('.movies').append(`<li>Your search for ${query} did not have any matches.</li>`);
  }

  // generate content for handlebars
  results.forEach(function(item) {

    let title;
    if (!item.title) {
      title = item.name;
    } else {
      title = item.title;
    }

    var context = {
      title: title,
      lang: setFlag(item),
    poster_path: 'https://image.tmdb.org/t/p/w92/' + item.poster_path
      // vote: item.vote_average,
    };
    addStars(item, context);

    // {handlebars} compile template with all the data
    var html = template(context);
    $(".movies").append(html);

  });
}

  // remove all
function resetContent() {
  $(".movies").html('');
}

// Ordina in base alla popolarità
function orderResults(results) {
  results.sort(function(b, a){
    return a.popularity - b.popularity;
  });
}

// Arrotonda per eccesso e trasforma la votazione da 1-10 a 1-5
function roundTheVote(results) {
  results.forEach(function(item) {
    item.vote_average = Math.ceil(item.vote_average / 2);
  });
}

// Inserisce le stelle piene in base al numero della votazione
function addStars(item, context) {
  for (var i = 1; i <= 5; i++) {
    if (item.vote_average < i) {
      context["star" + i] = "far";
    } else {
      context["star" + i] = "fas";
    }
  }
}

function setFlag(item) {
  var availableFlags = ['en', 'de', 'es', 'fr', 'it', 'pt'];
  var itemLanguage = item.original_language;
  if (availableFlags.includes(itemLanguage)) {
    return `img/lang/${itemLanguage}.svg`;
  } else {
    $('.lang').html(itemLanguage);
  }
}
