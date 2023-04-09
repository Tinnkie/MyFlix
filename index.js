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

// Use Morgan middleware library to log all requests
app.use(morgan('common'));

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

// UPDATE USER 
app.put('/users/:username', (req, res) => {
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

// CREATE / POST NEW MOVIES IN USER LIST
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id} array.`);
    } else {
        res.status(400).send('No such user!')
    }
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
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username})
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// ADD A MOVIE TO USERS FAVORITES
app.post('/users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.MovieID}, { $push:
    {
        FavoriteMovies: req.body.FavoriteMovies,
    }
    },
    {new: true})
    .then ((updatedUser) => {
        res.json(updatedUser);
    })
    .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
  });

// DELETE A USER BY USERNAME
app.delete('/users/:Username', (req, res) => {
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

// DELETE (REMOVE) MOVIES IN USER LIST
app.delete('/users/:id/:movieTitle', (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
      },
      { new: true })
      .then((updatedUser) => res.json(updatedUser))
      .catch(err => {
        console.error(err);
        res.status(500).send("Something went wrong " + err.message);
     });
   });

// DELETE USER (DE-REGISTER)
app.delete('/users/:id', (req, res) => {
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

//READ ALL MOVIES
app.get('/movies', (req, res) => {
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
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = Movies.find (movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie!')
    }
})

//READ GENRE
app.get('/movies/genre/:genreName', (req, res) => {
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
app.get('/movies/directors/:directorName', (req, res) => {
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