const express = require("express");
const path = require("path");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const { ObjectId } = require('mongodb'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const port = process.env.PORT || "3000";

const dbUrl = process.env.DB_URL;
const client = new MongoClient(dbUrl); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Allow requests from all servers
app.use(cors({
  origin: "*"
})); 

// API endpoints

// Returns all concerts
app.get("/api/AllConcerts", async (request, response) => {
    let concerts = await getAllConcerts();
    response.json(concerts); // Send JSON object with appropriate JSON headers
});

// Route to find a concert by ID
app.get('/api/ConcertDetails/:id', async (req, res) => {
    try {
        const concertId = req.params.id; // Get the ID from the URL
        console.log("Concert ID: ", concertId); // Log the ID here
        const db = await connection(); // Connect to the database
        const concert = await db.collection("tables").findOne({ _id: new ObjectId(concertId) }); // Convert to ObjectId

        if (!concert) {
            console.log("Concert not found"); // Log if not found
            return res.status(404).json({ message: 'Concert not found' });
        }

        res.json(concert); // Send the concert data as JSON
    } catch (error) {
        console.error(error); // Log any server errors
        res.status(500).json({ message: 'Server error' });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await connection();
    const user = await db.collection('users').findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Use your secret key from environment variable
        return res.json({ message: 'Login successful', token, username: user.username  });
    }
    return res.status(400).json({ message: 'Invalid credentials' }); // Handle invalid login
});

// Middleware for user authentication (add to any routes that require user credentials/login)
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from the Authorization header

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // Attach user info to request
        next(); // Proceed to the next middleware or route handler
    });
};

// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route!', user: req.user });
});

// MongoDB functions
async function connection() {
    await client.connect();
    let db = client.db("Capstone2024");
    return db;
}

async function getAllConcerts() {
    let db = await connection(); 
    var results = db.collection("tables").find({});
    let res = await results.toArray();
    return res;
}

// Function to add user to the database
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate request body
  if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
  }

  const db = await connection();
  
  // Check if the user already exists
  const existingUser = await db.collection('users').findOne({ email });
  if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' }); // Conflict
  }

  try {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await db.collection('users').insertOne({
          username,
          email,
          password: hashedPassword,
      });
  
      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      console.error('Registration error:', error); // Log the error for debugging
      res.status(500).json({ message: 'Registration failed' }); // Internal server error
  }
});


// Set up server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
