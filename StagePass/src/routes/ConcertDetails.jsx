import { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import PropTypes from 'prop-types'; 
import { formatDate, formatTime } from '../utils';
import { useUser } from '../UserContext';

export default function ConcertDetails() {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const [concert, setConcert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [reservationMessage, setReservationMessage] = useState('');
    const { token } = useUser();

    useEffect(() => {
        const fetchConcert = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/ConcertDetails/${id}`);
                if (!response.ok) {
                    throw new Error("Concert not found or unauthorized");
                }
                const data = await response.json();
                setConcert(data);
                setTotalPrice(parseFloat(data.tickets.price)); 
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchConcert();
    }, [id]);

    useEffect(() => {
        if (concert) {
            setTotalPrice(ticketQuantity * parseFloat(concert.tickets.price));
        }
    }, [ticketQuantity, concert]);

    const reserveTickets = async () => {
        if (!token) {
            setReservationMessage('You must be logged in to reserve tickets.');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/reserveTickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    concertId: concert._id,
                    numTickets: ticketQuantity,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setReservationMessage(`Successfully reserved ${ticketQuantity} ticket(s)!`);
            } else {
                setReservationMessage(result.message || 'Failed to reserve tickets.');
            }
        } catch (error) {
            setReservationMessage('An error occurred while reserving tickets: ' + error.message);
        }
        // Don't close the modal immediately to allow user to see the message
        setShowModal(false);
        setTicketQuantity(1); // Reset the ticket quantity after the reservation attempt
    };

    const handleBuyTickets = () => {
        if (!token) {
            setReservationMessage('You must be logged in to reserve tickets.');
            return;
        }
        reserveTickets();
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    if (loading) return <p>Loading concert details...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!concert) return <p>No concert found.</p>;

    console.log('User Token:', token); 
    console.log('Is token valid?', !!token); 

    return (
        <main id="main" className="container mt-4">
            <h1 className="text-center mb-4">{concert.artist} at {concert.venue.name}</h1>
    
            <div className="d-flex flex-column flex-md-row mb-4 gap-5">
                <img 
                    src={concert.photoPath.replace(/ /g, '%20')} 
                    alt={`${concert.artist} promo image`} 
                    className="details-img me-md-4 mb-3 mb-md-0"
                />
                <div className="card flex-fill">
                    <div className="card-body">
                        <h5 className="card-title">Concert Details</h5>
                        <p className="card-text"><strong>Tour:</strong> {concert.tour}</p>
                        <p className="card-text"><strong>Genre:</strong> {concert.genre}</p>
                        <p className="card-text"><strong>Date:</strong> {formatDate(concert.date)}</p>
                        <p className="card-text"><strong>Time:</strong> {formatTime(concert.time)}</p>
                        <p className="card-text"><strong>Description:</strong> {concert.description}</p>
                        <p className="card-text"><strong>Address:</strong> {concert.venue.address}</p>
                        <p className="card-text"><strong>Rules:</strong> {concert.rules}</p>
                    </div>
                </div>
            </div>
    
            <h3 className="text-center mb-4">Ticket Information</h3>
            <div className="card mb-4">
                <div className="card-body">
                    <p className="card-text"><strong>Ticket Type:</strong> {concert.tickets.type}</p>
                    <p className="card-text"><strong>Price:</strong> ${parseFloat(concert.tickets.price).toFixed(2)}</p>
                    <p className="card-text"> Reserve your tickets online and pay at the door before the show.</p>
                    <div className="text-center">
                        {token ? (
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setShowModal(true)} 
                            >
                                Reserve Tickets
                            </button>
                        ) : (
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleLoginRedirect}
                            >
                                Login to Reserve Tickets
                            </button>
                        )}
                    </div>
                </div>
            </div>
    
            {reservationMessage && (
                <div className="alert alert-info text-center">
                    {reservationMessage}
                </div>
            )}
    
            {/* Purchase Modal */}
            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="ticketModalLabel" aria-hidden={!showModal}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="ticketModalLabel">Reserve Tickets</h5>
                        </div>
                        <div className="modal-body">
                            <p>Would you like to reserve tickets for {concert.artist} at {concert.venue.name}?</p>
                            <p><strong>Price per ticket:</strong> ${parseFloat(concert.tickets.price).toFixed(2)}</p>
                            
                            {/* Ticket Quantity Selection */}
                            <div className="d-flex justify-content-center align-items-center">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}>
                                    -
                                </button>
                                <span className="mx-3">{ticketQuantity}</span>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setTicketQuantity(prev => prev + 1)}>
                                    +
                                </button>
                            </div>
                            
                            {/* Total Price Display */}
                            <p className="mt-3"><strong>Total Price:</strong> ${parseFloat(totalPrice).toFixed(2)}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleBuyTickets}>Reserve Tickets</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

// Adding prop types for better documentation and validation
ConcertDetails.propTypes = {
    token: PropTypes.string, 
};
