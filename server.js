// Import required modules
const express = require("express"); // Express framework for handling HTTP requests and responses
const path = require("path"); // Path module for working with file and directory paths
const cors = require("cors"); // Middleware for enabling Cross-Origin Resource Sharing
const { MongoClient, ObjectId } = require("mongodb"); // MongoDB client for database operations
const dotenv = require("dotenv"); // Module to load environment variables from a .env file
const bcrypt = require('bcrypt'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for creating and verifying JSON Web Tokens
const multer = require('multer'); // Middleware for handling multipart/form-data (file uploads)
const { v4: uuidv4 } = require('uuid'); // UUID library for generating unique identifiers

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express(); // Create an instance of the Express application
const port = process.env.PORT || "3000"; // Define the port to listen on, defaulting to 3000 if not specified

// MongoDB connection setup
const dbUrl = process.env.DB_URL; // Get the database URL from environment variables
const client = new MongoClient(dbUrl); // Create a new MongoDB client
let db; // Variable to hold the database connection

// Initialize database connection
const initDB = async () => {
    try {
        await client.connect(); // Connect to the MongoDB server
        db = client.db("Capstone2024"); // Select the database
        console.log('Connected to MongoDB'); // Log successful connection
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message); // Log any connection errors
    }
};

// Call initDB to establish the database connection when the server starts
initDB().catch(console.error); // Start the database connection process, logging any errors

// Middleware configuration
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use(express.json()); // Middleware to parse JSON data
app.use(cors({ origin: "*", credentials: true })); // Enable CORS for all origins, allowing credentials

// Multer setup for handling file uploads
const fs = require('fs'); // File system module for interacting with the file system
const uploadDir = path.join(__dirname, "/StagePass/public/imageUploads"); // Define the upload directory

// Create the upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create directory recursively
}

// Configure multer storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Set the destination for uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueId = uuidv4(); // Generate a new unique ID for each file
        const fullFileName = uniqueId + '-' + file.originalname; // Create a unique filename
        console.log("Saving file to:", path.join(uploadDir, fullFileName)); // Log the full file path
        cb(null, fullFileName); // Set the filename
    }
});

// File filter to restrict accepted file types
const fileFilter = (req, file, cb) => {
    // Only accept JPEG and PNG file types
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
        cb(null, true); // Accept the file
    } else {
        cb(null, false); // Reject the file
    }
};

// Create multer instance with storage and file filter options
const upload = multer({
    storage: storage, // Use the defined storage settings
    limits: {
        fileSize: 1024 * 1024 * 5, // Set a file size limit of 5MB
    },
    fileFilter: fileFilter, // Use the defined file filter
});

// Serve static files from the upload directory
app.use("/imageUploads", express.static(path.join(__dirname, 'public/imageUploads'))); // Serve uploaded images

// Authentication middleware for protecting routes
const authenticateToken = (req, res, next) => {
    // Extract token from Authorization header
    const token = req.headers['authorization']?.split(' ')[1]; // Ensure this is correct

    // Log the received token for debugging 
    console.log('Received token:', token); 

    // Check if token is provided
    if (!token) {
        console.log('No token provided'); 
        return res.status(401).json({ message: 'Unauthorized' }); 
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err.message); // Log verification errors
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token' }); // Respond with forbidden status
        }

        req.user = user; // Attach user information to the request
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

// User Settings endpoint
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

// Endpoint for upcoming concerts - filtered by venue and genre
app.get('/api/FutureConcerts', async (req, res) => {
    const currentDate = new Date(); // Get the current date
    const { genre, venue } = req.query; // Get the genre and venue from the query parameters

    try {
        // Create the base filter for future concerts
        const filter = { date: { $gte: currentDate } };

        // If a genre is provided, add it to the filter
        if (genre) {
            filter.genre = genre;
        }

        // If a venue is provided, first find the venue ID by name
        let venueId;
        if (venue) {
            const venueDoc = await db.collection("venues").findOne({ name: venue });
            if (venueDoc) {
                venueId = venueDoc._id; // Get the venue ID
                filter.venueId = venueId; // Add the venue ID to the concert filter
            } else {
                // If no venue is found, return an empty response
                return res.status(404).json({ message: 'No concerts found for the specified venue.' });
            }
        }

        const futureConcerts = await db.collection("concerts").aggregate([
            {
                $match: filter // Match future concerts based on date, genre, and venue ID
            },
            {
                $lookup: {
                    from: "venues", // The collection with venue data
                    localField: "venueId", // Field in concerts that stores the venueId
                    foreignField: "_id", // Field in venues that stores the venue ID
                    as: "venueDetails" // Name of the array to store the venue details
                }
            },
            {
                $unwind: "$venueDetails" // Unwind the venue details array to access them directly
            },
            {
                $sort: { date: 1 } // Sort concerts by date (ascending)
            }
        ]).toArray();

        // Log fetched concerts for debugging
        console.log("Future concerts fetched with venue details:", futureConcerts);

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

// Endpoint to add a new venue - ORGANIZER
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

// Returns concerts for a venue
app.get('/api/concertsByVenue/:venueId', async (req, res) => {
    try {
        const venueId = req.params.venueId;
        
        // Convert the venueId to an ObjectId
        const objectIdVenueId = new ObjectId(venueId);

        // Find concerts by venueId
        const concerts = await db.collection("concerts").find({ venueId: objectIdVenueId }).toArray();

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
        if (!ObjectId.isValid(concertId)) {
            return res.status(400).json({ message: 'Invalid concert ID' });
        }
        // Fetch the concert details from the concerts collection
        const concert = await db.collection("concerts").findOne({ _id: new ObjectId(concertId) });

        if (!concert) {
            console.log("Concert not found");
            return res.status(404).json({ message: 'Concert not found' });
        }

        // Fetch the corresponding venue details based on the concert's venue name
        const venue = await db.collection("venues").findOne({ _id: concert.venueId });

        if (!venue) {
            console.log("Venue not found for concert:", concert.venueId);
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
    const { artist, venueId, tour, date, time, description, genre, address, rules, tickets } = req.body;
    const organizerUsername = req.user.username;
    const photo = req.file ? req.file.filename : null; // Check if file exists

    // Ensure all required fields are provided
    if (!artist || !venueId || !tour || !date || !time || !description || !genre || !tickets || !tickets.type || !tickets.price || !tickets.numAvail) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Check if the venue exists in the database using the venueId
        let existingVenue = await db.collection('venues').findOne({ _id: new ObjectId(venueId) });

        const photoPath = photo ? `/imageUploads/${photo}` : null; // Include the static path

        // If the venue does not exist, return an error (new venues should be handled separately)
        if (!existingVenue) {
            return res.status(400).json({ message: 'Selected venue does not exist.' });
        }

        // Convert the date and time to a Date object
        const concertDate = new Date(`${date}T${time}`); // Ensure it's in ISO format

        // Create the concert object
        const concert = {
            artist,
            venueId: new ObjectId(venueId), // Store the venue ID as an ObjectId reference
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
                price: parseFloat(tickets.price), // Ensure price is stored as a float
                numAvail: parseInt(tickets.numAvail) // Ensure number of tickets is stored as an integer
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


// Delete concert endpoint - ORGANIZER
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

// Update concert - ORGANIZER
app.put('/api/ConcertDetails/:id', authenticateToken, upload.single('photo'), async (req, res) => {
    const concertId = req.params.id;
    const organizerUsername = req.user.username;

    // Build update fields
    const updateFields = {
        artist: req.body.artist,
        venueId: new ObjectId(req.body.venueId),
        tour: req.body.tour,
        date: new Date(`${req.body.date}T${req.body.time}`), // ISO format
        time: req.body.time,
        description: req.body.description,
        rules: req.body.rules,
        genre: req.body.genre,
        tickets: {
            type: req.body['tickets.type'],
            price: parseFloat(req.body['tickets.price']), // Convert price to a number
            numAvail: parseInt(req.body['tickets.numAvail'], 10), // Ensure numAvail is an integer
        },
    };

    // Handle photo upload path
    const photo = req.file ? req.file.filename : null;
    if (photo) {
        updateFields.photoPath = `/imageUploads/${photo}`;
    }

    // Verify that required fields are present
    const requiredFields = [
        'artist', 'venueId', 'tour', 'date', 'time', 'description', 'rules', 'genre',
        'tickets.type', 'tickets.price', 'tickets.numAvail'
    ];

    for (const field of requiredFields) {
        const value = field.includes('.')
            ? field.split('.').reduce((o, key) => (o || {})[key], updateFields)
            : updateFields[field];
        if (value == null || value === '') {
            return res.status(400).json({ message: `Missing required field: ${field}` });
        }
    }

    try {
        // Ensure concertId is an ObjectId
        const concertObjectId = new ObjectId(concertId);

        // Find the concert and check user authorization
        const concert = await db.collection('concerts').findOne({ _id: concertObjectId, organizer: organizerUsername });
        if (!concert) {
            return res.status(404).json({ message: 'Concert not found or you are not authorized to update it.' });
        }

        // Update the concert in the database
        await db.collection('concerts').updateOne(
            { _id: concertObjectId },
            { $set: updateFields }
        );

        // Retrieve updated concert details to send to client
        const updatedConcert = await db.collection('concerts').findOne({ _id: concertObjectId });
        
        res.status(200).json({ message: 'Concert updated successfully.', concert: updatedConcert });
    } catch (error) {
        console.error('Error updating concert:', error);
        return res.status(500).json({ message: 'Failed to update concert.' });
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
        // Fetch concerts created by the authenticated user with venue details
        const concerts = await db.collection('concerts').aggregate([
            {
                $match: { organizer: organizerUsername } // Filter concerts by the authenticated user's username
            },
            {
                $lookup: {
                    from: 'venues', // venues collection
                    localField: 'venueId', // The field in concerts that references the venue
                    foreignField: '_id', // The field in venues collection that matches venueId
                    as: 'venueDetails'
                }
            },
            {
                $unwind: { 
                    path: '$venueDetails', 
                    preserveNullAndEmptyArrays: true // Keeps concerts without a venue
                }
            }
        ]).toArray();

        return res.json(concerts);
    } catch (error) {
        console.error('Error fetching concerts:', error.message);
        return res.status(500).json({ message: 'Failed to fetch concerts' });
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

        // Populate concert details and venue information
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

                // Fetch the corresponding venue details based on concert's venueId
                const venue = await db.collection('venues').findOne({ _id: new ObjectId(concert.venueId) });

                return {
                    reservationNumber: ticket._id, // Use the reservation ID as the reservation number
                    concert: {
                        ...concert, // Spread concert properties
                        venue: venue ? {
                            _id: venue._id,
                            name: venue.name,
                            address: venue.address,
                        } : null // Handle missing venue gracefully
                    },
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

        // update the available tickets
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
