// document.addEventListener("deviceready", onDeviceReady, false);
$(document).ready(function () {
  onDeviceReady();
});
var data = {
  libraries: [
    {
      id: 1,
      name: "Central Library",
      address: "123 Main St",
      location: {
        lat: 40.73061,
        long: -73.935242,
      },
      books: [
        {
          id: 1,
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          description: "A novel about the injustices of race and class in the Deep South.",
        },
        {
          id: 2,
          title: "1984",
          author: "George Orwell",
          description: "A dystopian novel about totalitarian regime.",
        },
      ],
      users: [
        {
          id: 1,
          name: "User 1",
          phone: "(123) 456-7890",
          email: "user1@example.com",
          libraryId: 1,
        },
      ],
    },
    {
      id: 2,
      name: "Westside Library",
      address: "456 Park Ave",
      location: {
        lat: 40.760805,
        long: -73.965302,
      },
      books: [
        {
          id: 3,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          description: "A novel about the decline of the American Dream in the 1920s.",
        },
        {
          id: 4,
          title: "Moby-Dick",
          author: "Herman Melville",
          description: "A seafaring tale of obsession and revenge.",
        },
      ],
      users: [
        {
          id: 2,
          name: "User 2",
          phone: "(098) 765-4321",
          email: "user2@example.com",
          libraryId: 2,
        },
      ],
    },
    {
      id: 3,
      name: "Eastside Library",
      address: "789 Broad St",
      location: {
        lat: 40.704509,
        long: -73.987504,
      },
      books: [
        {
          id: 5,
          title: "Pride and Prejudice",
          author: "Jane Austen",
          description: "A romantic novel about manners and marriage in early 19th century England.",
        },
        {
          id: 6,
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          description: "A tale of adolescent alienation and loss of innocence.",
        },
      ],
      users: [
        {
          id: 3,
          name: "User 3",
          phone: "(091) 234-5678",
          email: "user3@example.com",
          libraryId: 3,
        },
      ],
    },
  ],
};
function onDeviceReady() {

  const baseURL = "http://localhost:3000";
  const endpoint = baseURL + "/api/tickets";
  let localData = localStorage.getItem("ticketData")
    ? JSON.parse(localStorage.getItem("ticketData"))
    : [];
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

  // Find Book
  let libraries = data.libraries 
  displayTable(libraries)
  $("#searchInput").on("input", function () {
    var searchQuery = $(this).val().toLowerCase();
    // Search data logic
    libraries = data.libraries.filter(function (library) {
      for (let book of library.books) {
        if (
          book.title.toLowerCase().includes(searchQuery) ||
          book.author.toLowerCase().includes(searchQuery)
        ) {
          return true;
        }
      }
      return false;
    });
    displayTable(libraries);
  });

  function displayTable(results) {
    $("#search-result").empty();
  
    if (results.length === 0) {
      $("#search-result").html('<div><span colspan="3">No results found</span></div>');
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
