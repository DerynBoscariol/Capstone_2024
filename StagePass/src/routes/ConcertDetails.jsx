import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types'; 
import { formatDate, formatTime } from '../utils';

export default function ConcertDetails({ userToken }) {
    const { id } = useParams();
    const [concert, setConcert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [reservationMessage, setReservationMessage] = useState('');

    useEffect(() => {
        const fetchConcert = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/ConcertDetails/${id}`);
                if (!response.ok) {
                    throw new Error("Concert not found");
                }
                const data = await response.json();
                setConcert(data);
                setTotalPrice(data.tickets.price); // Set the initial total price based on ticket price
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
            // Update the total price whenever the ticket quantity changes
            setTotalPrice(ticketQuantity * concert.tickets.price);
        }
    }, [ticketQuantity, concert]);

    const reserveTickets = async () => {
        if (!userToken) {
            setReservationMessage('You must be logged in to reserve tickets.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/reserveTickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, // Use the userToken
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
        // setShowModal(false); // Comment this out
        setTicketQuantity(1); // Reset the ticket quantity after the reservation attempt
    };

    const handleBuyTickets = () => {
        reserveTickets(); // Call the reserveTickets function to process the reservation
    };

    if (loading) return <p>Loading concert details...</p>;

    // Display the error message if any occurs during the fetch request
    if (error) return <p>Error: {error}</p>;

    if (!concert) return <p>No concert found.</p>;

    return (
        <main id="main" className="container mt-4">
            <h1 className="text-center mb-4">{concert.artist} at {concert.venue}</h1>
                <img 
                    src={concert.photoPath.replace(/ /g, '%20')} 
                    alt={`${concert.artist} promo image`} 
                    className="img-fluid mb-4" 
                />
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Concert Details</h5>
                    <p className="card-text"><strong>Tour:</strong> {concert.tour}</p>
                    <p className="card-text"><strong>Genre:</strong> {concert.genre}</p>
                    <p className="card-text"><strong>Date:</strong> {formatDate(concert.date)}</p>
                    <p className="card-text"><strong>Time:</strong> {formatTime(concert.time)}</p>
                    <p className="card-text"><strong>Description:</strong> {concert.description}</p>
                    <p className="card-text"><strong>Address:</strong> {concert.address}</p>
                    <p className="card-text"><strong>Rules:</strong> {concert.rules}</p>
                    <p className="card-text"><strong>Organizer:</strong> {concert.organizer}</p>
                </div>
            </div>

            <h3 className="text-center mb-4">Ticket Information</h3>
            <div className="card mb-4">
                <div className="card-body">
                    <p className="card-text"><strong>Ticket Type:</strong> {concert.tickets.type}</p>
                    <p className="card-text"><strong>Price:</strong> ${concert.tickets.price/*.toFixed(2)*/}</p>
                    <div className="text-center">
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Get Tickets</button>
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
                            <h5 className="modal-title" id="ticketModalLabel">Buy Tickets</h5>
                        </div>
                        <div className="modal-body">
                            <p>Would you like to buy tickets for {concert.artist} at {concert.venue}?</p>
                            <p><strong>Price per ticket:</strong> ${concert.tickets.price/*.toFixed(2)*/}</p>
                            
                            {/* Ticket Quantity Selection */}
                            <div className="d-flex justify-content-center align-items-center">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}>
                                    -
                                </button>
                                <span className="mx-3">{ticketQuantity}</span> {/* Display current quantity */}
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setTicketQuantity(prev => prev + 1)}>
                                    +
                                </button>
                            </div>
                            
                            {/* Total Price Display */}
                            <p className="mt-3"><strong>Total Price:</strong> ${totalPrice/*.toFixed(2)*/}</p>
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

// Adding prop types validation for userToken
ConcertDetails.propTypes = {
    userToken: PropTypes.string.isRequired,
};
