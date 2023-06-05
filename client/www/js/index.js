document.addEventListener("deviceready", onDeviceReady, false);

let libs;
async function onDeviceReady() {
  try {
    Location.loadGoogleMapsScript();

    await Data.fetchAndUpdate();
    await UI.initialize(libs);
    Location.setUserLocation();
  } catch (error) {
    console.log(error);
    alertErrorMessage("Data Fetch Error", "Failed to fetch library data");
  }
}
class Auth {
  static isLoggedIn() {
    return JSON.parse(localStorage.getItem("loggedIn") || "false");
  }

  static async login() {
    const username = $("#username").val();
    const password = $("#password").val();

    const loginData = {
      username: username,
      password: password,
    };

    try {
      const data = await postData(Data.baseURL + "/api/login", loginData);
      localStorage.setItem("loggedIn", "true");
      $(".loginBtn").hide();
      $(".logoutBtn").show();
      $.mobile.changePage("#library-list-page");
    } catch (error) {
      alertErrorMessage(
        "Login Error",
        "There was an error logging in",
        error.status === 403 ? "Username or password is incorrect" : undefined
      );
    }
  }

  static logout() {
    localStorage.setItem("loggedIn", "false");
  }
}

class UI {
  static async initialize(libs) {
    UI.displayLibraries(libs);
    UI.setupMenu();
    UI.setupLoginDisplay();
    UI.setupSwipeEvents();
    UI.setupSearchDisplay(libs);
    UI.setupAddBookDisplay(libs);
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
  static setupMenu() {
    toggleLoginButtons(Auth.isLoggedIn());
    $(".logoutBtn").on("click", () => {
      Auth.logout();
      toggleLoginButtons(false);
    });
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

  static displayLibraries(libs) {
    let html = libs
      .map(
        (lib) =>
          `<a href="#library-details-popup" data-rel="popup" data-library-id="${lib._id}">
          <div style="display:flex; justify-content: space-between;">
            <div>
              <img src="${lib.coverURL}" class="library-icon" style="margin-right: 10px;">
              <span class="library-name">${lib.name}</span>
            </div>
          </div>
        </a>`
      )
      .join("");

    $("#library-list").html(`<div>${html}</div>`);
    UI.bindLibraryClickEvents(libs);
  }

  static setupLoginDisplay() {
    $("#login-page").on("pageshow", function () {
      $("#loginButton").on("click", function (event) {
        event.preventDefault();
        Auth.login();
      });
    });
  }

  static setupSearchDisplay(libs) {
    $("#find-book-page").on("pageshow", function () {
      $("#searchInput")
        .off("input")
        .on("input", function () {
          const searchQuery = $(this).val().toLowerCase();
          const libsToDisplay = filterLibrariesByQuery(libs, searchQuery);
          if (searchQuery?.length >= 3) displaySearchResult(libsToDisplay);
          else
            $("#search-result").html(
              "<div><span>Type first three characters to start searching...</span></div>"
            );
        });

      function filterLibrariesByQuery(libs, query) {
        return libs
          .map((lib) => ({
            ...lib,
            books: lib.books.filter((book) =>
              [book.title, book.author].some((attr) =>
                attr.toLowerCase().includes(query)
              )
            ),
          }))
          .filter((lib) => lib.books.length > 0);
      }

      function displaySearchResult(results) {
        $("#search-result").empty();
        if (results.length === 0) {
          $("#search-result").html("<div><span>No result found</span></div>");
        } else {
          const html = results.reduce(
            (acc, lib) =>
              acc +
              createLibraryCollapsibleHTML(lib.name, lib.coverURL, lib.books),
            `<div data-role="collapsibleset" data-theme="a" data-content-theme="a">`
          );

          $("#search-result").html(`${html}</div>`);
          $("#search-result [data-role=collapsibleset]")
            .collapsibleset()
            .trigger("create");
          $("#search-result [data-role=listview]").listview().trigger("create");
        }
      }

      function createLibraryCollapsibleHTML(name, coverURL, books) {
        const bookItemsHTML = books.reduce(
          (acc, book) =>
            acc +
            `
            <li>
              <h4 class="book-title">${book.title}</h4>
              <p class="book-author">${book.author}</p>
            </li>`,
          ""
        );

        return `
          <div data-role="collapsible">
            <h3 >
            <div style="display:flex; justify-content: space-between;">
              <div>
                <img src="${coverURL}" class="library-icon" style="margin-right: 10px;">
                <span class="library-name">${name}</span>
              </div>
            </div>
            </h3>
            <ul data-role="listview" data-inset="true" data-theme="a" data-divider-theme="a" class="library-books">
              ${bookItemsHTML}
            </ul>
          </div>`;
      }
    });
  }

  static setupAddBookDisplay(libs) {
    $("#add-book-page").on("pageshow", async function () {
      if (!Auth.isLoggedIn()) {
        alertErrorMessage(
          "Login Required",
          "Login is required for adding a book",
          () => $.mobile.changePage("#login-page")
        );
      } else {
        let html = libs
          ?.map((lib) => `<option value="${lib._id}">${lib.name}</option>`)
          .join("");

        $("#librarySelect").html(
          `<select data-native-menu="false" style="width:100%;background-color:white; height:30px;">${html}</select>`
        );

        $("#saveNewBook")
          .off("click")
          .on("click", async function (e) {
            e.preventDefault();
            const title = $("#text-1").val();
            const author = $("#text-3").val();
            const libraryId = $("#librarySelect").find(":selected").val();

            const bookData = {
              title: title,
              author: author,
            };

            try {
              await postData(
                `${Data.baseURL}/api/libraries/${libraryId}/books`,
                bookData
              ).then(async (res) => {
                await Data.fetchAndUpdate();
              });
              $.mobile.changePage("#library-list-page");
            } catch (error) {
              alertErrorMessage("Error", "There was an error adding the book");
            }
          });
      }
    });
  }

  static bindLibraryClickEvents(libs) {
    $(document).on("click", "[data-rel=popup]", function () {
      const libraryId = $(this).data("library-id");
      const library = libs.find((lib) => lib._id === libraryId);

      if (library) {
        $("#library-details-cover").attr("src", library.coverURL);
        $("#library-details-name").text(library.name);
        $("#library-details-location").text(library.address);
        let latitude = library.location.lat;
        let longitude = library.location.long;
        $("#navigate-button")
          .off("click")
          .on("click", function (e) {
            e.preventDefault();
            let googleMapsURL = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            window.open(googleMapsURL, "_blank");
          });
      }
    });
  }
}

class Data {
  static baseURL = "http://localhost:3000";
  static endpoint = Data.baseURL + "/api/libraries";

  static async fetchAndUpdate() {
    try {
      libs = await getData(Data.endpoint);
    } catch (error) {
      throw error;
    }
  }
}

class Location {
  static setUserLocation() {
    navigator.geolocation.getCurrentPosition(
      this.onPositionRetrieved.bind(this),
      this.onPositionError.bind(this)
    );
  }

  static onPositionRetrieved(position) {
    const { latitude, longitude } = position.coords;
    this.initMap(latitude, longitude);
  }

  static onPositionError(error) {
    console.error("Error: ", error.message);
    this.initMap(-27.4701, 153.0217); // Default location: Brisbane Square Library
  }

  static loadGoogleMapsScript() {
    const script = document.createElement("script");
    script.src =
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCOvpPBfLkyrLwcDcyhvdsoL5Ym4xhZA2Y&callback=initMap&v=weekly";
    script.defer = true;
    document.head.appendChild(script);
  }

  static initMap(latitude, longitude) {
    const iconBase =
      "https://developers.google.com/maps/documentation/javascript/examples/full/images/";
    const icons = {
      library: {
        icon: iconBase + "library_maps.png",
      },
      userLocation: {
        icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    };

    const map = new google.maps.Map(document.getElementById("map"), {
      center: new google.maps.LatLng(latitude, longitude),
      zoom: 10,
    });

    new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longitude),
      icon: icons.userLocation.icon,
      map: map,
    });

    const libraries = libs;
    for (const library of libraries) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          library.location.lat,
          library.location.long
        ),
        icon: icons.library.icon,
        map: map,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div>
          <h2>${library.name}</h2>
          <img src="${library.coverURL}" alt="${library.name}">
          <p>${library.address}</p>
        </div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    }
  }
}

window.initMap = function () {}; // The function is left blank as Google Maps requires it but it doesn't need to do anything

//Helper Functions
async function postData(url, data) {
  try {
    const response = await $.ajax({
      url: url,
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
    });

    return response;
  } catch (error) {
    throw error;
  }
}

async function getData(url) {
  try {
    const response = await $.ajax({
      url: url,
      type: "GET",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
    });

    return response;
  } catch (error) {
    throw error;
  }
}

function toggleLoginButtons(isLoggedIn) {
  if (isLoggedIn) {
    $(".loginBtn").hide();
    $(".logoutBtn").show();
  } else {
    $(".loginBtn").show();
    $(".logoutBtn").hide();
  }
}

function alertErrorMessage(title, defaultMsg, specificMsg) {
  navigator.notification.alert(specificMsg || defaultMsg, null, title, "OK");
}