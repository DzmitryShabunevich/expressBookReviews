const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let usersWithSamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (usersWithSamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!doesExist(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const ISBN = req.params.isbn;
    if(books[ISBN]){
        res.status(200).send(books[ISBN]);
    }
    else{
        return res.status(404).send(`There is no such book in the registry with ISBN ${ISBN}`);
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorFromParam = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author.includes(authorFromParam) );
    if(booksByAuthor.length > 0){
        res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    }
    else{
        return res.status(404).send(`There is no such book in the registry written by author ${authorFromParam}`);
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleFromParaps = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title.includes(titleFromParaps) );
    if(booksByTitle.length > 0){
        res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    }
    else{
        return res.status(404).send(`There is no such book in the registry with the title ${titleFromParaps}`);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const ISBN = req.params.isbn;
    if(books[ISBN]){
        if (!books[ISBN].review){
            res.status(200).send(`No reviews for the book with ISBN ${ISBN} yet`);
        }
        res.status(200).send(books[ISBN].review);
    }
    else{
        return res.status(404).send(`There is no such book in the registry with ISBN ${ISBN}`);
    }
});

module.exports.general = public_users;
