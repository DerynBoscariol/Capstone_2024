import { useEffect, useState } from 'react';
import PropTypes from 'prop-types'; 
import { formatDate, formatTime } from '../utils';
import { Link } from 'react-router-dom';
import { useUser } from '../UserContext';

export default function YourTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useUser();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                console.log('User token before fetch:', token); 
                const response = await fetch('http://localhost:3000/api/user/tickets', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Log response status and body
                console.log('Response status:', response.status);
                console.log('Response body:', await response.clone().json());

                // Handle 404 specifically
                if (response.status === 404) {
                    setTickets([]); // No tickets found
                    return; // Exit the function
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch tickets');
                }

                const data = await response.json();
                setTickets(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };        
    
        fetchTickets();
    }, [token]);

    const handleDelete = async (reservationNumber) => {
        if (window.confirm("Are you sure you want to delete this ticket reservation?")) {
            try {
                const response = await fetch(`http://localhost:3000/api/reserveTickets/${reservationNumber}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete ticket reservation');
                }

                // Update state to remove the deleted ticket
                setTickets((prevTickets) =>
                    prevTickets.filter(ticket => ticket.reservationNumber !== reservationNumber)
                );
            } catch (error) {
                setError(error.message);
            }
        }
    };

    if (loading) return <p>Loading your tickets...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Your Tickets</h1>
            <p className="text-center mb-4">
                Upon arrival at the venue, provide your reservation number to the staff at the door and pay onsite with cash or credit.
            </p>
            {tickets.length === 0 ? (
                <div className="text-center">
                    <p>You have no reserved tickets.</p>
                    <p>Check out our upcoming concerts and reserve your spot!</p>
                    <Link to="/" className="btn btn-primary">Browse Concerts</Link>
                </div>
            ) : (
                <div className="row">
                    {tickets.map((ticket) => {
                        const concert = ticket.concert || {};
                        const venue = concert.venue || {};
                        const totalPrice = concert.tickets.price * ticket.quantity;

                        return (
                            <div className="col-md-4 mb-4" key={ticket.reservationNumber}>
                                <div className="ticket card shadow">
                                    <div className="ticket-body card-body">
                                        <h5 className="ticket-title card-title fw-bold" style={{ color: '#007bff' }}>
                                            {concert.artist} at {venue.name}
                                        </h5>
                                        <ul className="list-unstyled">
                                            <li><strong>Reservation Number:</strong> <span className="text-muted">{ticket.reservationNumber}</span></li>
                                            <li><strong>Date:</strong> <span className="text-muted">{formatDate(concert.date)}</span></li>
                                            <li><strong>Time:</strong> <span className="text-muted">{formatTime(concert.time)}</span></li>
                                            <li><strong>Venue Address:</strong> <span className="text-muted">{venue.address}</span></li>
                                            <li><strong>Ticket Type:</strong> <span className="text-muted">{ticket.ticketType}</span></li>
                                            <li><strong>Price Per Ticket:</strong> <span className="text-muted">${parseFloat(concert.tickets.price).toFixed(2)}</span></li>
                                            <li><strong>Quantity:</strong> <span className="text-muted">{ticket.quantity}</span></li>
                                            <li><strong>Total Price:</strong> <span className="text-muted">${totalPrice.toFixed(2)}</span></li>
                                        </ul>
                                        <div className="d-flex justify-content-between">
                                            {concert._id && (
                                                <Link to={`/concertDetails/${concert._id}`} className="btn btn-primary">
                                                    View Details
                                                </Link>
                                            )}
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleDelete(ticket.reservationNumber)}
                                            >
                                                Cancel Reservation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Adding prop types validation for userToken
YourTickets.propTypes = {
    userToken: PropTypes.string.isRequired,
};
