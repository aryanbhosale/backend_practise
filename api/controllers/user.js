const mongoose = require('mongoose'); 
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.user_signup = (req, res, next) => { 
    User.find({ email: req.body.email }).exec().then((user) => {
        if(user.length >= 1) { // if user exists, throw an error 
            return res.status(409).json({
                message: "Email already exists!"
            }) // 409 status code means conflict
        } else { // if user doesn't exist, save the user
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({ error: err });
                } else {
                    const user = new User({ 
                        _id: new mongoose.Types.ObjectId(), 
                        email: req.body.email,
                        password: hash
                    });
                    user.save().then((result) => {
                        console.log(result)
                        res.status(201).json({ message: "User created." });
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).json({ error: err })
                    });
                }
            })
        }
    })
}

exports.user_delete = (req, res, next) => {
    User.deleteOne({ _id: req.params.userId }).exec().then((result) => {
        res.status(200).json({ message: "User deleted." })
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: err })
    })
}

exports.user_login = (req, res, next) => { 
    User.find({ email: req.body.email }).exec().then((user) => { 
        console.log(user)
        if(user.length < 1) {
            return res.status(401).json({ message: "Authorization failed." }); 
        }
    
        bcrypt.compare(req.body.password, user[0].password, (err, result) => { 
            if(err) {
                return res.status(401).json({ message: "Authorization failed." });
            }
            if(result) { 
                // make the changes for JWT here
                // here, what do we pass as the payload(which will be passed to the client) - we want to pass the user email and id and certainly not the password even though it's hashed
                const token = jwt.sign({  //this omits the need for a callback as the 4th parameter - see the "last argument..." comment for more understanding
                    email: user[0].email,
                    userId: user[0]._id
                }, //I'll pass the email and the user ID in the payload - first parameter
                process.env.JWT_KEY, //for the private key, I'll make use of the environment variable file (nodemon.json) - second parameter
                {
                    expiresIn: "1h", //as the third parameter, I'll pass a JavaScript Object which will have the expiresIn key set to 1 hour
                }) // the last argument is a callback where we get our token, you can however also omit this callback and just assign it to a constant like I just did here and then it'll run synchronously and assign the token to the constant
                res.status(200).json({ 
                    message: "Authentication successful." ,
                    token: token // send the token in the response along with the message
                });
            } else {
                return res.status(401).json({ message: "Authorization failed." });
            }
        })
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: err })
    }) 
}