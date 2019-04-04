'use strict'

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const environment = process.env.NODE_ENV || 'development';
const { secret } = require('../config/config')[environment].server;
const User = require('./../models/User');

// Used for password encryption
const salt = 2;

/*
  The Auth Controller is responsible 
  for all authentication related activites.

  This class will also send back error responses when needed
*/
class AuthController {
    // Creates a user

    static async createUser(req, res) {
        let params = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        }

        console.log(params)
        bcrypt.hash(params.password, salt)
        .then((hash) => {
            // Store hash in your password DB.
            const user = User
            .query()
            .insert({
                username: params.username,
                password: hash,
                email: params.email
            })
            .then((user) => {
                // creates the token
                let token = jwt.sign({username: user.username},
                    secret,
                    { 
                        expiresIn: 86400 // expires in 24 hours
                    }
                );
                res.status(200).send({ 
                    auth: true,
                    token: token,
                    message: "Success" 
                });
            })
            .catch((err) => {
                return res.status(500).send("There was a problem registering the user" + err);
            });
        })
        .catch((err) => {
            return res.status(500).send("There was a problem hashing the password");
        });
    }

    static async loginUser(req, res) {
        // Find if user exists
        let params = {
            username: req.body.username,
            password: req.body.password,
        }

        const user = await User
        .query()
        .select()
        .where('username', params.username)

        // If user does not exist in the backend
        if(user.length == 0) {
            return res.status(401).send({ 
                auth: false, 
                token: null,
                message: "The user does not exist"
            });
        }

        // Invalid password
        let validPassword = await bcrypt.compare(params.password, user[0].password)
        if(!validPassword) {
            return res.status(401).send({ 
                auth: false, 
                token: null,
                message: "Invalid login information"
            });
        }

        let token = jwt.sign({ username: user[0].username }, secret, {
            expiresIn: 86400
        });

        res.status(200).send({ 
            auth: true,
            token: token,
            message: "Success"
        });
    }

    static async findUser(req, res) {
        let token = req.headers['x-access-token'];
        if (!token) {
            return res.status(401).send({ 
                auth: false, message: 'No auth token provided.' 
            });
        }
  
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                return res.status(500).send({ 
                    auth: false, message: 'Failed to authenticate token.' 
                });
            }

            const user = User
            .query()
            .select()
            .where('username', decoded.username)
            .then((user) => {
                if (!user) {
                    return res.status(404).send("No user found.");
                }
                res.status(200).send(user);
            })
            .catch(err => {
                return res.status(500).send("There was a problem finding the user.");
            })

            // res.status(200).send(decoded);
        });
    }
}

module.exports = AuthController;