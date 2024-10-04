import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../UserContext';

const EditConcert = () => {
    const { id } = useParams(); // Get the concert ID from the URL
    //const [setConcert] = useState(null); // Store concert data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const navigate = useNavigate();

    const [artist, setArtist] = useState('');
    const [venue, setVenue] = useState('');
    const [tour, setTour] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [address, setAddress] = useState('');
    const [rules, setRules] = useState('');
    const [ticketType, setTicketType] = useState('');
    const [ticketPrice, setTicketPrice] = useState('');
    const [numAvail, setNumAvail] = useState('');

    // Fetch the concert details
    useEffect(() => {
        const fetchConcert = async () => {
            if (!user?.token) {
                // If user token is not available, return early
                setError('You must be logged in to fetch concert details');
                return;
            }
    
            try {
                const response = await fetch(`http://localhost:3000/api/ConcertDetails/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    }
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch concert details.');
                }
    
                const concertData = await response.json();
                // Directly set the state for individual fields
                setArtist(concertData.artist);
                setVenue(concertData.venue);
                setTour(concertData.tour);
                setDate(concertData.date);
                setTime(concertData.time);
                setDescription(concertData.description);
                setGenre(concertData.genre);
                setAddress(concertData.address);
                setRules(concertData.rules);
                setTicketType(concertData.tickets.type);
                setTicketPrice(concertData.tickets.price);
                setNumAvail(concertData.tickets.numAvail);
            } catch (err) {
                console.error(err);
                setError('Failed to load concert details.');
            } finally {
                setLoading(false);
            }
        };
    
        fetchConcert();
    }, [id, user]); 
    

    // Handle form submission
    const handleUpdateConcert = async (e) => {
        e.preventDefault();
    
        if (!user || !user.token) { // Ensure user and token exist
            setError('You must be logged in to edit this concert');
            return;
        }
    
        console.log('Updating concert with token:', user.token); // Debug log
    
        try {
            const response = await fetch(`http://localhost:3000/api/ConcertDetails/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artist,
                    venue,
                    tour,
                    date,
                    time,
                    description,
                    genre,
                    address,
                    rules,
                    tickets: {
                        type: ticketType,
                        price: parseFloat(ticketPrice),
                        numAvail: parseInt(numAvail),
                    }
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                navigate('/YourConcerts'); // Redirect after successful update
            } else {
                setError(data.message || 'Failed to update concert');
            }
        } catch (err) {
            console.error('Error updating concert:', err);
            setError('Something went wrong. Please try again.');
        }
    };

    if (loading) return <p>Loading concert details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <main className="mx-4">
            <h1 className="text-center">Edit Concert</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleUpdateConcert} className="container">
                {/* Form fields for artist, venue, etc. */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="artist" className="form-label">Artist</label>
                        <input
                            type="text"
                            id="artist"
                            className="form-control"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="venue" className="form-label">Venue</label>
                        <input
                            type="text"
                            id="venue"
                            className="form-control"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="tour" className="form-label">Tour</label>
                        <input
                            type="text"
                            id="tour"
                            className="form-control"
                            value={tour}
                            onChange={(e) => setTour(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="genre" className="form-label">Genre</label>
                        <input
                            type="text"
                            id="genre"
                            className="form-control"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            required
                        />
                    </div>
                    <div className="row mb-3"></div>
                        <div className="col-md-3">
                            <label htmlFor="date" className="form-label">Date</label>
                            <input
                                type="date"
                                id="date"
                                className="form-control"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="time" className="form-label">Time</label>
                            <input
                                type="time"
                                id="time"
                                className="form-control"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        id="description"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input
                            type="text"
                            id="address"
                            className="form-control"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="rules" className="form-label">Rules</label>
                        <textarea
                            type="text"
                            id="rules"
                            className="form-control"
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4">
                        <label htmlFor="ticketType" className="form-label">Ticket Type</label>
                        <select
                            id="ticketType"
                            className="form-select"
                            value={ticketType}
                            onChange={(e) => setTicketType(e.target.value)}
                            required
                        >
                            <option value="">Select Ticket Type</option> {/* Default option */}
                            <option value="General Admission (Seated)">General Admission (Seated)</option>
                            <option value="General Admission (Standing)">General Admission (Standing)</option>
                            <option value="Reserved Seating">Reserved Seating</option>
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label htmlFor="ticketPrice" className="form-label">Ticket Price</label>
                        <input
                            type="number"
                            id="ticketPrice"
                            className="form-control"
                            value={ticketPrice}
                            onChange={(e) => setTicketPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="numAvail" className="form-label">Number of Tickets Available</label>
                        <input
                            type="number"
                            id="numAvail"
                            className="form-control"
                            value={numAvail}
                            onChange={(e) => setNumAvail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Update Concert</button>
            </form>
        </main>
    );
};

export default EditConcert;
