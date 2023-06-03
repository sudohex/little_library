// document.addEventListener("deviceready", onDeviceReady, false);
$(document).ready(function () {
  onDeviceReady();
});

function onDeviceReady() {
  const baseURL = "http://localhost:3000";
  const endpoint = baseURL + "/api/libraries";

  const performAjaxCall = (method, data, successCallback, errorCallback) => {
    $.ajax({
      url: endpoint,
      type: method,
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: successCallback,
      error: errorCallback,
    });
  };

  const fetchAndUpdate = () => {
    performAjaxCall(
      "GET",
      null,
      function (response) {
        // Successful API request
        localStorage.setItem("libraryData", JSON.stringify(response));
        console.log(response)
        return response;
      },
      function (error) {
        // Error handling for failed API request
        console.error("Failed to fetch data: ", error);
      }
    );
  };

  // Init data with local data. If data is none fetchAndUpdate().
  let libs = localStorage.getItem("libraryData")
    ? JSON.parse(localStorage.getItem("libraryData"))
    : fetchAndUpdate();

  // Navigation Menu
  $("#dropDownMenu").hide();
  $("#btnMenu")
    .off("click")
    .on("click", function () {
      $("#dropDownMenu").toggle();
    });
  $(document).on("click", function (event) {
    if (!$(event.target).closest("#btnMenu").length) {
      $("#dropDownMenu").hide();
    }
  });

  //Search and Display
  $("#searchInput").on("input", function () {
    var searchQuery = $(this).val().toLowerCase();
    // Change the libs
    if (!searchQuery){
      let libsToDisplay = libs.filter(function (lib) {
        for (let book of lib.books) {
          if (
            book.title.toLowerCase().includes(searchQuery) ||
            book.author.toLowerCase().includes(searchQuery)
          ) {
            return true;
          }
        }
        return false;
      });
  
        displayLibraries(libsToDisplay);
    }else{
      displayLibraries(libs)
    }

  });

  function displayLibraries(results) {
    $("#search-result").empty();

    if (results.length === 0) {
      $("#search-result").html(
        '<div><span colspan="3">No results found</span></div>'
      );
    } else {
      var html = "";
      for (var i = 0; i < results.length; i++) {
        html += '<div class="library-header">';
        html +=
          "<span colspan='3'><sdivong>Library:</sdivong> " +
          results[i].name +
          ", " +
          results[i].address +
          "</span>";
        html += "</div>";

        for (let book of results[i].books) {
          html += "<div>";
          html += "<span>" + book.title + "</span>";
          html += "<span>" + book.author + "</span>";
          html += "<span>" + book.description + "</span>";
          html += "</div>";
        }
      }
      $("#search-result").html(html);
    }
  }
}
