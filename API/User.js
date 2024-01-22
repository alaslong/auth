const express = require(`express`);
const router = express.Router();

// MongoDB user model
const User = require(`./../models/User`);

// MongoDB Verification model
const Verification = require(`./../models/Verification`);

// Password handler
const bcrypt = require(`bcrypt`);

// User ID handler
const {v4: uuidv4} = require('uuid');

// env variables
require(`dotenv`).config();

// Register

router.post(`/register`, (req, res) => {

    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if (name == `` || email == `` || password == ``) {
        res.json({
            status: `FAILED`,
            message: `Empty input fields!`,
        })
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        res.json({
            status: `FAILED`,
            message: `Invalid characters in name`,
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: `FAILED`,
            message: `Invalid email entered`,
        })
    } else if (password.length < 8) {
        res.json({
            status: `FAILED`,
            message: `Password is too short`,
        })
    } else {
        // Check if user already exists
        User.find({email}).then(result => {
            if (result.length) {
                // User already exists
                res.json({
                    status: `FAILED`,
                    message: `This email address is already registered`,
                })
            } else {
                // Try to create new user

                //Password handling
                const SaltRounds = 10;
                bcrypt.hash(password, SaltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                    });
                    newUser.save().then(result => {
                        res.json({
                            status: `SUCCESS`,
                            message: `Registration successful`,
                            data: result,
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.json({
                            status: `FAILED`,
                            message: `An error occurred while saving user account`,
                        })
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.json({
                        status: `FAILED`,
                        message: `An error occured while hashing password`,
                    })
                })

            }

        }).catch(err => {
            console.log(err);
            res.json({
                status: `FAILED`,
                message: `An error occured while checking for existing users`,
            })
        })
    }
});


// Login

router.post(`/login`, (req, res) => {

    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();

    if (email == `` || password == ``) {
        res.json({
            status: `FAILED`,
            message: `Email/Password fields cannot be empty`
        });

    } else {
        // Check if user exists
        User.find({email})
        .then(data => {
            if (data) {

                // User exists

                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {

                    if (result) {

                        // Password hash match

                        res.json({
                            status: `SUCCESS`,
                            message: `Login successful`,
                            data: data,
                        });
                        
                    } else {

                        // Password hash does not match

                        res.json({
                            status: `FAILED`,
                            message: `Invalid credentials`,
                        });

                    }
                })
                .catch(err => {
                    console.log(err);
                    res.json({
                        status: `FAILED`,
                        message: `An error occured while checking the password`,
                    });
                })

            } else {
                
                res.json({
                    status: `FAILED`,
                    message: `Invalid credentials`
                })
            }
        })
        .catch(err => {
            console.log(err);

            res.json({
                status: `FAILED`,
                message: `An error occured while checking for user`,
            })
        })
    }

});

module.exports = router;