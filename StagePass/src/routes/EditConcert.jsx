import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../UserContext'; 

const EditConcert = () => {
    const token = localStorage.getItem('token');
    const { id } = useParams();
    const [venues, setVenues] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newVenue, setNewVenue] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [concertDetails, setConcertDetails] = useState({
        artist: '',
        venueId: '',
        tour: '',
        date: '',
        time: '',
        description: '',
        genre: '',
        rules: '',
        tickets: {
            type: '',
            price: '',
            numAvail: '',
        },
    });
    const [error, setError] = useState('');
    const { user } = useUser();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchConcertDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/ConcertDetails/${id}`);
                if (!response.ok) throw new Error('Failed to fetch concert details');
                const data = await response.json();
                setConcertDetails({
                    ...data,
                    originalArtist: data.artist,
                    originalVenue: data.venueId,
                    originalTour: data.tour,
                    originalDate: data.date,
                    originalTime: data.time,
                    originalDescription: data.description,
                    originalGenre: data.genre,
                    originalRules: data.rules,
                    originalTickets: {
                        type: data.tickets.type,
                        price: data.tickets.price,
                        numAvail: data.tickets.numAvail,
                    }
                });
            } catch (error) {
                console.error('Error fetching concert details:', error);
                setError('Failed to load concert details');
            }
        };

        const fetchVenues = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/Venues');
                if (!response.ok) throw new Error('Failed to fetch venues');
                const data = await response.json();
                setVenues(data);
            } catch (error) {
                console.error('Error fetching venues:', error);
                setError('Failed to load venues');
            }
        };

        fetchConcertDetails();
        fetchVenues();
    }, [id]);

    const handleEditConcert = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError('You must be logged in to create a concert');
            return;
        }

        const changes = new FormData();
        changes.append('artist', concertDetails.artist);
        changes.append('venueId', concertDetails.venueId);
        changes.append('tour', concertDetails.tour);
        changes.append('date', concertDetails.date);
        changes.append('time', concertDetails.time);
        changes.append('description', concertDetails.description);
        changes.append('genre', concertDetails.genre);
        changes.append('rules', concertDetails.rules);
        changes.append('tickets.type', concertDetails.tickets.type);
        changes.append('tickets.price', concertDetails.tickets.price);
        changes.append('tickets.numAvail', concertDetails.tickets.numAvail);
        
        if (concertDetails.photo) {
            changes.append('photo', concertDetails.photo);
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/ConcertDetails/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
                body: changes, 
            });
            const data = await response.json();
            if (response.ok) {
                navigate(`/ConcertDetails/${id}`);
            } else {
                setError(data.message || 'Failed to update concert');
            }
        } catch (err) {
            console.error('Error updating concert:', err);
            setError('Something went wrong. Please try again.');
        }
    };

    const handleAddVenue = async () => {
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
                console.log(errorText);
                throw new Error('Failed to add venue');
            }

            const data = await response.json();
            setShowModal(false);
            setVenues((prevVenues) => [...prevVenues, data.newVenue]);
            setNewVenue('');
            setNewAddress('');
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.log(err);
        }
    };

    if (!concertDetails) return <p>Loading...</p>;

    return (
        <main className="mx-4">
            <h1 className="text-center">Edit Concert</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleEditConcert} className="container">
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="artist" className="form-label">Artist</label>
                        <input
                            type="text"
                            id="artist"
                            className="form-control"
                            value={concertDetails.artist}
                            onChange={(e) => setConcertDetails({ ...concertDetails, artist: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                    <label htmlFor="venue" className="form-label">Venue</label>
                    <select
                        id="venue"
                        className="form-select"
                        value={concertDetails.venueId} 
                        onChange={(e) => {
                            const selectedVenueId = e.target.value;
                            setConcertDetails({ 
                                ...concertDetails, 
                                venueId: selectedVenueId, // Always update venueId
                            });
                        }}
                        required
                    >
                        {venues.map((v) => (
                            <option key={v._id} value={v._id}>
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
                                       // required
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="New Venue Address"
                                        value={newAddress}
                                        onChange={(e) => setNewAddress(e.target.value)}
                                       // required
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
                            value={concertDetails.tour}
                            onChange={(e) => setConcertDetails({ ...concertDetails, tour: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="genre" className="form-label">Genre</label>
                        <input
                            type="text"
                            id="genre"
                            className="form-control"
                            value={concertDetails.genre}
                            onChange={(e) => setConcertDetails({ ...concertDetails, genre: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="date" className="form-label">Date</label>
                        <input
                            type="date"
                            id="date"
                            className="form-control"
                            value={concertDetails.date}
                            onChange={(e) => setConcertDetails({ ...concertDetails, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="time" className="form-label">Time</label>
                        <input
                            type="time"
                            id="time"
                            className="form-control"
                            value={concertDetails.time}
                            onChange={(e) => setConcertDetails({ ...concertDetails, time: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        id="description"
                        className="form-control"
                        value={concertDetails.description}
                        onChange={(e) => setConcertDetails({ ...concertDetails, description: e.target.value })}
                        required
                    />
                </div>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="rules" className="form-label">Rules</label>
                        <textarea
                            id="rules"
                            className="form-control"
                            value={concertDetails.rules}
                            onChange={(e) => setConcertDetails({ ...concertDetails, rules: e.target.value })}
                            required
                        />
                    </div>
                    
                    <div className="col-md-6">
                        <label htmlFor="photo" className="form-label">Change promo image</label>
                        <input
                            type="file"
                            accept='.png, .jpg, .jpeg'
                            id="photo"
                            className="form-control"
                            onChange={(e) => setConcertDetails({ ...concertDetails, photo: e.target.files[0]})} 
                            //required
                        />
                    </div> 
                </div>
                <div className="row mb-3">
                <div className="col-md-4">
                    <label htmlFor="ticketType" className="form-label">Ticket Type</label>
                    <select
                        id="ticketType"
                        className="form-select"
                        value={concertDetails.tickets.type}
                        onChange={(e) => setConcertDetails({
                            ...concertDetails,
                            tickets: { ...concertDetails.tickets, type: e.target.value }
                        })}
                        required
                    >
                        <option value="">Select Ticket Type</option>
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
                        value={concertDetails.tickets.price}
                        onChange={(e) => setConcertDetails({
                            ...concertDetails,
                            tickets: { ...concertDetails.tickets, price: e.target.value }
                        })}
                        required
                    />
                </div>

                <div className="col-md-4">
                    <label htmlFor="numAvail" className="form-label">Number of Tickets Available</label>
                    <input
                        type="number"
                        id="numAvail"
                        className="form-control"
                        value={concertDetails.tickets.numAvail}
                        onChange={(e) => setConcertDetails({
                            ...concertDetails,
                            tickets: { ...concertDetails.tickets, numAvail: e.target.value }
                        })}
                        required
                    />
                </div>
            </div>
            <div className="d-flex justify-content-between">
                <button type="submit" className="btn btn-primary">Update Concert</button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/YourConcerts')}>Cancel</button>
            </div>
        </form>
        </main>
    );
};

export default EditConcert;
