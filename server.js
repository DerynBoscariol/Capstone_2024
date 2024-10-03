// Import required modules
const express = require("express");
const path = require("path");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const port = process.env.PORT || "3000";

// MongoDB connection
const dbUrl = process.env.DB_URL;
const client = new MongoClient(dbUrl);
let db;

// Initialize database connection
const initDB = async () => {
    await client.connect();
    db = client.db("Capstone2024");
    console.log("Database connected!");
};

// Call initDB when the server starts
initDB().catch(console.error);

// Middleware configuration
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" })); // Allow requests from all servers

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from the Authorization header

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Unauthorized' }); // Return 401 if no token is found
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err.message); // Log the error message
            return res.status(403).json({ message: 'Forbidden' }); // Return 403 if token is invalid
        }

        req.user = user; // Attach user info to request
        console.log('Authenticated User:', user); // Log the user object for debugging
        next(); // Proceed to the next middleware or route handler
    });
};

// API endpoints

// User registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password, organizer } = req.body;

    // Validate request body
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if the user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' }); // Conflict
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').insertOne({
            username,
            email,
            password: hashedPassword,
            organizer: organizer || false,
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error); // Log the error for debugging
        res.status(500).json({ message: 'Registration failed' }); // Internal server error
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found.' }); // Clearer error if the user is not found
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
            const token = jwt.sign(
                { id: user._id, username: user.username }, // Include the username
                process.env.JWT_SECRET,
                { expiresIn: '2d' }
            );
            return res.json({ 
                message: 'Login successful', 
                token, 
                username: user.username,
                organizer: user.organizer 
            });
        } else {
            return res.status(400).json({ message: 'Invalid password.' }); // More specific error
        }
    } catch (error) {
        console.error('Login error:', error); // Log any server errors
        return res.status(500).json({ message: 'Internal server error.' }); // Handle any other server errors
    }
});

// Returns all concerts
app.get("/api/AllConcerts", async (req, res) => {
    try {
        const concerts = await db.collection("tables").find({}).toArray();
        res.json(concerts); // Send JSON object with appropriate JSON headers
    } catch (error) {
        console.error('Error fetching all concerts:', error); // Log any server errors
        res.status(500).json({ message: 'Failed to fetch concerts' });
    }
});

// Route to find a concert by ID
app.get('/api/ConcertDetails/:id', async (req, res) => {
    try {
        const concertId = req.params.id; // Get the ID from the URL
        console.log("Concert ID: ", concertId); // Log the ID here

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

// Plan a new concert endpoint - ORGANIZER
app.post('/api/NewConcert', authenticateToken, async (req, res) => {
    const { artist, venue, tour, date, time, description, address, rules, tickets } = req.body;
    const organizerUsername = req.user.username; // Get the organizer's username from the token

    // Validate required fields
    if (!artist || !venue || !tour || !date || !time || !description || !address || !tickets || !tickets.type || !tickets.price || !tickets.numAvail) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const concert = {
            artist,
            venue,
            tour,
            date,
            time,
            description,
            address,
            rules,
            organizer: organizerUsername, // Use the username from the authenticated user
            tickets: {
                type: tickets.type,
                price: tickets.price,
                numAvail: tickets.numAvail
            }
        };

        // Insert concert into database
        await db.collection('tables').insertOne(concert);

        return res.status(201).json({ message: 'Concert created successfully!', concert });
    } catch (error) {
        console.error('Error creating concert:', error);
        return res.status(500).json({ message: 'Failed to create concert.' });
    }
});

// Your Concerts endpoint - ORGANIZER
app.get('/api/YourConcerts', authenticateToken, async (req, res) => {
    console.log('Request Headers:', req.headers); // Log headers for debugging
    const organizerUsername = req.user?.username;  // Get the organizer's username

    if (!organizerUsername) {
        console.log('Organizer username is missing.');
        return res.status(400).json({ message: 'Organizer username is required.' });
    }

    try {
        const concerts = await db.collection('tables').find({ organizer: organizerUsername }).toArray();
        console.log('Fetched concerts:', concerts); // Log the concerts fetched
        return res.json(concerts);
    } catch (error) {
        console.error('Error fetching concerts:', error.message); // Log the error message
        return res.status(500).json({ message: 'Failed to fetch concerts' });
    }
});


// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route!', user: req.user });
});

// Set up server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
