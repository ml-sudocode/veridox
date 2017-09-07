$(document).ready(function () {

  // look for checking button, assign on click event
  $('#check_button').click(function () {
    var currentUrl = $(location).attr('pathname')
    // /user/entries/59b0f26eab8a6e0e96504e11
    var entryId = currentUrl.split('/').pop()
    // after the click, run the .get (ajax) call to /receipt.json
    $.getJSON("/user/receipt.json", {
      // Adding the data bit results in a url query param as below! But routing is not affected by query params
      // /user/receipt.json?entryId=23u8912y31i2u21u231
      "entryId": entryId
    },
    function (res) {
        // append the results to the BR div
        $("#br_div > h4").remove()
        $("#br_div > p").remove()
        $("#br_div").append("<h4>Results of check:</h4>")
        $("#br_div").append("<p>"+res[0]+"</p>")
        $("#br_div").append("<p>Blockchain Receipt: " + JSON.stringify(res[1]) + "</p>")
        $("#br_div").append("<p>Conclusion: "+res[2]+"</p>")
    })
  })

  // // run ajax now
  // // 2 methods = GET and POST
  //
  // var discover_movie_url = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=83ebcfbe2592e4358658da3522dad3ff'
  // var image_url = 'https://image.tmdb.org/t/p/w300/'
  // var $ul = $('.movie-list')
  //
  // $.get(discover_movie_url)
  //   .done(function (data) {
  //     var movie_arr = data.results
  //
  //     movie_arr.forEach(function (movie) {
  //       var $createdList = createList(movie)
  //       $ul.append($createdList)
  //     })
  //   })
  //
  // // input: obj
  // // output: jquery object
  // // jquery object => <li> <img src=""> </li>
  // function createList (obj) {
  //   var $newLi = $('<li>')
  //   var $newImg = $('<img>')
  //
  //   $newImg.attr({
  //     src: image_url + obj.poster_path,
  //     alt: obj.title
  //   })
  //   $newLi.append($newImg)
  //   return $newLi
  // }
})
