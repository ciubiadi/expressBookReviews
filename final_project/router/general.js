const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const fetchBooksAsync = async () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 200);
    });
};

const fetchBookDetailsAsync = async (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const bookDetails = books[isbn];
        if (bookDetails) {
          resolve(bookDetails);
        } else {
          reject(new Error("Book not found for the given ISBN."));
        }
      }, 200);
    });
};

const fetchBookDetailsByAuthorAsync = async (author) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matchingBooks = Object.values(books).filter(book => book.author === author);
        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found for the given author."));
        }
      }, 200);
    });
};

const fetchBookDetailsByTitleAsync = async (title) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matchingBooks = Object.values(books).filter(book => book.title === title);
        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found for the given title."));
        }
      }, 200);
    });
};

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
      if (!isValid(username)) {
        users.push({
            "username":username,
            "password":password
        });
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});
      }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    // Without Async await
    // res.send(JSON.stringify(books, null, 4));

    // With Async Await
    try {
        const booksList = await fetchBooksAsync();
        res.json(booksList);
    } catch (error) {
        console.error("Error fetching books:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
    // Without Promises
    // if(req.params.isbn){
    //     const isbn = req.params.isbn;

    //     res.send(JSON.stringify(books[isbn], null, 2));
    // } else {
    //     res.send("Book not found, wrong ISBN!")
    // }

    // With Promises
    const isbn = req.params.isbn;

    try {
        const bookDetails = await fetchBookDetailsAsync(isbn);
        res.json(bookDetails);
    } catch (error) {
        console.error("Error fetching book details:", error.message);
        res.status(404).json({ message: "Book not found for the given ISBN." });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
    // Without Promises
    // if (req.params.author) {
    //     const authorToFind = req.params.author;
    //     const bookKeys = Object.keys(books);
    
    //     // Iterate through the 'books' array & check if the author matches the one provided in the request parameters
    //     for (const key of bookKeys) {
    //       const book = books[key];
    //       if (book.author === authorToFind) {
    //         return res.json(book);
    //       }
    //     }
    
    //     res.send("Book not found for the given author!");
    //   } else {
    //     res.status(400).json({ message: "Author parameter is missing!" });
    //   }

    //   With Async Await
    const authorToFind = req.params.author;

    try {
      const matchingBooks = await fetchBookDetailsByAuthorAsync(authorToFind);
      res.json(matchingBooks);
    } catch (error) {
      console.error("Error fetching book details by author:", error.message);
      res.status(404).json({ message: "No books found for the given author." });
    }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    // in a Synchronous way
    // if (req.params.title) {
    //     const titleToFind = req.params.title;
    //     const bookKeys = Object.keys(books);
    
    //     for (const key of bookKeys) {
    //       const book = books[key];
    //       if (book.title === titleToFind) {
    //         return res.json(book);
    //       }
    //     }
    
    //     res.send("Book not found for the given title!");
    //   } else {
    //     res.status(400).json({ message: "Title parameter is missing!" });
    //   }

    // IN ASYNC way
    const titleToFind = req.params.title;
    try {
        const matchingBooks = await fetchBookDetailsByTitleAsync(titleToFind);
        res.json(matchingBooks);
    } catch (error) {
        console.error("Error fetching book details by title:", error.message);
        res.status(404).json({ message: "No books found for the given title." });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    if(req.params.isbn){
        const isbn = req.params.isbn;
        res.send(JSON.stringify(books[isbn].reviews, null, 2));
    } else {
        res.send("Book not found, wrong ISBN!")
    }
});

module.exports.general = public_users;
