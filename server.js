const express = require("express");
const path = require("path");
const cors = require("cors"); //need this to set this API to allow requests from other servers
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const { ObjectId } = require('mongodb'); 
dotenv.config();

const app = express();
const port = process.env.PORT || "3000";

const dbUrl = `mongodb+srv://dbUser:B%23sN%24Eihy-bpA5J@capstonecluster.mfvbk.mongodb.net/`;
const client = new MongoClient(dbUrl); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //need this line to be able to receive/parse JSON from request

//allow requests from all servers
app.use(cors({
  origin: "*"
})); 

//API endpoints

/*
 Returns all concerts
 */
 app.get("/api/AllConcerts", async (request, response) => {
    let concerts = await getAllConcerts();
    response.json(concerts); //send JSON object with appropriate JSON headers
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


//MongoDB functions
async function connection() {
    await client.connect();
    let db = client.db("Capstone2024"); //select Portfolio database
    return db;
  }
  async function getAllConcerts() {
    let db = await connection(); //await result of connection() and store the returned db
    var results = db.collection("tables").find({}); //{} as the query means no filter, so select all
    let res = await results.toArray();
    return res;
  }
  /*
  async function getConcertDetails(id) {
    let db = await connection(); //await result of connection() and store the returned db
    var results = db.collection("tables").find(_id = id); //{} as the query means no filter, so select all
    let res = await results.toArray();
    return res;
  }*/

//set up server listening
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });