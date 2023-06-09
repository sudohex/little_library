document.addEventListener("deviceready", onDeviceReady, false);
let libs;
let baseURL = "https://nodeserver-cqu-little-library.onrender.com";
// let baseURL = "http://localhost:3000"
let endpoint = baseURL + "/api/libraries";
let isOnHomePage = true;

// Main func
async function onDeviceReady() {
  document.addEventListener("backbutton", onBackKeyDown, false);
  SpinnerDialog.show(null, "Loading data...");
  try {
    await Data.fetchAndUpdate();
    await UI.initialize(libs);
    Location.setUserLocation();
  } catch (error) {
    console.log(error);
    alertErrorMessage("Data Fetch Error", "Failed to fetch library data");
  } finally {
    SpinnerDialog.hide();
  }
}
// Override default back key function
function onBackKeyDown(e) {
  e.preventDefault();
  if (isOnHomePage) {
    navigator.app.exitApp();
  } else {
    window.location.href = "index.html";
    isOnHomePage = true;
  }
}
// This function should be called whenever the user navigates away from the home page
function onNavigateAwayFromHome() {
  isOnHomePage = false;
}

// Code that deals with Location (Google Map)
class Location {
  static setUserLocation() {
    var options = {
      enableHighAccuracy: true,
      maximumAge: 3600000,
    };
    navigator.geolocation.getCurrentPosition(
      this.onPositionRetrieved.bind(this),
      this.onPositionError.bind(this),
      options
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

  static initMap(latitude, longitude) {
    const icons = {
      library: {
        icon: "/img/library_maps.png",
      },
      userLocation: {
        icon: "/img/blue-dot.png",
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

    for (const library of libs) {
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(
          library.location.lat,
          library.location.long
        ),
        icon: icons.library.icon,
        map: map,
      });

      const googleMapsURL = `https://www.google.com/maps/search/?api=1&query=${library.location.lat},${library.location.long}`;

      const infoWindow = new google.maps.InfoWindow({
        content: `<div>
        <a href="${googleMapsURL}" target="_blank">${library.name}</a>
        <p>${library.address}</p>
      </div>`,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    }
  }
}

// Code that deals with Log in/ Log out
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

    await postData(baseURL + "/api/login", loginData)
      .then(() => {
        localStorage.setItem("loggedIn", "true");
        $(".loginBtn").hide();
        $(".logoutBtn").show();
        // Cleanup after successful login
        $("#username").val(""); // Clear username field
        $("#password").val(""); // Clear password field
        $.mobile.changePage("#library-list-page");
      })
      .catch((error) => {
        alertErrorMessage(
          "Login Error",
          "There was an error logging in",
          error.status === 401 ? "Username or password is incorrect" : undefined
        );
      });
  }

  static logout() {
    localStorage.setItem("loggedIn", "false");
    // Cleanup after logout
    toggleLoginButtons(false);
  }
}

// Code that set up user 
class UI {
  static async initialize(libs) {
    UI.displayLibraries(libs);
    UI.setupMenu();
    UI.setupLoginDisplay();
    UI.setupSearchDisplay(libs);
    UI.setupAddDisplay(libs);
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

    $(".btnRefresh")
      .off("click")
      .on("click", () => {
        onDeviceReady();
      });
  }
  static displayLibraries(libs) {
    let html = libs
      .map(
        (lib) =>
          `<a href="#library-details-popup" data-rel="popup" data-library-id="${lib._id}" class="ui-btn ui-corner-all ui-shadow ui-btn-a">
          <div style="display:flex; align-items: center;">
            <img src="${lib.coverURL}" class="library-icon" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;">
            <span class="library-name" style="font-size: 1.2em;">${lib.name}</span>
          </div>
        </a>`
      )
      .join("");

    $("#library-list").html(`<div>${html}</div>`);
    this.bindLibraryClickEvents(libs);
  }
  static bindLibraryClickEvents(libs) {
    const popupElements = {
      cover: $("#library-details-cover"),
      name: $("#library-details-name"),
      location: $("#library-details-address"),
      navigateButton: $("#navigate-button"),
      closeButton: $("#close-popup"),
      popup: $("#library-details-popup"),
    };

    $(document).on("click", "[data-rel=popup]", function () {
      const library = libs.find(
        (lib) => lib._id === $(this).data("library-id")
      );

      if (library) {
        UI.updatePopupContent(library, popupElements);
      }
    });
  }

  static updatePopupContent(library, popupElements) {
    const { cover, name, location, navigateButton, closeButton, popup } =
      popupElements;
    const {
      coverURL,
      name: libName,
      address,
      location: { lat, long },
    } = library;

    cover.attr("src", coverURL);
    name.text(libName);
    location.text(address);

    navigateButton.off("click").on("click", function (e) {
      e.preventDefault();
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${long}`,
        "_blank"
      );
    });

    closeButton.off("click").on("click", function (e) {
      e.preventDefault();
      popup.popup("close");
    });
  }
  static setupLoginDisplay() {
    $("#login-page").on("pageshow", function () {
      onNavigateAwayFromHome();
      $("#loginButton")
        .off("click")
        .on("click", function (event) {
          event.preventDefault();
          Auth.login();
        });
    });
  }
  static setupSearchDisplay(libs) {
    $("#find-book-page").on("pageshow", function () {
      onNavigateAwayFromHome();
      $("#searchInput")
        .off("input search")
        .on("input search", function () {
          const searchQuery = $(this).val().toLowerCase();
          const libsToDisplay = filterLibrariesByQuery(libs, searchQuery);
          if (searchQuery?.length >= 3) {
            displaySearchResult(libsToDisplay);
          } else {
            $("#search-result").html(
              "<div><span>Type first three characters to start searching...</span></div>"
            );
          }
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
  static setupAddDisplay(libs) {
    $("#add-page").on("pageshow", async function () {
      onNavigateAwayFromHome();
      if (!Auth.isLoggedIn()) {
        alertErrorMessage(
          "Login Required",
          "Login is required for adding a library or a book"
        );
        $.mobile.changePage("#login-page");
      } else {
        // setup add book form
        let html = libs
          ?.map((lib) => `<option value="${lib._id}">${lib.name}</option>`)
          .join("");

        $("#librarySelect").html(
          `<select id="librarySelectBox">${html}</select>`
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
                `${baseURL}/api/libraries/${libraryId}/books`,
                bookData
              ).then(async (res) => {
                // Cleanup after adding new book
                $("#text-1").val(""); // Clear book title
                $("#text-3").val(""); // Clear book author
                onDeviceReady();
              });

              $.mobile.changePage("#library-list-page");
            } catch (error) {
              alertErrorMessage("Error", "There was an error adding the book");
            }
          });

        // setup add library form
        $("#imageInput")
          .off("click")
          .on("click", function () {
            navigator.camera.getPicture(onSuccess, onFail, {
              quality: 50,
              destinationType: Camera.DestinationType.DATA_URL,
            });

            function onSuccess(imageData) {
              var image = document.getElementById("previewImage");
              image.src = "data:image/jpeg;base64," + imageData;
              image.style.display = "block";
              document.getElementById("libraryImage").value = imageData;
            }

            function onFail(message) {
              alert("Failed because: " + message);
            }
          });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            $("#newLibraryForm").data("location", {
              lat: position.coords.latitude,
              long: position.coords.longitude,
            });
          });
        }
        $("#saveNewLibrary")
          .off("click")
          .on("click", async function (e) {
            e.preventDefault();
            const name = $("#text-2").val();
            const address = $("#text-4").val();
            const imageName = "/img/placeholder.png";
            const libraryData = {
              name: name,
              address: address,
              location: $("#newLibraryForm").data("location"),
              coverURL: imageName,
            };

            try {
              await postData(`${baseURL}/api/libraries`, libraryData).then(
                async (res) => {
                  // saveImage(imageToSave, imageName) //Feature to implement using storage bucket
                  // Cleanup after adding new library
                  $("#text-2").val(""); // Clear library name
                  $("#text-4").val(""); // Clear library address
                  $("#previewImage").attr("src", "").hide(); // Reset and hide image preview
                  onDeviceReady();
                }
              );
              $.mobile.changePage("#library-list-page");
            } catch (error) {
              console.error(error);
              alertErrorMessage(
                "Error",
                "There was an error adding the library"
              );
            }
          });
      }
    });
  }
}

class Data {
  static async fetchAndUpdate() {
    try {
      libs = await getData(endpoint);
    } catch (error) {
      throw error;
    }
  }
}

//Helper Functions
window.initMap = function () {}; // The function is left blank as Google Maps requires it but it doesn't need to do anything
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
