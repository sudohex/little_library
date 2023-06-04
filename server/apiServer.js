require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();

const port = "3000";
app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://dbadmin:W7mCVXhfQmZRxmDV@cluster1.ttrsuqr.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connection successful'))
  .catch((err) => console.error('MongoDB connection error: ', err));

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to Mongo Atlas');
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
});

const LibrarySchema = new mongoose.Schema({
  coverURL: String,
  name: String,
  address: String,
  location: { lat: Number, long: Number },
  books: [BookSchema],
});

const Library = mongoose.model('Library', LibrarySchema);

app.post('/api/login', cors(), (req, res) => {
  // Here you should implement your real login mechanism.
  // This is just a placeholder that always responds with 200 OK.
  res.status(200).json({msg: 'Successfully logged in'});
});

// Post a new book in a specific library
app.post("/api/libraries/:id/books", cors(), async (req, res) => {
  try {
    const newBook = req.body;
    const library = await Library.findById(req.params.id);
    library.books.push(newBook);
    await library.save();
    res.status(200).send(newBook);
  } catch (error) {
    console.error('Error adding new book: ', error);
    res.status(500).send({
      msg: "Error adding new book to MongoDB",
      error: error.message,
    });
  }
});

// Post a new library
app.post("/api/libraries", cors(), async (req, res) => {
  try {
    const newLibrary = new Library(req.body);
    const savedLibrary = await newLibrary.save();
    res.status(200).send(savedLibrary);
  } catch (error) {
    console.error('Error creating new library: ', error);
    res.status(500).send({
      msg: "Error creating new library in MongoDB",
      error: error.message,
    });
  }
});

// Get all libraries
app.get("/api/libraries", cors(), async (req, res) => {
  try {
    const libraries = await Library.find().lean();
    console.log(libraries.length, "Libraries Received");
    res.status(200).send(libraries);
  } catch (error) {
    console.error('Error retrieving libraries: ', error);
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
    res.status(200).send({msg: "All libraries deleted"});
  } catch (error) {
    console.error('Error deleting all libraries: ', error);
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

