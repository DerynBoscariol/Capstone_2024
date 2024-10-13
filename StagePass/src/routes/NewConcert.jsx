import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext'; // Import the useUser hook to get the current user

const NewConcert = () => {
    const [artist, setArtist] = useState('');
    const [venue, setVenue] = useState('');
    const [venues, setVenues] = useState([]); // State for existing venues
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [newVenue, setNewVenue] = useState(''); // State for the new venue input
    const [newAddress, setNewAddress] = useState(''); // State for the new venue address
    const [tour, setTour] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [rules, setRules] = useState('');
    const [photo, setImage] = useState('');
    const [ticketType, setTicketType] = useState('');
    const [ticketPrice, setTicketPrice] = useState('');
    const [numAvail, setNumAvail] = useState('');
    const [error, setError] = useState('');

    const { user } = useUser(); // Access the user from UserContext
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/Venues');
                if (!response.ok) throw new Error('Failed to fetch venues');
                const data = await response.json();
                setVenues(data); // Set existing venues
            } catch (error) {
                console.error('Error fetching venues:', error);
                setError('Failed to load venues');
            }
        };

        fetchVenues();
    }, []);

    const handleCreateConcert = async (e) => {
        e.preventDefault();
    
        // Ensure the user is logged in before submitting
            if (!user) {
                setError('You must be logged in to create a concert');
                return;
            }
        
            // Simple form validation
            if (!artist || !venue || !tour || !date || !time || !description || !genre || !rules || !ticketType || !ticketPrice || !numAvail || !photo) {
                setError('Please fill out all fields');
                return;
            }
        
            if (parseInt(numAvail) <= 0) {
                setError('Number of Tickets Available must be greater than zero.');
                return;
            }
    
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }
    
        // Create FormData to handle file upload
        const formData = new FormData();
        formData.append('artist', artist);
        formData.append('venue', venue);
        formData.append('tour', tour);
        formData.append('date', date);
        formData.append('time', time);
        formData.append('description', description);
        formData.append('genre', genre);
        formData.append('address', newAddress); // Include the new address here
        formData.append('rules', rules);
        formData.append('photo', photo); // Append the file
        formData.append('tickets[type]', ticketType);
        formData.append('tickets[price]', parseFloat(ticketPrice));
        formData.append('tickets[numAvail]', parseInt(numAvail));
        
        try {
            const response = await fetch('http://localhost:3000/api/NewConcert', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData, // Send the FormData directly
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
    

    const handleAddVenue = async () => {
        console.log('New Venue:', newVenue);
        console.log('Venue Address:', newAddress);

        // Check if the new venue name is not empty
        if (!newVenue || !newAddress) {
            setError('Please provide a venue name and address.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No token found. Please log in.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/AddVenue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newVenue,
                    address: newAddress,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                throw new Error('Failed to add venue');
            }

            const data = await response.json();
            setShowModal(false); // Close modal if successful
            setVenues((prevVenues) => [...prevVenues, data.newVenue]); // Update venues list
            setNewVenue(''); // Reset the new venue state
            setNewAddress(''); // Reset the new address state
        } catch (err) {
            console.error('Error adding venue:', err);
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
                        <select
                            id="venue"
                            className="form-select"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            required
                        >
                            <option value="">Select Venue</option>
                            {venues.map((v) => (
                                <option key={v._id} value={v.name}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                        <button type="button" className="btn btn-link" onClick={() => setShowModal(true)}>
                            + Add New Venue
                        </button>
                    </div>
                </div>

                {/* Modal for adding new venue */}
                {showModal && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Add New Venue</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="New Venue Name"
                                        value={newVenue}
                                        onChange={(e) => setNewVenue(e.target.value)} 
                                        required
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="New Venue Address"
                                        value={newAddress}
                                        onChange={(e) => setNewAddress(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                    <button type="button" className="btn btn-primary" onClick={handleAddVenue}>Add Venue</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                    <div className="col-md-6">
                        <label htmlFor="genre" className="form-label">Genre</label>
                        <input
                            type="text"
                            id="genre"
                            className="form-control"
                            placeholder="Genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            required
                        />
                    </div>
                </div>
                
                <div className="row mb-3">
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
                    <div className="col-md-6">
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
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="rules" className="form-label">Rules</label>
                        <input
                            type="text"
                            id="rules"
                            className="form-control"
                            placeholder="Rules"
                            value={rules}
                            onChange={(e) => setRules(e.target.value)}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="photo" className="form-label">Upload a promo image</label>
                        <input
                            type="file"
                            accept='.png, .jpg, .jpeg'
                            id="photo"
                            className="form-control"
                            onChange={(e) => setImage(e.target.files[0])} // Correct way to handle file input
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
