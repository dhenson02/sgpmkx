;(function() {
  var comm = document.getElementById("nav-comm"),
    fhm = document.getElementById("nav-fhm"),
    fhmLinks = '',
    commLinks = '';

  document.title = "USAF Public Health";
  reqwest({
    url: "/kj/kx7/PublicHealth/_api/lists(guid'4522F7F9-1B5C-4990-9704-991725DEF693')/items/?$select=Title,Category",
    method: "GET",
    type: "json",
    contentType: "application/json",
    withCredentials: true,
    headers: {
      "Accept": "application/json;odata=verbose",
      "text-Type": "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose"
    },
    success: function ( data ) {
      var results = data.d.results,
        i = 0,
        count = results.length,
        page;
      for ( ; i < count; ++i ) {
        page = results[i];
        if ( /^\/fhm\//i.test(page.Category) ) {
          // This one is Force Health
          fhmLinks += '<li><a href="content.aspx#' + page.Category + '">' + page.Title + '</a></li>';
        }
        if ( /^\/comm\//i.test(page.Category) ) {
          // This is Comm
          commLinks += '<li><a href="content.aspx#' + page.Category + '">' + page.Title + '</a></li>';
        }
      }
      fhm.innerHTML = fhmLinks;
      comm.innerHTML = commLinks;
      return true;
    },
    error: function (error) {
      console.log(error);
      return false;
    },
    complete: function () {
      document.title = "USAF Public Health";
      return true;
    }
  });
})();
