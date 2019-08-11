const express = require('express');
    morgan = require('morgan');
    bodyParser = require('body-parser');
    uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let myMovies = [{
    title: 'Fight Club',
    description: ['Fight Club is a 1999 film based on the 1996 novel',
                    'of the same name by Chuck Palahniuk'],  
                    /* broke it for readability of code */
    genre: 'Drama',
    directed: 'David Fincher',
    imageURL: '#'
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
        directed: ['Allison Anders', 'Alexandre Rockwell', 
                    'Robert Rodriguez', 'Quentin Tarantino']
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

let users = [{
    username: 'JohnDoe',
    email: 'johndoe@email.com',
    password: 'swordfish',
    dob: '01/01/2001',
    favorites: []
}]

//morgan middleware library is used to log all requests
app.use(morgan('common'));

// request to return a JSON object containing data about top 10 movies
app.get('/movies', function(req, res) {
    res.json(myMovies)
});

// get data about a single movie by title
app.get('/movies/:title', function (req, res) {
    res.json(myMovies.find(function (movie) {
        return movie.title === req.params.title
    }));
});

// get data about a genre by title
app.get('/movies/:title/:genre', function (req, res) {
    let movie = myMovies.find((movie) => {
        return movie.title === req.params.title
    });

    if (movie) {
        res.status(201).send(movie.title + ' has ' + movie.genre + ' genre');
    } else {
        res.status(404).send('Movie with ' + req.params.title + ' title was not found');
    }
});

// get data about a director by name
app.get('/directed/:name', function (req, res) {
    res.send('Requested page is under construction! Please, come back shortly!');
});

// allow new users to register
app.post('/users', function (req, res) {
    let newUser = req.body;

    if (!newUser.username) {
        const message = 'Please, enter a username';
        res.status(400).send(message);
    } else {
        newUser.id = uuid.v4();   /* gives a unique id */
        users.push(newUser);
        res.status(201).send(newUser);
    }
});

// allow users to update their info (example for username by id)
app.put('/users/:id/:username', function (req, res) {
    let user = users.find((user) => {
        return user.id === req.params.id
    });

    if (user) {
        res.status(201).send('You have changed your username to ' 
        + req.params.username)
    } else {
        res.status(404).send('We are not able to find your id in the system')
    }
});

// allow users to add a movie to their list of favorites
app.post('/users/:username/:favorites', function (req, res) {
    let newFav = req.body;

    if (!newFav.favorites) {
        const message = 'Title is missing';
        res.status(400).send(message);
    } else {
        users.favorites.push(newFav);
        res.status(201).send(newFav);
    }
});

// allow users to remove a movie from their list of favorites
app.delete('/users/:username/:favorites', function (req, res) {
    res.send('Your favorite movie has been deleted');
});

// allow existing users to deregister using id
app.delete("/users/:id", (req, res) => {
    let user = users.find((user) => { 
        return user.id === req.params.id });
  
    if (user) {
      users.filter(function(obj) { return obj.id !== req.params.id });
      res.status(201).send('You have been successfully deregistered')
    }
});

// returns a default textual response
app.get('/', function(req, res) {
    res.send('What is your favorite movie?')
});

//use express.static to serve "documentation.html" file from the public folder
app.use(express.static('public'));

// error-handling middleware function to log all application-level errors to the terminal
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// requests listenening
app.listen(8080);