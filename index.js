const express = require('express');
    morgan = require('morgan');

const app = express();

// Use Morgan middleware library to log all requests
app.use(morgan('common'));

let movies = [
    {
        title: 'The Shawshank Redemption',
        genre: 'Drama',
        year: '1994'
    },
    {
        title: 'The Godfather',
        genre: 'Crime',
        year: '1972'
    },
    {
        title: 'Pulp Fiction',
        genre: 'Crime',
        year: '1994'
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        genre: 'Action',
        year: '2001'
    },
    {
        title: 'Interstellar',
        genre: 'Adventure',
        year: '2014'
    },
    {
        title: 'Whiplash',
        genre: 'Drama',
        year: '2014'
    },
    {
        title: 'Avengers: Endgame',
        genre: 'Action',
        year: '2019'
    },
    {
        title: 'Top Gun: Maverick',
        genre: 'Action',
        year: '2022'
    },
    {
        title: 'Spider-Man: No Way Home',
        genre: '2021',
        year: 'Action'
    },
    {
        title: 'The Wolf of Wall Street',
        genre: 'Biography',
        year: '2013'
    },
];

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

app.listen(8081, () => {
    console.log('Your app is listening to port 8081.');
});