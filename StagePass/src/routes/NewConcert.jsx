import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; // Import the useUser hook to get the current user

const NewConcert = () => {
    const [artist, setArtist] = useState('');
    const [venue, setVenue] = useState('');
    const [tour, setTour] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [rules, setRules] = useState('');
    const [ticketType, setTicketType] = useState('');
    const [ticketPrice, setTicketPrice] = useState('');
    const [numAvail, setNumAvail] = useState('');
    const [error, setError] = useState('');

    const { user } = useUser(); // Access the user from UserContext
    const navigate = useNavigate();

    const handleCreateConcert = async (e) => {
        e.preventDefault();

        // Ensure the user is logged in before submitting
        if (!user) {
            setError('You must be logged in to create a concert');
            return;
        }
        
        // Simple form validation
        if (!artist || !venue || !tour || !date || !time || !description || !address || !rules || !ticketType || !ticketPrice || !numAvail) {
            setError('Please fill out all fields');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/NewConcert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artist,
                    venue,
                    tour,
                    date,
                    time,
                    description,
                    address,
                    rules,
                    organizer: user.username, // Use the logged-in user's username as the organizer
                    tickets: {
                        type: ticketType,
                        price: parseFloat(ticketPrice),
                        numAvail: parseInt(numAvail),
                    }
                }),
            });
            const data = await response.json();

            if (response.ok) {
                console.log('Concert created:', data);
                navigate('/'); // Redirect to the homepage or a different page
            } else {
                setError(data.message || 'Failed to create concert');
            }
        } catch (err) {
            console.error('Error creating concert:', err);
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <main className="mx-4">
            <h1 className="text-center">Plan a New Concert</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleCreateConcert} className="container">
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="artist" className="form-label">Artist</label>
                        <input
                            type="text"
                            id="artist"
                            className="form-control"
                            placeholder="Artist"
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
                            placeholder="Venue"
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
                            placeholder="Tour"
                            value={tour}
                            onChange={(e) => setTour(e.target.value)}
                            required
                        />
                    </div>
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
                        placeholder="Description"
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
                            placeholder="Address"
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
                            placeholder="Rules"
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
                            placeholder="Ticket Price"
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
                            placeholder="Number of Tickets Available"
                            value={numAvail}
                            onChange={(e) => setNumAvail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary">Create Concert</button>
            </form>

        </main>
    );
};

export default NewConcert;