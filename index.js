const bodyParser = require('body-parser');
const express = require('express');
    morgan = require('morgan');
    app = express(),
    uuid = require('uuid');
const cors = require('cors');
const mongoose = require('mongoose');
const Models = require('./models');

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({}));

require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

// Use Morgan middleware library to log all requests
app.use(morgan('common'));

/**
 * Allow new users to register
 * @name registerUser
 * @param {string} Username username
 * @param {string} Password password
 * @param {string} Email email
 * @param {date} Birthday birthday
 * @kind function
 */

// CREATE A NEW USER
app.post('/users',   [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({Username: req.body.Username})
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
            .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user)})
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
})

/**
 * GET a list of all users at the "/users" endpoint
 * @name users
 * @kind function
 * @returns array of user objects
 */

// GET ALL USERS
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
      res.status(201).json(users);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

// GET A USER BY USERNAME
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.username})
  .then((user) => {
      res.json(user);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

/**
 * Allow users to update their user info (except username)
 * @name updateUser
 * @param {string} Username username
 * @param {string} Password password
 * @param {string} Email email
 * @param {date} Birthday birthday
 * @kind function
 * @requires passport
 */

// UPDATE USER 
app.put('/users/:username', passport.authenticate('jwt', { session: false }), [
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.username }, { $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true })
    .then((updatedUser) => res.json(updatedUser))
    .catch(err => {
        console.error(err);
        res.status(500).send("Something went wrong " + err.message);
    });
  });

/**
 * Allow existing users to deregister (showing only a text that a user has been removed)
 * @name removeUser
 * @param {string} id user ID
 * @kind function
 * @requires passport
 */

// DELETE A USER BY USERNAME (DE-REGISTER)
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});  

/**
 * Allow users to add a movie to their list of favorites (showing only a text that a movie has been added)
 * @name addFavoriteMovie
 * @param {string} Username username
 * @param {string} movieId movie ID
 * @kind function
 * @requires passport
 */

// ADD A MOVIE TO USERS FAVORITES
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $push: { FavoriteMovies: req.params.movieId } },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

/**
 * Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed)
 * @name removeFavoriteMovie
 * @param {string} Username username
 * @param {string} movieId movie ID
 * @kind function
 * @requires passport
 */

// DELETE (REMOVE) MOVIES IN USER LIST
app.delete('/users/:username/movies/:MovieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findOne({Username: req.params.username}).lean();
    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log(user.FavoriteMovies, `logging favourite movies`);

    if (!Array.isArray(user.FavoriteMovies)) {
      return res.status(400).send('FavoriteMovies is not an array');
    }

    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { FavoriteMovies: new mongoose.Types.ObjectId(req.params.MovieId) } },
      { new: true }
    ).lean();

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

/**
 * GET a list of all movies at the "/movies" endpoint
 * @name movies
 * @kind function
 * @returns array of movie objects
 * @requires passport
 */

//READ ALL MOVIES
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});  

/**
 * GET a single movie by title at the "/movies/[Title]" endpoint
 * @name movie
 * @param {string} title movie title
 * @kind function
 * @returns movie object
 * @requires passport
 */

//READ MOVIE TITLE
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { title } = req.params;
   Movies.findOne({Title: title})
   .then((movie) => {
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('No such movie!')
    }
   })
   .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
})

/**
 * GET a genre (description) by name the "/movies/[Genre]/[Name]" endpoint
 * @name genre
 * @param {string} genreName genre name
 * @kind function
 * @returns genre object
 * @requires passport
 */

//READ GENRE
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET a director by name at the "/movies/[Director]/[Name]" endpoint
 * @name director
 * @param {string} directorName director name
 * @kind function
 * @returns director object
 * @requires passport
 */

//READ DIRECTOR
app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
}); 

/**
 * GET the API documentation at the "/documentation" endpoint
 * @name documentation
 * @kind function
 * @returns the contents of documentation.html
 */

// READ
app.get('/', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

// Serve documentation.html
app.use(express.static('public'));

// app.get('/documentation', (req, res) => {  
//    res.sendFile('public/documentation.html', { root: __dirname });
//   });

// Error handling function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});

/*app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});*/
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});