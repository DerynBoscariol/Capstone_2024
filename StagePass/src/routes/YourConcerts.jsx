import { Link } from 'react-router-dom'; 
import { useEffect, useState, useCallback } from 'react';

const YourConcerts = () => {
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => {
        return localStorage.getItem('token'); // JWT token in localStorage
    };

    const fetchConcerts = useCallback(async () => { // Use useCallback to memoize the function
        setLoading(true);
        setError(null); // Reset error state
        const token = getToken();

        if (!token) {
            setError('No token found. Please log in.');
            setLoading(false);
            return; // Exit if no token
        }

        console.log('Token:', token); // Log the token for debugging

        try {
            const response = await fetch('http://localhost:3000/api/YourConcerts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include token in Authorization header
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok'); // Handle non-200 responses
            }

            const concertsData = await response.json();
            console.log('Fetched concerts:', concertsData); // Log the fetched concerts
            setConcerts(concertsData); // Set concerts in state
        } catch (error) {
            console.error('Error fetching concerts:', error.message); // Log the error message
            setError(error.message); // Set error in state
        } finally {
            setLoading(false); // Stop loading
        }
    }, []); // Add empty dependency array since getToken is stable

    useEffect(() => {
        fetchConcerts();
    }, [fetchConcerts]); // Include fetchConcerts in the dependency array

    // Get today's date
    const today = new Date();

    // Separate concerts into upcoming and past
    const upcomingConcerts = concerts.filter(concert => new Date(concert.date) > today);
    const pastConcerts = concerts.filter(concert => new Date(concert.date) <= today);

    return (
        <div className="container mt-5">
            <h1>Your Concerts</h1>
            {loading && <p>Loading...</p>}
            {error && <div className="alert alert-danger">{error}</div>}

            <h2 className="mt-4">Upcoming Concerts</h2>
            {upcomingConcerts.length > 0 ? (
                <div className="row">
                    {upcomingConcerts.map(concert => (
                        <div className="col-md-4 mb-4" key={concert._id}>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{concert.artist}</h5>
                                    <p className="card-text">
                                        <strong>Venue:</strong> {concert.venue}<br />
                                        <strong>Date:</strong> {new Date(concert.date).toLocaleDateString()}<br />
                                        <strong>Time:</strong> {concert.time}<br />
                                        <strong>Description:</strong> {concert.description}
                                    </p>
                                    <Link to={`/ConcertDetails/${concert._id}`} className="btn btn-primary">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No upcoming concerts.</p>
            )}

            <h2 className="mt-4">Past Concerts</h2>
            {pastConcerts.length > 0 ? (
                <div className="row">
                    {pastConcerts.map(concert => (
                        <div className="col-md-4 mb-4" key={concert._id}>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{concert.artist}</h5>
                                    <p className="card-text">
                                        <strong>Venue:</strong> {concert.venue}<br />
                                        <strong>Date:</strong> {new Date(concert.date).toLocaleDateString()}<br />
                                        <strong>Time:</strong> {concert.time}<br />
                                        <strong>Description:</strong> {concert.description}
                                    </p>
                                    <Link to={`/concertDetails/${concert._id}`} className="btn btn-primary">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No past concerts.</p>
            )}
        </div>
    );
};

export default YourConcerts;
