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
    try {
        await client.connect();
        db = client.db("Capstone2024");
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};

// Call initDB when the server starts
initDB().catch(console.error);

// Middleware configuration
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*", credentials: true })); // Enable credentials for CORS if needed

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Ensure this is correct

    //console.log('Received token:', token);  // Log the received token

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        }

        req.user = user;
        next(); 
    });
};

// API endpoints

// User registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password, organizer } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').insertOne({
            username,
            email,
            password: hashedPassword,
            organizer: organizer || false,
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            const token = jwt.sign(
                { id: user._id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '2d' }
            );
            return res.json({
                message: 'Login successful',
                token,
                username: user.username,
                organizer: user.organizer,
            });
        } else {
            return res.status(400).json({ message: 'Invalid password.' });
        }
    } catch (error) {
        console.error('Login error:', error.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Returns all concerts
app.get('/api/AllConcerts', async (req, res) => {
    try {
        const concerts = await db.collection("concerts").find({}).toArray();
        res.json(concerts);
    } catch (error) {
        console.error('Error fetching all concerts:', error.message);
        res.status(500).json({ message: 'Failed to fetch concerts' });
    }
});

// Reserve tickets for a concert
app.post('/api/reserveTickets', authenticateToken, async (req, res) => {
    const { concertId, numTickets } = req.body;
    const userId = req.user.id;

    if (!concertId || !numTickets || numTickets <= 0) {
        return res.status(400).json({ message: 'Concert ID and valid number of tickets are required.' });
    }

    try {
        // Find the concert by ID
        const concert = await db.collection('concerts').findOne({ _id: new ObjectId(concertId) });

        if (!concert) {
            return res.status(404).json({ message: 'Concert not found.' });
        }

        // Check if enough tickets are available
        if (concert.tickets.numAvail < numTickets) {
            return res.status(400).json({ message: 'Not enough tickets available.' });
        }

        // Reduce available ticket count
        await db.collection('concerts').updateOne(
            { _id: new ObjectId(concertId) },
            { $inc: { 'tickets.numAvail': -numTickets } }
        );

        // Create a reservation entry in the database
        const reservation = {
            userId,
            concertId,
            numTickets,
            status: 'Reserved', 
            reservedAt: new Date(),
        };
        await db.collection('reservations').insertOne(reservation);

        return res.status(201).json({ message: 'Tickets reserved successfully!', reservation });
    } catch (error) {
        console.error('Error reserving tickets:', error.message);
        return res.status(500).json({ message: 'Failed to reserve tickets.' });
    }
});

// Get user's reserved tickets
app.get('/api/user/tickets', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Find reservations made by the user
        const tickets = await db.collection('reservations').find({ userId }).toArray();

        if (!tickets.length) {
            return res.status(404).json({ message: 'No tickets found for this user.' });
        }

        // You may want to populate concert details or format the response as needed
        const ticketsWithConcertDetails = await Promise.all(tickets.map(async (ticket) => {
            const concert = await db.collection('concerts').findOne({ _id: new ObjectId(ticket.concertId) });
            return {
                reservationNumber: ticket._id, // Use the reservation ID as the reservation number
                concert,
                ticketType: concert.tickets.type, // Adjust according to your structure
                quantity: ticket.numTickets, // Assuming you store this in your reservations
            };
        }));

        res.json(ticketsWithConcertDetails);
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        return res.status(500).json({ message: 'Failed to fetch tickets.' });
    }
});



// Returns all venues
app.get('/api/Venues', async (req, res) => {
    try {
        const venues = await db.collection('venues').find({}).toArray();
        res.json(venues); // Send venues as JSON response
    } catch (error) {
        console.error('Error fetching venues:', error.message);
        res.status(500).json({ message: 'Failed to fetch venues' });
    }
});

app.post('/api/AddVenue', authenticateToken, async (req, res) => {
    const { name, address } = req.body;

    if (!name || !address) {
        return res.status(400).json({ message: 'Venue name and address are required.' });
    }

    try {
        const newVenue = { name, address };
        // Insert the new venue into your database
        await db.collection('venues').insertOne(newVenue);
        return res.status(201).json({ message: 'Venue added successfully', newVenue });
    } catch (error) {
        console.error('Error adding venue:', error.message);
        return res.status(500).json({ message: 'Failed to add venue.' });
    }
});

// Settings endpoint
app.put('/api/user/Settings', authenticateToken, async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username && !email && !password) {
        return res.status(400).json({ message: 'At least one field (username, email, or password) is required to update.' });
    }

    try {
        // Get user ID from the authenticated request
        const userId = req.user.id; 

        // Create an update object
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) {
            // Add basic email validation if needed
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format.' });
            }
            updateFields.email = email;
        }
        if (password) {
            // Hash password before saving
            const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
            updateFields.password = hashedPassword;
        }

        // Update the user in the database
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) }, // Filter by user ID
            { $set: updateFields } // Set the updated fields
        );

        // Check if the user was found and updated
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optionally exclude password from response
        if (updateFields.password) delete updateFields.password;

        res.status(200).json({ message: 'Settings updated successfully', updatedFields: updateFields });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Failed to update settings' });
    }
});


// Returns concerts for a venue
app.get('/api/concertsByVenue/:venue', async (req, res) => {
    try {
        const venueName = req.params.venue;
        const concerts = await db.collection("concerts").find({ venue: venueName }).toArray();
        // Check if concerts were found
        if (concerts.length === 0) {
            return res.status(404).json({ message: 'No concerts found for this venue' });
        }
        res.json(concerts);
    } catch (error) {
        console.error('Error fetching concerts:', error.message);
        res.status(500).json({ message: 'Failed to fetch concerts' });
    }
});


// Route to find a concert by ID
app.get('/api/ConcertDetails/:id', async (req, res) => {
    try {
        const concertId = req.params.id;
        const concert = await db.collection("concerts").findOne({ _id: new ObjectId(concertId) });

        if (!concert) {
            console.log("Concert not found");
            return res.status(404).json({ message: 'Concert not found' });
        }

        res.json(concert);
    } catch (error) {
        console.error('Error fetching concert:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Plan a new concert endpoint - ORGANIZER
app.post('/api/NewConcert', authenticateToken, async (req, res) => {
    const { artist, venue, tour, date, time, description, genre, address, rules, tickets } = req.body;
    const organizerUsername = req.user.username;

    if (!artist || (!venue && !address) || !tour || !date || !time || !description || !genre || !tickets || !tickets.type || !tickets.price || !tickets.numAvail) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if the venue exists in the database
        let existingVenue = await db.collection('venues').findOne({ name: venue });

        // If the venue does not exist, create a new venue
        if (!existingVenue) {
            const newVenue = {
                name: venue,
                address: address // Assume you're sending the address in the request
            };
            await db.collection('venues').insertOne(newVenue);
            existingVenue = newVenue; // Assign the newly created venue
        }

        // Create the concert object
        const concert = {
            artist,
            venue: existingVenue.name, // Store the venue name or use existingVenue._id if you store IDs
            tour,
            date,
            time,
            description,
            genre,
            rules,
            organizer: organizerUsername,
            tickets: {
                type: tickets.type,
                price: tickets.price,
                numAvail: tickets.numAvail
            }
        };

        // Insert the concert into the database
        await db.collection('concerts').insertOne(concert);
        return res.status(201).json({ message: 'Concert created successfully!', concert });
    } catch (error) {
        console.error('Error creating concert:', error.message);
        return res.status(500).json({ message: 'Failed to create concert.' });
    }
});


// Your Concerts endpoint - ORGANIZER
app.get('/api/YourConcerts', authenticateToken, async (req, res) => {
    const organizerUsername = req.user?.username;

    if (!organizerUsername) {
        console.log('Organizer username is missing.');
        return res.status(400).json({ message: 'Organizer username is required.' });
    }

    try {
        const concerts = await db.collection('concerts').find({ organizer: organizerUsername }).toArray();
        return res.json(concerts);
    } catch (error) {
        console.error('Error fetching concerts:', error.message);
        return res.status(500).json({ message: 'Failed to fetch concerts' });
    }
});

// Update concert endpoint
app.put('/api/ConcertDetails/:id', authenticateToken, async (req, res) => {
    const concertId = req.params.id;
    const organizerUsername = req.user.username;

    // Destructure the request body
    const { artist, venue, tour, date, time, description, genre, rules, tickets } = req.body;

    // Check for missing required fields
    if (!artist || !venue || !tour || !date || !time || !description || !genre || !tickets || !tickets.type || !tickets.price || !tickets.numAvail) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Find the concert in the database
        const concert = await db.collection("concerts").findOne({ _id: new ObjectId(concertId) });

        // Check if concert exists
        if (!concert) {
            return res.status(404).json({ message: 'Concert not found.' });
        }

        // Check if the user is authorized to edit this concert
        if (concert.organizer !== organizerUsername) {
            return res.status(403).json({ message: 'You are not authorized to edit this concert.' });
        }

        // Create the updated concert object
        const updatedConcert = {
            artist,
            venue,
            tour,
            date,
            time,
            description,
            genre,
            rules,
            tickets
        };

        // Update the concert in the database
        await db.collection('concerts').updateOne(
            { _id: new ObjectId(concertId) },
            { $set: updatedConcert }
        );

        // Respond with a success message and the updated concert data
        res.json({ message: 'Concert updated successfully!', concert: updatedConcert });
    } catch (error) {
        console.error('Error updating concert:', error.message);
        res.status(500).json({ message: 'Failed to update concert.', error: error.message });
    }
});

// Set up server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
