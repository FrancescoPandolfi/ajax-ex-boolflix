$(document).ready(function () {



  $('.search').on('keyup', function() {
    var query = $('.search').val();

    if (query != "") {
      getMovies(query);
      getSeries(query)
    } else {
      resetContent();
      getTrending();
    }

  });

  getTrending();

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


  $(document).on( "click", ".search-icon", function() {
    $('.search').toggleClass('active');
    $(".search").focus();
  });

}); // end document ready


// FUNCTIONS ------------------------------------------

// Call for Cast by Id
 function getCast(id, questo, type) {
   $.ajax({
   url: 'https://api.themoviedb.org/3/' + type +'/' + id + '/credits',
   data: {api_key: 'b7db4886e799d733a0c24ab663a6b884'},
   success: function (data, stato) {
     $(questo).next('.details').find('.starring').html('');
     var cast = data.cast;

     var starring = 'Starring: ';
     for (var i = 0; i < 4; i++) {
       starring = starring + cast[i].name + ', ';
     }

     $(questo).next('.details').find('.starring').html(starring);

     console.log(starring);
   },
   error: function (richiesta, stato, errore) {
   }
   });
 }



function getTrending() {
  $.ajax({
  url: "https://api.themoviedb.org/3/trending/all/week",
  data: {
    api_key: 'b7db4886e799d733a0c24ab663a6b884',
  },
  success: function (data, stato) {
    var movie = data.results;
    roundTheVote(movie);
    printResult("movie", movie);

    $('.first').html('Trending this week');
    $('.second').html('');
  },
  error: function (richiesta, stato, errore) {
    $('.movies').append("<li>È avvenuto un errore. " + errore + "</li>");
  }
  });
}



function getMovies(query) {
  $.ajax({
  url: "https://api.themoviedb.org/3/search/movie",
  method: "GET",
  data: {
    api_key: 'b7db4886e799d733a0c24ab663a6b884',
    query: query,
    language: 'en-EN'
  },
  success: function (data, stato) {
    var movie = data.results;
    roundTheVote(movie);
    printResult("movie", movie, query);

    $('.first').html('Movies');
    $('.second').html('TV shows');
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
    var tv = data.results;
    roundTheVote(tv);
    printResult("tv", tv, query);
  },
  error: function (richiesta, stato, errore) {
    $('.series').append("<li>È avvenuto un errore. " + errore + "</li>");
  }
  });
}



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

    function setPoster(item) {
      let imgUrl = '';
      if (item.poster_path) {
        imgUrl = 'https://image.tmdb.org/t/p/w500/' + item.poster_path;
      } else {
        imgUrl = 'img/noimg.jpg';
      }
      return imgUrl
    }

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


  // remove all
function resetContent() {
  $(".movies").html('');
  $(".series").html('');
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

function chooseTitleKey(item) {
  let title;
  if (!item.title) {
    title = item.original_name;
  } else {
    title = item.original_title;
  }
  return title;
}

// $(document).mousemove(function(e) {
//     $('.search').offset({
//         left: e.pageX,
//         top: e.pageY + 20
//     });
// });
