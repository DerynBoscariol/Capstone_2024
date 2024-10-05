import { useEffect, useState } from 'react';
import PropTypes from 'prop-types'; 
import { formatDate, formatTime } from '../utils';
import { Link } from 'react-router-dom';

export default function YourTickets({ userToken }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/user/tickets', {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });
    
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
    }, [userToken]);
    

    if (loading) return <p>Loading your tickets...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Your Tickets</h1>
            {tickets.length === 0 ? (
                <p className="text-center">You have no reserved tickets.</p>
            ) : (
                <div className="row ">
                    {tickets.map((ticket) => (
                        <div className="col-md-4" key={ticket.reservationNumber}>
                            <div className="card mb-4 shadow" style={{ border: "2px dashed #f39c12" }}>
                                <div className="card-body" style={{ backgroundColor: "#fefae0" }}>
                                    <h5 className="card-title fw-bold text-danger">{ticket.concert.artist} at {ticket.concert.venue}</h5>
                                    <p className="card-text">
                                        <strong>Reservation Number:</strong> <span className="text-muted">{ticket.reservationNumber}</span><br />
                                        <strong>Date:</strong> <span className="text-muted">{formatDate(ticket.concert.date)}</span><br />
                                        <strong>Time:</strong> <span className="text-muted">{formatTime(ticket.concert.time)}</span><br />
                                        <strong>Ticket Type:</strong> <span className="text-muted">{ticket.ticketType}</span><br />
                                        <strong>Quantity:</strong> <span className="text-muted">{ticket.quantity}</span><br />
                                    </p>
                                    <Link to={`/concertDetails/${ticket.concert._id}`} className="btn btn-primary">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
}

// Adding prop types validation for userToken
YourTickets.propTypes = {
    userToken: PropTypes.string.isRequired,
};
