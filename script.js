$(document).ready(function () {


  // Chiamata che prende i film di tendenza appena si apre il sito
  getTrending('trending/tv/day', 'tv', '.series')
  getTrending('trending/movies/day', 'movie', '.movies')


  // Azioni sul search, ogni lettera inserita fa una ricerca
  $('.search').on('keypress', function(event) {

    var query = $('.search').val();

    if(event.which == 13) {

      if (query != "") {

        getData('search/movie', query, 'movie', '.movies')
        getData('search/tv', query, 'tv', '.series')

        $('.first').html('Movies');
        $('.second').html('TV shows');

      } else {
        searchTrending()
      }
    }
  });

  $('.arrow').click(function () {
    var query = $('.search').val();
      if (query != "") {

        getData('search/movie', query, 'movie', '.movies')
        getData('search/tv', query, 'tv', '.series')

        $('.first').html('Movies');
        $('.second').html('TV shows');

      } else {
        searchTrending()
      }
  });

// Quando il campo si svuota vengono mostrati i trending now
  $('.search').on('keyup', function() {
      var query = $('.search').val();
      if (query == ""){
        searchTrending()
      }
  });



  // Azioni nel main, sulle immagini
  $(document).on( "mouseenter", ".element", function() {
    $(this).find('img').addClass('active');
    $(this).find('.info').addClass('active');
    getCast($(this).attr('data-id'), $(this), $(this).attr('data-type'));
  });
  $(document).on( "mouseleave", ".element", function() {
    $(this).find('img').removeClass('active');
    $(this).find('.info').removeClass('active');
  });
  $(document).on( "click", ".info", function() {
    $(this).parent().next('.details').addClass('show');
    $('.cover-bg').addClass('show');
  });
  $(document).on( "click", ".close, .cover-bg", function() {
    $('.details').removeClass('show');
    $('.cover-bg').removeClass('show');
  });

  // Azione sulla search
  $(document).on( "click", ".search-icon", function() {
    $('.search').toggleClass('active');
    $('.arrow').toggleClass('active');
    $(".search").focus();

  });

}); // end document ready



// FUNCTIONS ------------------------------------------


function searchTrending() {
  resetContent();
  getTrending('trending/tv/day', 'tv', '.series')
  getTrending('trending/movies/day', 'movie', '.movies')
  $('.first').html('Trending Movies this week');
  $('.second').html('Trending TV shows this week');
}


// Funzione con chiamata per film o tv show di tendenza
function getTrending(urlFinal, type, container) {
$.ajax({
url: "https://api.themoviedb.org/3/" + urlFinal,
data: {
  api_key: 'b7db4886e799d733a0c24ab663a6b884',
},
success: function (data, stato) {
  var results = data.results;
  printResult(type, results);
},
error: function (richiesta, stato, errore) {
  $(container).append("<li>È avvenuto un errore. " + errore + "</li>");
}
});
}

// Funzione che restituisce array di film o Tv show presi dal database
function getData(urlFinal, query, type, container) {
$.ajax({
url: "https://api.themoviedb.org/3/" + urlFinal,
data: {
  api_key: 'b7db4886e799d733a0c24ab663a6b884',
  query: query,
},
success: function (data, stato) {
  var results = data.results;
  roundTheVote(results);
  printResult(type, results, query);
},
error: function (richiesta, stato, errore) {
  $(container).append("<li>È avvenuto un errore. " + errore + "</li>");
}
});
}

// chiamata per il Cast usando l'ID
function getCast(id, questo, type) {
   $.ajax({
   url: 'https://api.themoviedb.org/3/' + type +'/' + id + '/credits',
   data: {api_key: 'b7db4886e799d733a0c24ab663a6b884'},
   success: function (data, stato) {
     $(questo).next('.details').find('.starring').html('');
     var cast = data.cast;
     var starring = '<span class="bold">Starring: </span>';
     for (var i = 0; i < 4; i++) {
       if (i == 3) {
         starring = starring + cast[i].name + '.';
       } else {
         starring = starring + cast[i].name + ', ';
       }
     }
     $(questo).next('.details').find('p.starring').append(starring);
   },
   error: function (richiesta, stato, errore) {
   }
   });
 }

// Compila handlebar e stampa i risultati
function printResult(type, results, query) {

  if (type == 'movie') {
    $(".movies").html('');
  } else if (type == 'tv') {
    $(".series").html('');
  }

  // select source and select template for handlebars
  var source = $("#movies-template").html();
  var template = Handlebars.compile(source);

  // Se la ricerca non va a buon fine viene avvisato l'utente
  if (type == "movie" && results.length == 0) {
    $('.movies').append(`<li>Your search for ${query} did not have any matches.</li>`);
  }
  if (type == "tv" && results.length == 0) {
    $('.series').append(`<li>Your search for ${query} did not have any matches.</li>`);
  }


  // generate content for handlebars
  results.forEach(function(item) {

    var context = {
      title: chooseTitleKey(item),
      lang: setFlag(item),
      poster_path: setPoster(item),
      star: addStars(item),
      desc: item.overview,
      type: type,
      id: item.id,
      backdrop: 'https://image.tmdb.org/t/p/w1280/' + item.backdrop_path
    };


    // {handlebars} compile template with all the data
    var html = template(context);

    if (type == "movie") {
      $(".movies").append(html);
    } else {
      $(".series").append(html);
    }
  });
}

function setPoster(item) {
  let imgUrl = '';
  if (item.poster_path) {
    imgUrl = 'https://image.tmdb.org/t/p/w342/' + item.poster_path;
  } else {
    imgUrl = 'img/noimg.jpg';
  }
  return imgUrl
}

// Arrotonda per eccesso e trasforma la votazione da 1-10 a 1-5
function roundTheVote(results) {
  results.forEach(function(item) {
    item.vote_average = Math.ceil(item.vote_average / 2);
  });
}

// Inserisce le stelle piene in base al numero della votazione
function addStars(item) {
  var stars =  '';
  for (var i = 1; i <= 5; i++) {
    if (item.vote_average < i) {
      stars += '<i class="far fa-star"></i>';
    } else {
      stars += '<i class="fas fa-star"></i>';
    }
  }
  return stars;
}

// Inserisce la bandiera
function setFlag(item) {
  var availableFlags = ['en', 'de', 'es', 'fr', 'it', 'pt'];
  var itemLanguage = item.original_language;
  var lang = '';
  if (availableFlags.includes(itemLanguage)) {
    lang = `<img class="flags" src="img/lang/${itemLanguage}.svg" alt="">`;
  } else {
    lang = itemLanguage;
  }
  return lang;
}

// Sceglie la chiave corretta per il titolo
function chooseTitleKey(item) {
  let title;
  if (!item.title) {
    title = item.original_name;
  } else {
    title = item.original_title;
  }
  return title;
}

// remove all
function resetContent() {
  $(".movies").html('');
  $(".series").html('');
}
