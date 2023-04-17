const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {useNewUrlParser: true, useUnifiedTopology: true});


const bodyParser = require('body-parser');
const express = require('express');
    morgan = require('morgan');
    app = express(),
    uuid = require('uuid');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth.js')(app);

const passport = require('passport');
require('./passport.js');

// Use Morgan middleware library to log all requests
app.use(morgan('common'));

// CREATE A NEW USER
app.post('/users', (req, res) => {
    Users.findOne({Username: req.body.Username})
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
            .create({
                Username: req.body.Username,
                Password: req.body.Password,
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
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username})
  .then((user) => {
      res.json(user);
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

// UPDATE USER 
app.put('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.username }, { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
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

// DELETE (REMOVE) MOVIES IN USER LIST
app.delete('/users/:id/movies/:MovieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await Users.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log(user.FavoriteMovies, `logging favourite movies`);

    if (!Array.isArray(user.FavoriteMovies)) {
      return res.status(400).send('FavoriteMovies is not an array');
    }

    const updatedUser = await Users.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { FavoriteMovies: new mongoose.Types.ObjectId(req.params.MovieId) } },
      { new: true }
    ).lean();

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

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

//READ MOVIE TITLE
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { title } = req.params;
    const movie = Movies.find (movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie!')
    }
})

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

app.get ('/', (req, res) => {
    res.send('Welcome to myFlix Movie Database');
});

app.get ('/movies', (req, res) => {
    res.send(movies);
});
// Serve documentation.html
app.use(express.static('public'));

app.get('/documentation', (req, res) => {  
   res.sendFile('public/documentation.html', { root: __dirname });
  });

// Error handling function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});

app.listen(8080, () => {
    console.log('Your app is listening to port 8080.');
});