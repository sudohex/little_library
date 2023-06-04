const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();
const port = "3000";

app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb+srv://dbadmin:W7mCVXhfQmZRxmDV@cluster1.ttrsuqr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
  if (err) {
    console.error("MongoDB connection error:", err);
  } else {
    console.log("MongoDB connection successful");
  }
});

const db = client.db();

const Library = db.collection("libraries");

// Post a new book in a specific library
app.post("/api/libraries/:id/books", cors(), async (req, res) => {
  try {
    const newBook = req.body;
    const library = await Library.findOne({ _id: req.params.id });
    library.books.push(newBook);
    await Library.updateOne({ _id: req.params.id }, { $set: { books: library.books } });
    res.status(200).send(newBook);
  } catch (error) {
    console.error("Error adding new book:", error);
    res.status(500).send({
      msg: "Error adding new book to MongoDB",
      error: error.message,
    });
  }
});

// Post a new library
app.post("/api/libraries", cors(), async (req, res) => {
  try {
    const newLibrary = req.body;
    const result = await Library.insertOne(newLibrary);
    res.status(200).send(result.ops[0]);
  } catch (error) {
    console.error("Error creating new library:", error);
    res.status(500).send({
      msg: "Error creating new library in MongoDB",
      error: error.message,
    });
  }
});

// Get all libraries
app.get("/api/libraries", cors(), async (req, res) => {
  try {
    const libraries = await Library.find().toArray();
    console.log(libraries.length, "Libraries Received");
    res.status(200).send(libraries);
  } catch (error) {
    console.error("Error retrieving libraries:", error);
    res.status(500).send({
      msg: "Error retrieving libraries from MongoDB",
      error: error.message,
    });
  }
});

// DANGER DELETE ALL
app.delete("/api/libraries", cors(), async (req, res) => {
  try {
    await Library.deleteMany({});
    res.status(200).send({ msg: "All libraries deleted" });
  } catch (error) {
    console.error("Error deleting all libraries:", error);
    res.status(500).send({
      msg: "Error deleting all libraries from MongoDB",
      error: error.message,
    });
  }
});

// Run the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
