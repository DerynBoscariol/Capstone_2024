// Import required modules
const express = require("express");
const path = require("path");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

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

//Multer Setup
const fs = require('fs');
const uploadDir = path.join(__dirname, "/StagePass/public/imageUploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueId = uuidv4(); // Generate a new unique ID for each file
        const fullFileName = uniqueId + '-' + file.originalname;
        console.log("Saving file to:", path.join(uploadDir, fullFileName)); // Log the full file path
        cb(null, fullFileName);
    }
    
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit
    },
    fileFilter: fileFilter,
});

// Serve static files correctly
app.use("/imageUploads", express.static(path.join(__dirname, 'public/imageUploads')));


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
        const existingUsername = await db.collection('users').findOne({ username });
        if (existingUser || existingUsername) {
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

// Endpoint for upcoming concerts
app.get('/api/FutureConcerts', async (req, res) => {
    const currentDate = new Date(); // Get the current date
    const { genre } = req.query; // Get the genre from the query parameters

    try {
        // Create the base filter for future concerts
        const filter = { date: { $gte: currentDate } };

        // If a genre is provided, add it to the filter
        if (genre) {
            filter.genre = genre;
        }

        const futureConcerts = await db.collection("concerts")
            .find(filter)
            .sort({ date: 1 })
            .toArray();

        // Log fetched concerts for debugging
        console.log("Future concerts fetched:", futureConcerts);

        // Check if concerts were found
        if (futureConcerts.length === 0) {
            return res.status(404).json({ message: 'No future concerts found.' });
        }

        res.json(futureConcerts);
    } catch (error) {
        console.error('Error fetching future concerts:', error.message);
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

        // Ensure numAvail is a number
        let numAvail = concert.tickets.numAvail;

        // If numAvail is a string, convert it to a number
        if (typeof numAvail === 'string') {
            numAvail = parseInt(numAvail, 10);

            // Update the document in the database with the numeric value of numAvail
            await db.collection('concerts').updateOne(
                { _id: new ObjectId(concertId) },
                { $set: { 'tickets.numAvail': numAvail } }
            );
        }

        // Check if enough tickets are available
        if (numAvail < numTickets) {
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

        // Populate concert details
        const ticketsWithConcertDetails = await Promise.all(tickets.map(async (ticket) => {
            try {
                const concert = await db.collection('concerts').findOne({ _id: new ObjectId(ticket.concertId) });

                if (!concert) {
                    return { 
                        reservationNumber: ticket._id,
                        error: 'Concert not found', // Handle missing concert gracefully
                        quantity: ticket.numTickets
                    };
                }

                return {
                    reservationNumber: ticket._id, // Use the reservation ID as the reservation number
                    concert,
                    ticketType: concert.tickets ? concert.tickets.type : 'Unknown', // Safeguard in case tickets field is missing
                    quantity: ticket.numTickets,
                };
            } catch (error) {
                console.error('Error fetching concert details:', error.message);
                return { 
                    reservationNumber: ticket._id, 
                    error: 'Error fetching concert details', 
                    quantity: ticket.numTickets 
                };
            }
        }));

        res.json(ticketsWithConcertDetails);
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        return res.status(500).json({ message: 'Failed to fetch tickets.' });
    }
});

// Returns all genres
app.get('/api/Genres', async (req, res) => {
    try {
        const genres = await db.collection("concerts").distinct("genre");
        res.json(genres);
    } catch (error) {
        console.error('Error fetching genres:', error.message);
        res.status(500).json({ message: 'Failed to fetch genres' });
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

// Endpoint to add a new venue
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
        
        // Fetch the concert details from the concerts collection
        const concert = await db.collection("concerts").findOne({ _id: new ObjectId(concertId) });

        if (!concert) {
            console.log("Concert not found");
            return res.status(404).json({ message: 'Concert not found' });
        }

        // Fetch the corresponding venue details based on the concert's venue name
        const venue = await db.collection("venues").findOne({ name: concert.venue });

        if (!venue) {
            console.log("Venue not found for concert:", concert.venue);
            return res.status(404).json({ message: 'Venue not found' });
        }

        // Combine the concert and venue data
        const concertDetails = {
            ...concert, // Spread the concert properties
            venue: {     // Add the venue details
                _id: venue._id,
                name: venue.name,
                address: venue.address,
            },
        };

        console.log("Concert details with venue:", concertDetails);
        res.json(concertDetails);
    } catch (error) {
        console.error('Error fetching concert:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Plan a new concert endpoint - ORGANIZER
app.post('/api/NewConcert', authenticateToken, upload.single('photo'), async (req, res) => {
    const { artist, venue, tour, date, time, description, genre, address, rules, tickets } = req.body;
    const organizerUsername = req.user.username;
    const photo = req.file ? req.file.filename : null; // Check if file exists

    if (!artist || (!venue && !address) || !tour || !date || !time || !description || !genre || !tickets || !tickets.type || !tickets.price || !tickets.numAvail) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if the venue exists in the database
        let existingVenue = await db.collection('venues').findOne({ name: venue });

        const photoPath = photo ? `/imageUploads/${photo}` : null; // Include the static path

        // If the venue does not exist, create a new venue
        if (!existingVenue) {
            const newVenue = {
                name: venue,
                address: address // Assume you're sending the address in the request
            };
            await db.collection('venues').insertOne(newVenue);
            existingVenue = newVenue; // Assign the newly created venue
        }

        // Convert the date and time to a Date object
        const concertDate = new Date(`${date}T${time}`); // Ensure it's in ISO format

        // Create the concert object
        const concert = {
            artist,
            venue: existingVenue.name, // Store the venue name or use existingVenue._id if you store IDs
            tour,
            date: concertDate,
            time,
            description,
            photoPath,
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
    const updateFields = req.body;

    try {
        // Validate if the concert exists
        const concert = await db.collection('concerts').findOne({ _id: new ObjectId(concertId), organizer: organizerUsername });

        if (!concert) {
            return res.status(404).json({ message: 'Concert not found or you are not authorized to update it.' });
        }

        // Update concert details
        await db.collection('concerts').updateOne(
            { _id: new ObjectId(concertId) },
            { $set: updateFields }
        );

        res.status(200).json({ message: 'Concert updated successfully.' });
    } catch (error) {
        console.error('Error updating concert:', error.message);
        return res.status(500).json({ message: 'Failed to update concert.' });
    }
});


// Delete concert endpoint
app.delete('/api/concertDetails/:id', async (req, res) => {
    const concertId = req.params.id; // Get the concert ID from the URL parameters

    try {
        // Start by deleting the concert
        const concertResult = await db.collection('concerts').deleteOne({ _id: new ObjectId(concertId) });

        if (concertResult.deletedCount === 1) {
            // Now delete any reservations associated with the concert
            const reservationResult = await db.collection('reservations').deleteMany({ concertId: concertId });

            res.status(200).json({ 
                message: 'Concert and associated reservations deleted successfully.',
                deletedReservationsCount: reservationResult.deletedCount
            });
        } else {
            res.status(404).json({ message: 'Concert not found.' });
        }
    } catch (error) {
        console.error('Error deleting concert and reservations:', error);
        res.status(500).json({ message: 'Error deleting concert and associated reservations.' });
    }
});

// Delete a ticket reservation
app.delete('/api/reserveTickets/:id', authenticateToken, async (req, res) => {
    const reservationId = req.params.id; // Get the reservation ID from the URL
    const userId = req.user.id; // Get the user ID from the authenticated request

    try {
        // Find the reservation by ID and ensure it belongs to the user
        const reservation = await db.collection('reservations').findOne({ _id: new ObjectId(reservationId), userId });

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found or does not belong to the user.' });
        }

        // Optionally, you may want to update the available tickets if needed
        const concert = await db.collection('concerts').findOne({ _id: new ObjectId(reservation.concertId) });
        if (concert) {
            await db.collection('concerts').updateOne(
                { _id: new ObjectId(reservation.concertId) },
                { $inc: { 'tickets.numAvail': reservation.numTickets } } // Restore the reserved tickets
            );
        }

        // Delete the reservation
        await db.collection('reservations').deleteOne({ _id: new ObjectId(reservationId) });

        return res.status(200).json({ message: 'Reservation deleted successfully.' });
    } catch (error) {
        console.error('Error deleting reservation:', error.message);
        return res.status(500).json({ message: 'Failed to delete reservation.' });
    }
});



// Set up server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
