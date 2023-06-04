// document.addEventListener("deviceready", onDeviceReady, false);
$(document).ready(function () {
  onDeviceReady();
});
const baseURL = "http://localhost:3000";
const endpoint = baseURL + "/api/libraries";
function onDeviceReady() {
  let libs;

  (async function initialize() {
      try {
        libs = await fetchAndUpdate();
      } catch(error) {
        alert('Failed to fetch library data: ' + JSON.stringify(error));
      }

    displayLibraries(libs)
  })();
  function displayLibraries() {
    let librariesList = libs?.map(
      (lib) =>
        `<ul>
            <li>${lib?.name}</li>
            <li>${lib?.address}</li>

        </ul>`
    );
    $("#library-list").html("<div>" + librariesList + "</div>");
  }



  // Navigation Menu
  $(".btnMenu")
    .off("click")
    .on("click", function () {
      $(".dropDownMenu").toggle();
    });
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".btnMenu").length) {
      $(".dropDownMenu").hide();
    }
  });
    // Detect swipe to the right
    $("#library-list-page").on("swiperight", function() {
      $.mobile.changePage("#my-account-page", { transition: "slide" });
    });
    $("#my-account-page").on("swipeleft", function() {
      $.mobile.changePage("#library-list-page", { transition: "slide", reverse: true });
    });
  
    // Similarly, you can implement for other pages
    // Detect swipe to the right
    $("#my-account-page").on("swiperight", function() {
      $.mobile.changePage("#find-book-page", { transition: "slide" });
    });
    $("#find-book-page").on("swipeleft", function() {
      $.mobile.changePage("#my-account-page", { transition: "slide", reverse: true });
    });


  //Search and Display
  $("#find-book-page").on("pageshow", function () {
    $("#searchInput").on("input", function () {
      var searchQuery = $(this).val().toLowerCase();
      let libsToDisplay = libs
        .map(function (lib) {
          let newLib = { ...lib };
          newLib.books = newLib.books.filter(function (book) {
            return (
              book.title.toLowerCase().includes(searchQuery) ||
              book.author.toLowerCase().includes(searchQuery)
            );
          });
          return newLib;
        })
        .filter(function (lib) {
          return lib.books.length > 0; // Only return libraries with matching books
        });
      if (searchQuery?.length >= 3) displaySearchResult(libsToDisplay);
      else
        $("#search-result").html(
          "<div><span>Type first three characters to start searching...</span></div>"
        );
    });
    function displaySearchResult(results) {
      $("#search-result").empty();
      if (results.length === 0) {
        $("#search-result").html("<div><span>No result found</span></div>");
      } else {
        let html = `<div data-role="collapsibleset" data-theme="a" data-content-theme="a">`;
  
        for (let i = 0; i < results.length; i++) {
          html += `
              <div data-role="collapsible">
                <h3 >
                <div style="display:flex; justify-content: space-between;">
                <div>
                <img src="${results[i].coverURL}" class="library-icon" style="margin-right: 10px;">
                <span class="library-name">${results[i].name}</span>
                </div>
                </div>
                </h3>
                <ul data-role="listview" data-inset="true" data-theme="a" data-divider-theme="a" class="library-books">`;
  
          for (let book of results[i].books) {
            html += `
                <li>
                  <h4 class="book-title">${book.title}</h4>
                  <p class="book-author">${book.author}</p>
                </li>`;
          }
  
          html += `
                </ul>
              </div>`; // end of collapsible
        }
  
        html += `</div>`; // end of collapsibleset
  
        $("#search-result").html(html);
        $("#search-result [data-role=collapsibleset]")
          .collapsibleset()
          .trigger("create");
        $("#search-result [data-role=listview]").listview().trigger("create");
      }
    }
  });
}
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
  return new Promise((resolve, reject) => {
    performAjaxCall(
      "GET",
      null,
      function (response) {
        // Successful API request
        localStorage.setItem("libraryData", JSON.stringify(response));
        resolve(JSON.parse(JSON.stringify(response)));
      },
      function (error) {
        // Error handling for failed API request
        console.error("Failed to fetch data: ", error);
        reject([]);
      }
    );
  });
};