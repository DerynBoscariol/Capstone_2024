import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ConcertsByVenue = () => {
    const { venueName } = useParams(); // Get the venue name from the URL
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchConcertsByVenue = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/ConcertsByVenue/${venueName}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch concerts for this venue');
                }
                const data = await response.json();
                setConcerts(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConcertsByVenue();
    }, [venueName]);

    if (loading) return <p>Loading concerts...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h1>Concerts at {venueName}</h1>
            {concerts.length > 0 ? (
                <ul>
                    {concerts.map(concert => (
                        <li key={concert.id}>
                            <h2>{concert.artist}</h2>
                            <p>Date: {concert.date}</p>
                            <p>Time: {concert.time}</p>
                            <p>Description: {concert.description}</p>
                            <a href={`/ConcertDetails/${concert.id}`}>View Details</a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No concerts found for this venue.</p>
            )}
        </div>
    );
};

export default ConcertsByVenue;
