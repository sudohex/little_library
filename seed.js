const dummyData = {
    "libraries": [
      {
        "name": "Central Library",
        "address": "123 Main St",
        "location": {
          "lat": 40.730610,
          "long": -73.935242
        },
        "books": [
          {
            "title": "Book Title 1",
            "author": "Author 1",
            "description": "Description 1"
          },
          {
            "title": "Book Title 2",
            "author": "Author 2",
            "description": "Description 2"
          }
        ], 
        "users": [
            {
              "name": "User 1",
              "phone": "(123) 456-7890",
              "email": "user1@example.com",
              
            },
            {
              "name": "User 2",
              "phone": "(098) 765-4321",
              "email": "user2@example.com",
      
            }
          ]
      },
      {
        "name": "Westside Library",
        "address": "456 Park Ave",
        "location": {
          "lat": 40.760805,
          "long": -73.965302
        },
        "books": [
          {
            "title": "Book Title 3",
            "author": "Author 3",
            "description": "Description 3"
          },
          {
            "title": "Book Title 4",
            "author": "Author 4",
            "description": "Description 4"
          }
        ],
        "users": [
            {
              "name": "User 3",
              "phone": "(123) 356-7890",
              "email": "user3@example.com",
              
            },
            {
              "name": "User 4",
              "phone": "(098) 365-4321",
              "email": "user4@example.com",
      
            }
          ]
      }
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
  