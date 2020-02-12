$(document).ready(function () {

  var api = 'b7db4886e799d733a0c24ab663a6b884';

  // Chiamata che prende film e serie di tendenza appena si apre il sito
  getTrending('trending/tv/day', 'tv', '.series')
  getTrending('trending/movies/day', 'movie', '.movies')


  // Azioni sul search, ogni lettera inserita fa una ricerca
  $('.search').on('keypress', function(event) {

    var query = $('.search').val();

    if(event.which == 13) {
      $('[name=genres]').val('Choose a genre');
      if (query != "") {

        getData('search/movie', query, 'movie', '.movies')
        getData('search/tv', query, 'tv', '.series')

        $('.first').html('Movies');
        $('.second').html('TV show');

      } else {
        searchTrending()
      }
      $(this).val('');
    }
  });

  // Al click sulla freccia parte la ricerca
  $('.arrow').click(function () {
    $('[name=genres]').val('Choose a genre');
    var query = $('.search').val();
      if (query != "") {

        getData('search/movie', query, 'movie', '.movies')
        getData('search/tv', query, 'tv', '.series')

        $('.first').html('Movies');
        $('.second').html('TV shows');

      } else {
        searchTrending()
      }
      $('.search').val('');
  });

  // Al click sul logo si ricarica la pagina
  $('.menu-bar .logo').click(function() {
      location.reload();
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
    $(".search").focus();
  });

  // Comportamento freccia dell'input
  $(document).on( "keyup", ".search", function() {
    if ($(".search").val().length >= 1) {
      $('.arrow').addClass('active');
    } else if ($(".search").val().length == 0) {
      $('.arrow').removeClass('active');
    }
  });


  // Prende i generi e li inserisce nella select
  getGenre(api);

  // Azione che nasconde e mostra gli elementi in base al genere
  $(document).on("change", "select", function() {
    var selectedGenre = $(this).children("option:selected").val();

    if (selectedGenre === 'All') {
      $('.element').show();
    } else {
      $('.element').hide();
    }

    $('.element').each(function() {
      var elementGenres = $(this).attr('data-genres');
      if (elementGenres.indexOf(selectedGenre) !== -1) {
        $(this).show();
      }
    });

  });

}); // end document ready



// FUNCTIONS ------------------------------------------

// Ricerca il trend di oggi
function searchTrending() {
  resetContent();
  getTrending('trending/tv/day', 'tv', '.series')
  getTrending('trending/movies/day', 'movie', '.movies')
  $('.first').html('Trending Movies today');
  $('.second').html('Trending TV show today');
}

// Chiama tutti i generi disponibili e li inserisce nella select
function getGenre(api) {
  $.ajax({
    url: "https://api.themoviedb.org/3/genre/movie/list",
    data: {api_key: api},
    success: function (data, stato) {
      var genres = data.genres;

      genres.forEach(function(item) {
        $('select').append('<option value=' + item.id +'>' + item.name + '</option>')
      });

    },
    error: function (richiesta, stato, errore) {
      $('main').append("<li>È avvenuto un errore. " + errore + "</li>");
    }
  });
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
     if (cast.length >= 4) {

       var starring = '<span class="bold">Starring: </span>';
       for (var i = 0; i < 4; i++) {
         if (i == 3) {
           starring = starring + cast[i].name + '.';
         } else {
           starring = starring + cast[i].name + ', ';
         }
       }
       $(questo).next('.details').find('p.starring').append(starring);

      }

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
      genre: item.genre_ids,
      backdrop: 'https://image.tmdb.org/t/p/w1280/' + item.backdrop_path
    };
    if (item.backdrop_path == null) {
      context.backdrop = '';
    }

    // {handlebars} compile template with all the data
    var html = template(context);

    if (type == "movie") {
      $(".movies").append(html);
    } else {
      $(".series").append(html);
    }
  });
}

// Stampa il poster se è presenta altrimenti mette un'immagine di default
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

// Funzione per la bandiera
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
