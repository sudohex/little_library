document.addEventListener("deviceready", onDeviceReady, false);
class Auth {
  static isLoggedIn() {
    return JSON.parse(localStorage.getItem("loggedIn") || "false");
  }

  static login() {
    const username = $("#username").val(); // Assuming you have an input with id "username"
    const password = $("#password").val(); // Assuming you have an input with id "password"

    const loginData = {
      username: username,
      password: password,
    };

    $.ajax({
      url: Data.baseURL + "/api/login",
      type: "POST",
      data: JSON.stringify(loginData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data, status, xhr) {
        // Successfully logged in
        localStorage.setItem("loggedIn", "true");
        $(".loginBtn").hide();
        $(".logoutBtn").show();
        $.mobile.changePage("#library-list-page");
      },
      error: function (xhr, status, error) {
        // There was an error logging in
        if (xhr.status === 403) {
          navigator.notification.alert(
            "Username or password is incorrect",
            null,
            "Login Error",
            "OK"
          );
        } else {
          navigator.notification.alert(
            "There was an error logging in",
            null,
            "Login Error",
            "OK"
          );
        }
      },
    });
  }

  static logout() {
    localStorage.setItem("loggedIn", "false");
  }
}

class UI {
  static displayLibraries(libs) {
    let html = "<div>";
    libs?.map(
      (lib) =>
        (html += `
        <a href="#library-details-popup" data-rel="popup" data-library-id="${lib._id}">
          <div style="display:flex; justify-content: space-between;">
            <div>
            <img src="${lib.coverURL}" class="library-icon" style="margin-right: 10px;">
            <span class="library-name">${lib.name}</span>
            </div>
          </div>
          </a>
        `)
    );
    html += "</div>";
    $("#library-list").html(html);
    $(document).on("click", "[data-rel=popup]", function () {
      const libraryId = $(this).data("library-id");
      const library = libs.find((lib) => lib._id === libraryId);

      if (library) {
        $("#library-details-cover").attr("src", library.coverURL);
        $("#library-details-name").text(library.name);
        $("#library-details-location").text(library.address);

        // Replace '#' with the navigation URL or action
        $("#navigate-button").on("click", function (e) {
          e.preventDefault();
          let latitude = library.location.lat;
          let longitude = library.location.long;
          let googleMapsURL = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          window.open(googleMapsURL, "_blank");
        });
      }
    });
  }

  static setupMenu() {
      if (Auth.isLoggedIn()) {
        $(".loginBtn").hide();
        $(".logoutBtn").show();
      } else {
        $(".loginBtn").show();
        $(".logoutBtn").hide();
      }
    $(".logoutBtn").on("click",function(){
      Auth.logout();
      $(".loginBtn").show();
      $(".logoutBtn").hide();
    })
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
  }
  static setupLoginDisplay() {
    $("#login-page").on("pageshow", function () {
      $("#loginButton").on("click", function (event) {
        event.preventDefault();
        Auth.login();
      });
    });
  }

  static setupSwipeEvents() {
    $("#library-list-page").on("swiperight", function () {
      $.mobile.changePage("#find-book-page", { transition: "slide" });
    });
    $("#find-book-page").on("swipeleft", function () {
      $.mobile.changePage("#library-list-page", {
        transition: "slide",
        reverse: true,
      });
    });

    $("#find-book-page").on("swiperight", function () {
      $.mobile.changePage("#add-book-page", { transition: "slide" });
    });
    $("#find-book-page").on("swipeleft", function () {
      $.mobile.changePage("#library-list-page", {
        transition: "slide",
        reverse: true,
      });
    });
    $("#add-book-page").on("swipeleft", function () {
      $.mobile.changePage("#find-book-page", {
        transition: "slide",
        reverse: true,
      });
    });
  }

  static setupSearchDisplay(libs) {
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

          for (let lib of results) {
            html += `
                <div data-role="collapsible">
                  <h3 >
                  <div style="display:flex; justify-content: space-between;">
                  <div>
                  <img src="${lib.coverURL}" class="library-icon" style="margin-right: 10px;">
                  <span class="library-name">${lib.name}</span>
                  </div>
                  </div>
                  </h3>
                  <ul data-role="listview" data-inset="true" data-theme="a" data-divider-theme="a" class="library-books">`;

            for (let book of lib.books) {
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

  static setupAddBookDisplay(libs) {
    $("#add-book-page").on("pageshow", function () {
      if (!Auth.isLoggedIn()) {
        navigator.notification.alert(
          "Login is required for adding a book",
          () => $.mobile.changePage("#login-page"),
          "Login Required",
          "OK"
        );
      } else {
        let html =
          '<select data-native-menu="false" style="width:100%;background-color:white; height:30px;">';

        libs?.map(
          (lib) => (html += `<option value="${lib?._id}">${lib?.name}</option>`)
        );

        html += " </select>";
        $("#librarySelect").html(html);
        $("#newBookForm").on("submit", function (e) {
          e.preventDefault();
          const title = $("#text-1").val();
          const author = $("#text-3").val();
          const libraryId = $("#librarySelect").find(":selected").val();

          const bookData = {
            title: title,
            author: author,
          };

          $.ajax({
            url: `${Data.baseURL}/api/libraries/${libraryId}/books`,
            type: "POST",
            data: JSON.stringify(bookData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, status, xhr) {
              // Successfully added the book
              // You can choose to show a success message or redirect the user
              console.log(data);
              $.mobile.changePage("#library-list-page");
            },
            error: function (xhr, status, error) {
              // There was an error adding the book
              navigator.notification.alert(
                "There was an error adding the book",
                null,
                "Error",
                "OK"
              );
            },
          });
        });
      }
    });
  }
}

class Data {
  static baseURL = "http://localhost:3000";
  static endpoint = Data.baseURL + "/api/libraries";

  static performAjaxCall(method, data, successCallback, errorCallback) {
    $.ajax({
      url: Data.endpoint,
      type: method,
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: successCallback,
      error: errorCallback,
    });
  }

  static fetchAndUpdate() {
    return new Promise((resolve, reject) => {
      Data.performAjaxCall(
        "GET",
        null,
        function (response) {
          resolve(JSON.parse(JSON.stringify(response)));
        },
        function (error) {
          console.error("Failed to fetch data: ", error);
          reject([]);
        }
      );
    });
  }
}

function onDeviceReady() {
  let libs;

  (async function initialize() {
    try {
      libs = await Data.fetchAndUpdate();
      UI.displayLibraries(libs);
      UI.setupMenu();
      UI.setupLoginDisplay();
      UI.setupSwipeEvents();
      UI.setupSearchDisplay(libs);
      UI.setupAddBookDisplay(libs);
    } catch (error) {
      alert("Failed to fetch library data: " + JSON.stringify(error));
    }
  })();
}
