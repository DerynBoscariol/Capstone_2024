import { Link } from 'react-router-dom'; 
import { useEffect, useState, useCallback } from 'react';
import { formatDate, formatTime } from '../utils';

const YourConcerts = () => {
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => {
        return localStorage.getItem('token'); // JWT token in localStorage
    };

    const fetchConcerts = useCallback(async () => { 
        setLoading(true);
        setError(null); 
        const token = getToken();
    
        if (!token) {
            setError('No token found. Please log in.');
            setLoading(false);
            return; 
        }
    
        try {
            const response = await fetch('http://localhost:3000/api/YourConcerts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok'); 
            }
    
            const concertsData = await response.json();
            console.log('Fetched concerts:', concertsData); // Log fetched concerts
            setConcerts(concertsData); 
        } catch (error) {
            console.error('Error fetching concerts:', error.message); 
            setError(error.message); 
        } finally {
            setLoading(false);
        }
    }, []);
    

    const handleDeleteConcert = async (id) => {
        if (window.confirm('Are you sure you want to delete this concert?')) {
            const token = getToken();

            try {
                const response = await fetch(`http://localhost:3000/api/ConcertDetails/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Filter out the deleted concert from the state
                    setConcerts((prevConcerts) => prevConcerts.filter(concert => concert._id !== id));
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to delete concert.');
                }
            } catch (error) {
                console.error('Error deleting concert:', error);
                setError('Something went wrong. Please try again.');
            }
        }
    };

    useEffect(() => {
        fetchConcerts();
    }, [fetchConcerts]);

    const today = new Date();
    const upcomingConcerts = concerts.filter(concert => new Date(concert.date) > today);
    const pastConcerts = concerts.filter(concert => new Date(concert.date) <= today);

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Your Concerts</h1>
            {loading && <div className="text-center"><p className="text-muted">Loading...</p></div>}
            {error && <div className="alert alert-danger text-center">{error}</div>}
    
            <h2 className="mt-4">Upcoming Concerts</h2>
            {upcomingConcerts.length > 0 ? (
                <div className="row">
                    {upcomingConcerts.map(concert => (
                        <div className="col-md-4 mb-4" key={concert._id}>
                            <div className="card shadow-sm rounded">
                                <div className="card-body">
                                    <h5 className="card-title text-center">{concert.artist}</h5>
                                    <div className="card-text">
                                        <p><strong>Venue:</strong> {concert.venue}</p>
                                        <p><strong>Date:</strong> {formatDate(concert.date)}</p>
                                        <p><strong>Time:</strong> {formatTime(concert.time)}</p>
                                        <p><strong>Tickets Left:</strong> {concert.tickets.numAvail}</p>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/ConcertDetails/${concert._id}`} className="btn btn-primary">
                                            View Details
                                        </Link>
                                        <Link to={`/EditConcert/${concert._id}`} className="btn btn-secondary">
                                            Edit Concert
                                        </Link>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteConcert(concert._id)}
                                        >
                                            Delete Concert
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">No upcoming concerts.</p>
            )}
    
            <h2 className="mt-4">Past Concerts</h2>
            {pastConcerts.length > 0 ? (
                <div className="row">
                    {pastConcerts.map(concert => (
                        <div className="col-md-4 mb-4" key={concert._id}>
                            <div className="card shadow-sm rounded">
                                <div className="card-body">
                                    <h5 className="card-title text-center">{concert.artist}</h5>
                                    <div className="card-text">
                                        <p><strong>Venue:</strong> {concert.venue}</p>
                                        <p><strong>Date:</strong> {formatDate(concert.date)}</p>
                                        <p><strong>Time:</strong> {formatTime(concert.time)}</p>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <Link to={`/concertDetails/${concert._id}`} className="btn btn-primary">
                                            View Details
                                        </Link>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteConcert(concert._id)}
                                        >
                                            Delete Concert
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">No past concerts.</p>
            )}
        </div>
    );
    
};

export default YourConcerts;
