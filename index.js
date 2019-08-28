const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const validator = require('express-validator');
const passport = require ('passport');
const Models = require('./models.js');
require('./passport');

const app = express();
const Movies = Models.Movie;
const Users = Models.User;
app.use(bodyParser.json());
var auth = require('./auth')(app);
app.use(cors());
app.use(validator());
app.use(morgan('common')); /* morgan middleware to log all requests */

mongoose.connect('mongodb://localhost:27017/MyFlixDB', {useNewUrlParser: true});

// request to return a JSON object containing data about all the movies
app.get('/movies', passport.authenticate('jwt', {session: false}), function(req, res) {
    Movies.find()
    .then(function(movies) {
        res.status(201).json(movies)
    })
    .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// get data about a single movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), function (req, res) {
    Movies.findOne({Title : req.params.Title})
    .then(function(movies) {
        res.json(movies)
    })
    .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// get data about a genre by title
app.get('/movies/:Title/genre', passport.authenticate('jwt', {session: false}), function (req, res) {
    Movies.findOne({Title : req.params.Title})
    .then(function(movie) {
        if (movie) {
            res.status(201).send(movie.Title + " has " + movie.Genre.Name + " genre");
        } else {
            res.status(404).send("Movie with " + req.params.Title + " title was not found");
        }
    })
    .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});
    
// get data about a director by name
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), function (req, res) {
    Movies.findOne({"Director.Name" : req.params.Name})
    .then(function(movies) {
        res.json(movies.Director)
    })
    .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// allow new users to register
app.post('/users', function (req, res) {
    // request validation logic
    req.checkBody('Username', 'Username is required').notEmpty();
    req.checkBody('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric();
    req.checkBody('Password', 'Password is required').notEmpty();
    req.checkBody('Email', 'Email is required').notEmpty();
    req.checkBody('Email', 'Email does not appear to be valid').isEmail();

    // errors checking
    var errors = req.validationErrors();
    if (errors) {
        return res.status(422).json({errors: errors});
    }

    var hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({Username : req.body.Username})
    .then(function(user) {
        if (user) {
            return res.status(400).send(req.body.Username + " already exists");
        } else {
            Users.create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                DOB: req.body.DOB
            })
            .then(function(user) {
                res.status(201).json(user)
            })
            .catch(function(err) {
                console.error(err);
                res.status(500).send("Error: " + err);
            });
        }
    }).catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// allow users to update their info
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), function (req, res) {
    req.checkBody('Username', 'Username is required').notEmpty();
    req.checkBody('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric();
    req.checkBody('Password', 'Password is required').notEmpty();
    req.checkBody('Email', 'Email is required').notEmpty();
    req.checkBody('Email', 'Email does not appear to be valid').isEmail();

    var errors = req.validationErrors();
    if (errors) {
        return res.status(422).json({errors: errors});
    }

    Users.findOneAndUpdate({Username : req.params.Username}, {$set :
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            DOB: req.body.DOB
        }}, 
        {new : true},
        function(err, updatedUser) {
            if (err) {
                console.error(err);
                res.status(500).send("Error: " + err);
            } else {
                res.json(updatedUser)
            }
        })
});

// get data about user
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), function(req, res) {
    Users.findOne({Username : req.params.Username})
    .then(function(user){
        res.json(user)
    })
    .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// allow users to add a movie to their list of favorites
app.post('/users/:Username/Favorites/:MovieID', passport.authenticate('jwt', {session: false}), function (req, res) {
    Users.findOneAndUpdate({Username : req.params.Username}, {
        $push : {Favorites : req.params.MovieID}
    },
    {new : true},
    function(err, updatedUser){
        if (err){
            console.error(err);
            res.status(500).send("Error: " + err);
        } else {
            res.json(updatedUser)
        }
    })
});

// allow users to remove a movie from their list of favorites
app.delete('/users/:Username/Favorites/:MovieID', passport.authenticate('jwt', {session: false}), function (req, res) {
    Users.findOneAndUpdate ({Username : req.params.Username}, {
        $pull : {Favorites : req.params.MovieID}
    },
    {new : true},
    function(err, updatedUser){
        if (err){
            console.error(err);
            res.status(500).send("Error: " + err);
        } else {
            res.json(updatedUser)
        }
    })
});

// allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), function(req, res) {
    Users.findOneAndRemove ({Username : req.params.Username})
    .then(function(user) {
        if (!user){res.status(400).send("Your account was not found!");
    } else {
        res.status(200).send("You have been successfully deregistered!");
    }
})
.catch(function(err){
    console.error(err.stack);
    res.status(500).send("Error: " + err);
});
});

// returns a default textual response
app.get('/', function(req, res) {
    res.send("What is your favorite movie?")
});

//use express.static to serve "documentation.html" file from the public folder
app.use(express.static('public'));

// error-handling middleware function to log all application-level errors to the terminal
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

// requests listenening
app.listen(8080);