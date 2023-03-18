const bodyParser = require('body-parser');
const express = require('express');
    morgan = require('morgan');
    app = express(),
    uuid = require('uuid');

app.use(bodyParser.json());

// Use Morgan middleware library to log all requests
app.use(morgan('common'));

let users = [
    {
        id: 1,
        name: 'Jenny',
        favoriteMovies: []
    },
    {
        id: 2,
        name:'Joe',
        favoriteMovies: ['The Shawshank Redemption']
    }
]

let movies = [
    {
        title: 'The Shawshank Redemption',
        description: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
        genre: {
            name: 'Drama',
            description: 'A drama movie is a film that focuses on characters facing significant emotional, personal, or social challenges, often leading to moments of intense conflict and tension. These movies explore complex human experiences and aim to evoke powerful emotions in the audience, often featuring strong performances from the actors and multi-layered characters. They may focus on personal struggles or broader social issues and can vary in setting and time period.'
        },
        director: {
            name: 'Frank Darabont',
            bio: 'Three-time Oscar nominee Frank Darabont was born in a refugee camp in 1959 in Montbeliard, France, the son of Hungarian parents who had fled Budapest during the failed 1956 Hungarian revolution. Brought to America as an infant, he settled with his family in Los Angeles and attended Hollywood High School. His first job in movies was as a production assistant on the 1981 low-budget film, Hell Night (1981), starring Linda Blair. He spent the next six years working in the art department as a set dresser and in set construction while struggling to establish himself as a writer.',
            birth: '1959'
        },
        year: '1994',
        imageURL: 'https://m.media-amazon.com/images/I/71JxA6I+sgL._AC_SY879_.jpg'
    },
    {
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty in postwar New York City transfers control of his clandestine empire to his reluctant youngest son.',
        genre: {
            name: ['Crime', 'Drama'],
            description: 'A crime drama movie typically revolves around a criminal act and the investigation or pursuit of the perpetrator. It may also explore themes of morality, justice, and the impact of crime on individuals and society. The characters may include law enforcement officials, criminals, victims, and witnesses, and the plot may involve twists, turns, and unexpected revelations. Often, the movie will build tension and suspense as the investigation unfolds and the characters are drawn into a dangerous and complex web of deceit and betrayal.'
        },
        director: {
            name: 'Francis Ford Coppola',
            bio: 'Francis Ford Coppola was born in 1939 in Detroit, Michigan, but grew up in a New York suburb in a creative, supportive Italian-American family. His father, Carmine Coppola, was a composer and musician. His mother, Italia Coppola (née Pennino), had been an actress.',
            birth: '1939'
        },
        year: '1972',
        imageURL: 'https://m.media-amazon.com/images/I/81bpUqC2F0S._AC_SY741_.jpg'
    },
    {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        genre: {
            name: ['Crime', 'Drama'],
            description: 'A crime drama movie typically revolves around a criminal act and the investigation or pursuit of the perpetrator. It may also explore themes of morality, justice, and the impact of crime on individuals and society. The characters may include law enforcement officials, criminals, victims, and witnesses, and the plot may involve twists, turns, and unexpected revelations. Often, the movie will build tension and suspense as the investigation unfolds and the characters are drawn into a dangerous and complex web of deceit and betrayal.'
        },
        director: {
            name: 'Quentin Tarantino',
            bio: 'Quentin Jerome Tarantino was born in Knoxville, Tennessee. His father, Tony Tarantino, is an Italian-American actor and musician from New York, and his mother, Connie (McHugh), is a nurse from Tennessee. Quentin moved with his mother to Torrance, California, when he was four years old.',
            birth: '1963'
        },
        year: '1994',
        imageURL: 'https://m.media-amazon.com/images/I/71mlgE7nUdL._AC_SY741_.jpg'
    },
    {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanitys survival.',
        genre: {
            name: ['Adventure', 'Drama', 'Sci-Fi'],
            description: 'An adventure drama sci-fi movie usually takes place in a fictional or futuristic world and involves a thrilling and action-packed storyline. The plot often centers around an individual or group of characters who embark on a dangerous and exciting mission to save the world or uncover a hidden truth. The movie may explore themes such as the advancement of technology, humanitys relationship with the environment, or the consequences of scientific experimentation. The characters may face incredible obstacles and challenges, such as alien encounters, time travel, or battles against powerful machines or villains. Along the way, they will often learn important lessons about themselves and the world around them.'
        },
        director: {
            name: 'Christopher Nolan',
            bio: 'Best known for his cerebral, often nonlinear, storytelling, acclaimed writer-director Christopher Nolan was born on July 30, 1970, in London, England. Over the course of 15 years of filmmaking, Nolan has gone from low-budget independent films to working on some of the biggest blockbusters ever made.',
            birth: '1970'
        },
        year: '2014',
        imageURL: 'https://m.media-amazon.com/images/I/91obuWzA3XL._AC_SY879_.jpg'
    },
    {
        title: 'Saving Private Ryan',
        description: 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        genre: {
            name: ['Drama', 'War'],
            description: 'A drama war movie typically takes place during a time of conflict and explores the personal and emotional struggles of individuals caught up in the chaos of war. The characters may include soldiers, civilians, and political leaders, and the plot may focus on their experiences of loss, sacrifice, and heroism. The movie may also examine larger themes such as the morality of war, the impact of conflict on families and communities, and the role of nationalism and patriotism. The movie may also contain intense and realistic battle scenes, as well as moments of camaraderie and hope amidst the horrors of war. Overall, a drama war movie aims to provide a thought-provoking and emotional exploration of the human experience during times of conflict.'
        },
        director: {
            name: 'Steven Spielberg',
            bio: 'One of the most influential personalities in the history of cinema, Steven Spielberg is Hollywoods best known director and one of the wealthiest filmmakers in the world. He has an extraordinary number of commercially successful and critically acclaimed credits to his name, either as a director, producer or writer since launching the summer blockbuster with Jaws (1975), and he has done more to define popular film-making since the mid-1970s than anyone else.',
            birth: '1946'
        },
        year: '1998',
        imageURL: 'https://m.media-amazon.com/images/I/51RtERdTUIL._AC_.jpg'
    },
    
];

// CREATE NEW USER
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Users need names.')
    }
    console.log(newUser);
})

// UPDATE USER 
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find(user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('No such user!')
    }
})

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

// DELETE (REMOVE) MOVIES IN USER LIST
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter (title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id} array.`);
    } else {
        res.status(400).send('No such user!')
    }
})

// DELETE USER (DE-REGISTER)
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        user = users.filter (user => user.id != id);
        res.status(200).send(`User ${id} has been deleted.`);
    } else {
        res.status(400).send('No such user!')
    }
})

//READ ALL MOVIES
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

//READ MOVIE TITLE
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find (movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie!')
    }
})

//READ GENRE
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find (movie => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre!')
    }
})

//READ DIRECTOR
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find (movie => movie.director.name === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such director!')
    }
})

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