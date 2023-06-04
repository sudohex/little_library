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
    return new Promise((resolve, reject) => {
      performAjaxCall(
        "GET",
        null,
        function(response) {
          // Successful API request
          localStorage.setItem("libraryData", JSON.stringify(response));
          resolve(response);
        },
        function(error) {
          // Error handling for failed API request
          console.error("Failed to fetch data: ", error);
          reject([]);
        }
      );
    });
  };
  
  // Init data with local data. If data is none fetchAndUpdate().
  let libs = localStorage.getItem("libraryData")
    ? JSON.parse(localStorage.getItem("libraryData"))
    : fetchAndUpdate();

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

  //List of library
  $("#library-list-page").on("pageshow", function() {

      displayLibraries(libs);

  });
  function displayLibraries(data) {
    var libraryList = $("#library-list");

    // Clear the list
    libraryList.empty();

    data.forEach(function (lib) {
      // Create a container for each library
      var libContainer = $("<div/>", {
        class: "lib-card",
      });

      // Create and add the image
      var libImage = $("<img/>", {
        src: "path/to/your/image.png",
        class: "lib-image",
      });
      libContainer.append(libImage);

      // Create and add the library name and address
      var libInfo = $("<div/>", {
        class: "lib-info",
      });
      var libName = $("<h2/>", {
        text: lib.name,
        class: "lib-name",
      });
      var libAddress = $("<p/>", {
        text: lib.address,
        class: "lib-address",
      });
      libInfo.append(libName, libAddress);
      libContainer.append(libInfo);

      // Create and add the navigation button
      var navigateButton = $("<a/>", {
        href: `https://www.google.com/maps/?q=${lib.location.lat},${lib.location.long}`,
        text: "Navigate",
        class: "navigate-button",
        target: "_blank",
      });
      libContainer.append(navigateButton);

      // Add the library container to the list
      libraryList.append(libContainer);
    });
  }
  //Search and Display
  $("#find-book-page").on("pageshow", function() {

 
   $("#searchInput").on("input", function() {
    var searchQuery = $(this).val().toLowerCase();
    
    fetchAndUpdate().then(function(newLibs) {
      libs = newLibs;
      let libsToDisplay = libs.filter(function(lib) {
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
  
      displaySearchResult(libsToDisplay);
    });
  });
  function displaySearchResult(results) {
    $("#search-result").empty();
    console.log("SEARCH RESULT",results)
    if (results.length === 0) {
      $("#search-result").html("<div><span>No results found</span></div>");
    } else {
      var html =
        '<div data-role="collapsibleset" data-theme="a" data-content-theme="a">';
      for (var i = 0; i < results.length; i++) {
        html += '<div data-role="collapsible">';
        html += '<h3 class="library-header">';
        html += '<img src="library_circle.png" class="library-icon">';
        html += '<span class="library-name">' + results[i].name + "</span>";
        html +=
          '<span class="library-address">' + results[i].address + "</span>";
        html += "</h3>";

        html +=
          '<ul data-role="listview" data-inset="true" data-theme="a" data-divider-theme="a" class="library-books">';
        for (let book of results[i].books) {
          html += "<li>";
          html += '<h4 class="book-title">' + book.title + "</h4>";
          html += '<p class="book-author">' + book.author + "</p>";
          html += "</li>";
        }
        html += "</ul>";

        html += "</div>"; // end of collapsible
      }
      html += "</div>"; // end of collapsibleset

      $("#search-result").html(html);
      $("#search-result [data-role=collapsibleset]")
        .collapsibleset()
        .trigger("create");
      $("#search-result [data-role=listview]").listview().trigger("create");
    }
  }

});

}
