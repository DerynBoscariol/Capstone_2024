import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate, formatTime } from '../utils';
import '../../public/css/styles.css';

export default function Home() {
    const [concerts, setAllConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [venues, setVenues] = useState([]);
    const [genres, setGenres] = useState([]); // State for genres
    const [selectedVenue, setSelectedVenue] = useState('');
    const [selectedGenre, setSelectedGenre] = useState(''); // State for selected genre

    useEffect(() => {
        const getAllConcerts = async () => {
            try {
                const genreParam = selectedGenre ? `?genre=${selectedGenre}` : '';
                let response = await fetch(`http://localhost:3000/api/FutureConcerts${genreParam}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                let data = await response.json();
                
                const concertsWithDates = data.map(concert => ({
                    ...concert,
                    date: new Date(concert.date) // Convert date string to Date object
                }));
    
                setAllConcerts(concertsWithDates);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
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
                setError(error.message);
            }
        };

        const getGenres = async () => {
            // Assuming you have an endpoint to fetch unique genres
            try {
                let response = await fetch("http://localhost:3000/api/Genres"); // You need to create this endpoint
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                let data = await response.json();
                setGenres(data);
            } catch (error) {
                setError(error.message);
            }
        };

        getAllConcerts();
        getVenues();
        getGenres(); // Fetch genres
    }, [selectedGenre]); // Rerun effect when selectedGenre changes

    if (loading) {
        return <p>Loading concerts...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    // Filter concerts based on selected venue and genre
    const filteredConcerts = concerts.filter(concert => {
        const venueMatch = selectedVenue ? concert.venue === selectedVenue : true;
        const genreMatch = selectedGenre ? concert.genre === selectedGenre : true;
        return venueMatch && genreMatch;
    });

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

            <div className="mb-3">
                <label htmlFor="genreSelect" className="form-label">Filter by Genre</label>
                <select
                    id="genreSelect"
                    className="form-select"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                >
                    <option value="">All Genres</option>
                    {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>

            {filteredConcerts.length === 0 ? (
                <p>No concerts available for the selected venue and/or genre.</p>
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

