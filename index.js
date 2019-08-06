const express = require('express');
    morgan = require('morgan');

const app = express();

let myMovies = [{
    title: 'Fight Club',
    directed: 'David Fincher'
    },
    {
        title: 'Fear and Loathing in Las Vegas',
        directed: 'Terry Gilliam'
    },
    {
        title: 'Dead Man',
        directed: 'Jim Jarmusch'
    },
    {
        title: 'Natural Born Killers',
        directed: 'Oliver Stone'
    },
    {
        title: 'Trainspotting',
        directed: 'Danny Boyle'
    },
    {
        title: 'La Haine',
        directed: 'Mathieu Kassovitz'
    },
    {
        title: 'The Big Lebowski',
        directed: 'Ethan Coen, Joel Coen'
    },
    {
        title: 'Four Rooms',
        directed: 'Allison Anders, Alexandre Rockwell, Robert Rodriguez, Quentin Tarantino'
    },
    {
        title: 'The Science of Sleep',
        directed: 'Michel Gondry'
    },
    {
        title: 'Death to Smoochy',
        directed: 'Danny DeVito'
    }
]

//morgan middleware library is used to log all requests
app.use(morgan('common'));

// request to return a JSON object containing data about top 10 movies
app.get('/movies', function(req, res) {
    res.json(myMovies)
});

// returns a default textual response
app.get('/', function(req, res) {
    res.send('What is your favorite movie?')
});

//use express.static to serve “documentation.html” file from the public folder
app.use(express.static('public'));

// error-handling middleware function to log all application-level errors to the terminal
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// requests listenening
app.listen(8080);