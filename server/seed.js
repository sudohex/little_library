const dummyData = {
  libraries: [
    {
      name: "Annerly Library",
      coverURL: "/img/annerley.jpg",
      address: "450 Ipswich Road, Annerley, QLD, 4103",
      location: {
        lat: -27.509399,
        long: 153.033173,
      },
      books: [
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          description:
            "A novel about the injustices of race and class in the Deep South.",
        },
        {
          title: "1984",
          author: "George Orwell",
          description: "A dystopian novel about a totalitarian regime.",
        },
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          description:
            "A classic novel exploring societal expectations and love in 19th-century England.",
        },
      ],
    },
    {
      name: "Ashgrove Library",
      coverURL: "/img/ashgrove.jpg",
      address: "123 Ashgrove Ave, Ashgrove, QLD, 4060",
      location: {
        lat: -27.438490,
        long: 152.999313,
      },
      books: [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          description:
            "A story of wealth, love, and the American Dream in the Roaring Twenties.",
        },
        {
          title: "Moby-Dick",
          author: "Herman Melville",
          description:
            "An epic tale of a captain's obsessive quest for revenge against a white whale.",
        },
        {
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          description:
            "A coming-of-age novel following a teenager's experiences in New York City.",
        },
      ],
    },
    {
      name: "Banyo Library",
      coverURL: "/img/banyo.jpg",
      address: "200 Banyo Street, Banyo, QLD, 4014",
      location: {
        lat: -27.384940,
        long: 153.076310,
      },
      books: [
        {
          title: "To the Lighthouse",
          author: "Virginia Woolf",
          description:
            "A modernist novel exploring the inner lives of its characters.",
        },
        {
          title: "Jane Eyre",
          author: "Charlotte Bronte",
          description:
            "A Gothic novel following the life of an orphaned governess on her journey to self-discovery.",
        },
      ],
    },
    {
      name: "Bracken Ridge Library",
      coverURL: "/img/bracken-ridge.jpg",
      address: "77 Bracken Street, Bracken Ridge, QLD, 4017",
      location: {
        lat: -27.317970,
        long: 153.037888,
      },
      books: [
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          description:
            "A fantasy novel following the adventures of Bilbo Baggins in Middle-earth.",
        },
      ],
    },
    {
      name: "Brisbane Square Library",
      coverURL: "/img/brisbane-square.jpg",
      address: "266 George Street, Brisbane City, QLD, 4000",
      location: {
        lat: -27.470870,
        long: 153.022740,
      },
      books: [
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          description:
            "A classic novel exploring societal expectations and love in 19th-century England.",
        },
      ],
    },
    {
      name: "Bulimba Library",
      coverURL: "/img/bulimba.jpg",
      address: "154 Oxford Street, Bulimba, QLD, 4171",
      location: {
        lat: -27.451070,
        long: 153.057380,
      },
      books: [
        {
          title: "The Lord of the Rings",
          author: "J.R.R. Tolkien",
          description:
            "An epic high fantasy novel set in the world of Middle-earth.",
        },
      ],
    },
    {
      name: "Carina Library",
      coverURL: "/img/carina.jpg",
      address: "420 Old Cleveland Road, Carina, QLD, 4152",
      location: {
        lat: -27.4919,
        long: 153.0859,
      },
      books: [
        {
          title: "To the Lighthouse",
          author: "Virginia Woolf",
          description:
            "A modernist novel exploring the inner lives of its characters.",
        },
      ],
    },
    {
      name: "Carindale Library",
      coverURL: "/img/carindale.jpg",
      address: "1151 Creek Road, Carindale, QLD, 4152",
      location: {
        lat: -27.503160,
        long: 153.101650,
      },
      books: [
        {
          title: "1984",
          author: "George Orwell",
          description: "A dystopian novel about a totalitarian regime.",
        },
      ],
    },
  ],
};

async function deleteData(url = "") {
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Error during fetch: ${message}`);
  }

  return response.json();
}

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Error during fetch: ${message}`);
  }

  return response.json();
}

async function populateDB() {
  // Delete all existing data
  await deleteData("http://localhost:3000/api/libraries");

  // Add libraries (including books)
  for (const library of dummyData.libraries) {
    const newLibrary = await postData(
      "http://localhost:3000/api/libraries",
      library
    );
    console.log(newLibrary);
  }
}

populateDB();
