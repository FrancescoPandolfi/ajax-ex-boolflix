$(document).ready(function () {

  $(".search").focus();

  $('.search').on('keyup', function() {
    var query = $('.search').val();

    if (query != "") {
      getMovies(query);
      getSeries(query)
    } else {
      resetContent();
    }

  });

}); // end document ready


// FUNCTIONS ------------------------------------------

function getMovies(query) {
  $.ajax({
  url: "https://api.themoviedb.org/3/search/movie",
  method: "GET",
  data: {
    api_key: 'b7db4886e799d733a0c24ab663a6b884',
    query: query
  },
  success: function (data, stato) {
    var movies = data.results;
    console.log(movies);
    roundTheVote(movies);
    printResult("movies", movies, query);
  },
  error: function (richiesta, stato, errore) {
    $('.movies').append("<li>È avvenuto un errore. " + errore + "</li>");
  }
  });
}

function getSeries(query) {
  $.ajax({
  url: "https://api.themoviedb.org/3/search/tv",
  method: "GET",
  data: {
    api_key: 'b7db4886e799d733a0c24ab663a6b884',
    query: query
  },
  success: function (data, stato) {
    var series = data.results;
     console.log(series);
    roundTheVote(series);
    printResult("series", series, query);
  },
  error: function (richiesta, stato, errore) {
    $('.series').append("<li>È avvenuto un errore. " + errore + "</li>");
  }
  });
}



function printResult(type, results, query) {

  if (type == 'movies') {
    $(".movies").html('');
  } else if (type == 'series') {
    $(".series").html('');
  }

  // select source and select template for handlebars
  var source = $("#movies-template").html();
  var template = Handlebars.compile(source);

  orderResults(results);

  // Se la ricerca non va a buon fine viene avvisato l'utente
  if (type == "movies" && results.length == 0) {
    $('.movies').append(`<li>Your search for ${query} did not have any matches.</li>`);
  }
  if (type == "series" && results.length == 0) {
    $('.series').append(`<li>Your search for ${query} did not have any matches.</li>`);
  }



  // generate content for handlebars
  results.forEach(function(item) {

    function setPoster(item) {
      let imgUrl = '';
      if (item.poster_path) {
        imgUrl = 'https://image.tmdb.org/t/p/w92/' + item.poster_path;
      } else {
        imgUrl = 'img/noimg.jpg';
      }
      return imgUrl
    }

    var context = {
      title: chooseTitleKey(item),
      lang: setFlag(item),
      poster_path: setPoster(item),
      // vote: item.vote_average,
    };
    addStars(item, context);

    // {handlebars} compile template with all the data
    var html = template(context);

    if (type == "movies") {
      $(".movies").append(html);
    } else {
      $(".series").append(html);
    }



  });
}

  // remove all
function resetContent() {
  $(".movies").html('');
  $(".series").html('');
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

function chooseTitleKey(item) {
  let title;
  if (!item.title) {
    title = item.name;
  } else {
    title = item.title;
  }
  return title;
}
