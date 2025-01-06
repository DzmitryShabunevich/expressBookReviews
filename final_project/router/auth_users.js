const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (user, username, password) => {
    return (user.username === username && user.password === password);
}

const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user) => {
        return isValid(user, username, password);
    });
    if (validusers.length > 0) {
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
        return res.status(404).json({ message: "Body Empty" });
    }
    if (!authenticatedUser(username,password)){
        return res.status(404).json({ message: "Not authenticated user, please sign up firstly" });
    }
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: {username, password}
    }, 'access', { expiresIn: 60 * 60 });

    // Store access token in session
    req.session.authorization = {
        accessToken
    }
    return res.status(200).send("User successfully logged in");

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const currentUsername = req.body.username;
    const reviewText = req.body.review;
    const ISBN = req.params.isbn;
    if(!books[ISBN]){
        return res.status(404).json({message: "No such book in the storage"});
    }
    if (books[ISBN]) { 
        books[ISBN].reviews[currentUsername] = reviewText; 
    } else { 
        
    return res.status(404).send(`Book with ISBN ${ISBN} can't be found`);
    } 

    return res.status(200).send(`Dear ${currentUsername}, you have submitted a new review for the book ${books[ISBN].title}`);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const currentUsername = req.body.username;
    const ISBN = req.params.isbn;
    if(!books[ISBN]){
        return res.status(404).json({message: "No such book in the storage"});
    }
    if (books[ISBN]) { 
        if (books[ISBN].reviews[currentUsername]) { 
            delete books[ISBN].reviews[currentUsername]; 
        } else { 
            return res.status(200).send(`Review by ${currentUsername} not found for book ID ${ISBN}.`); 
        }
    } else { 
        return res.status(404).send(`Book with ISBN ${ISBN} can't be found`);
    } 

    return res.status(200).send(`Dear ${currentUsername}, you have deleted a new review for the with ISBN ${ISBN} `);

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
