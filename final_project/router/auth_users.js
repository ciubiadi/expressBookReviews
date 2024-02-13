const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let foundUsers = users.filter((user)=>{
        return user.username === username
    });
    if(foundUsers.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
   if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60*60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization && req.session.authorization.username;
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    
    if (!username || !isbn || !reviewText) {
      return res.status(400).json({ message: "Invalid request. Username, ISBN, or review is missing." });
    }
  
    if (books[isbn]) {
      // Check if the user has already posted a review for the same ISBN
      if (!books[isbn].reviews[username]) {
        books[isbn].reviews[username] = reviewText;
        return res.status(200).json({ message: "Review added successfully." });
      } else {
        books[isbn].reviews[username] = reviewText;
        return res.status(200).json({ message: "Review modified successfully." });
      }
    } else {
      return res.status(404).json({ message: "Book not found for the given ISBN." });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization && req.session.authorization.username;
    const isbn = req.params.isbn;

    if(!username || !isbn){
        return res.status(400).json({message: "Invalid request. Username or ISBN is missing."});
    }

    if(books[isbn]){
        if(!books[isbn].reviews[username]) {
            return res.status(200).json({ message: "You don't have any reviews added to this book!" });
        } else {
            delete books[isbn].reviews[username];    
            return res.status(200).json({ message: "You deleted the review succesfully!"});
        }
    } else {
        return res.status(404).json({ message: "Book not found for the given ISBN." });
      }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
