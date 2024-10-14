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
                <div className="row">
                    {tickets.map((ticket) => {
                        const concert = ticket.concert || {};
                        return (
                            <div className="col-md-4" key={ticket.reservationNumber}>
                                <div className="ticket card mb-4 shadow">
                                    <div className="ticket-body card-body">
                                        <h5 className="ticket-title card-title fw-bold">
                                            {concert.artist} at {concert.venue}
                                        </h5>
                                        <p className="card-text">
                                            <strong>Reservation Number:</strong> <span className="text-muted">{ticket.reservationNumber}</span><br />
                                            <strong>Date:</strong> <span className="text-muted">{concert.date ? formatDate(concert.date) : 'TBD'}</span><br />
                                            <strong>Time:</strong> <span className="text-muted">{concert.time ? formatTime(concert.time) : 'TBD'}</span><br />
                                            <strong>Ticket Type:</strong> <span className="text-muted">{ticket.ticketType || 'Unknown'}</span><br />
                                            <strong>Quantity:</strong> <span className="text-muted">{ticket.quantity}</span><br />
                                        </p>
                                        {concert._id && (
                                            <Link to={`/concertDetails/${concert._id}`} className="btn btn-primary">
                                                View Details
                                            </Link>
                                        )}
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

