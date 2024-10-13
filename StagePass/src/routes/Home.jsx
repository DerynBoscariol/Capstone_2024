import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate, formatTime } from '../utils';
import '../../public/css/styles.css';

export default function Home() {
    const [concerts, setAllConcerts] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [venues, setVenues] = useState([]); // State for venues
    const [selectedVenue, setSelectedVenue] = useState(''); // State for selected venue

    useEffect(() => {
        const getAllConcerts = async () => {
            try {
                let response = await fetch("http://localhost:3000/api/FutureConcerts");
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                let data = await response.json();
                //console.log("Raw concert data:", data); // Log the raw data
                
                // Convert the date strings to Date objects
                const concertsWithDates = data.map(concert => ({
                    ...concert,
                    date: new Date(concert.date)  // Convert date string to Date object
                }));
    
                setAllConcerts(concertsWithDates); // Set concerts with correct date formats
            } catch (error) {
                setError(error.message); // Set error message
            } finally {
                setLoading(false); // Set loading to false
            }
        };
    
        const getVenues = async () => {
            try {
                let response = await fetch("http://localhost:3000/api/Venues");
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                let data = await response.json();
                setVenues(data);
            } catch (error) {
                setError(error.message); // Set error message
            }
        };
    
        getAllConcerts();
        getVenues();
    }, []);
    
    

    if (loading) {
        return <p>Loading concerts...</p>; // Loading message
    }

    if (error) {
        return <p>Error: {error}</p>; // Error message
    }

    // Filter concerts based on selected venue
    const filteredConcerts = selectedVenue
        ? concerts.filter(concert => concert.venue === selectedVenue)
        : concerts;

    return (
        <main id="main" className="container mt-5">
            <h1 className="text-center mb-4">Explore Concerts Near You</h1>
            <h3 className="mb-3">Upcoming Concerts</h3>

            <div className="mb-3">
                <label htmlFor="venueSelect" className="form-label">Filter by Venue</label>
                <select
                    id="venueSelect"
                    className="form-select"
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                >
                    <option value="">All Venues</option>
                    {venues.map(venue => (
                        <option key={venue._id} value={venue.name}>{venue.name}</option>
                    ))}
                </select>
            </div>

            {filteredConcerts.length === 0 ? (
                <p>No concerts available for the selected venue or future dates.</p>
            ) : (
                <div className="row">
                    {filteredConcerts.map((concert) => (
                        <div key={concert._id} className="col-md-4">
                            <div className="card mb-4 shadow-sm">
                                <img
                                    className="concert-thumb card-img-top"
                                    src={concert.photoPath}
                                    alt={concert.artist}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {concert.artist} at {concert.venue}
                                    </h5>
                                    <p className="card-text">
                                        {concert.tour}
                                    </p>
                                    <p className="card-text">
                                        {formatDate(concert.date)} at {formatTime(concert.time)}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Link to={`/ConcertDetails/${concert._id}`} className="btn btn-primary">
                                            Tickets and Info
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
