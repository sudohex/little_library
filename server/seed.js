const dummyData =  {
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

    },
  ],
};

  

  async function deleteData(url = '') {
    const response = await fetch(url, {
      method: 'DELETE'
    });
  
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Error during fetch: ${message}`);
    }
  
    return response.json();
  }
  
  async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Error during fetch: ${message}`);
    }
  
    return response.json();
  }
  
  async function populateDB() {
    // Delete all existing data
    await deleteData('http://localhost:3000/api/libraries');
  
    // Add libraries (including books)
    for (const library of dummyData.libraries) {
      const newLibrary = await postData('http://localhost:3000/api/libraries', library);
      console.log(newLibrary);
    }
  
  }
  
  populateDB();
  