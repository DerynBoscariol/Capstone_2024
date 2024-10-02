import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ConcertDetails() {
    const { id } = useParams(); 
    const [concert, setConcert] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [showModal, setShowModal] = useState(false); 
    const [ticketQuantity, setTicketQuantity] = useState(1); 
    const [totalPrice, setTotalPrice] = useState(0); 

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

    if (loading) return <p>Loading concert details...</p>; 
    if (error) return <p>Error: {error}</p>; 
    if (!concert) return <p>No concert found.</p>;

    const handleBuyTickets = () => {
        alert(`Purchased ${ticketQuantity} ticket(s) for ${concert.artist} at ${concert.venue} for a total of $${totalPrice}!`);
        setShowModal(false); 
        setTicketQuantity(1); 
    };

    return (
        <main id="main" className="mx-4">
            <h1>{concert.artist} at {concert.venue}</h1>
            <p>Tour: {concert.tour}</p>
            <p>Date: {concert.date}</p>
            <p>Time: {concert.time}</p>
            <p>Description: {concert.description}</p>
            <p>Address: {concert.address}</p>
            <p>Rules: {concert.rules}</p>
            <p>Organizer: {concert.organizer}</p>
            <h3>Ticket Information</h3>
            <p>Ticket type: {concert.tickets.type}</p>
            <p>Price: ${concert.tickets.price}</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Get Tickets</button>

            {/* Bootstrap Modal */}
            <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="ticketModalLabel" aria-hidden={!showModal}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="ticketModalLabel">Buy Tickets</h5>
                        </div>
                        <div className="modal-body">
                            <p>Would you like to buy tickets for {concert.artist} at {concert.venue}?</p>
                            <p>Price per ticket: ${concert.tickets.price}</p>
                            
                            {/* Ticket Quantity Selection */}
                            <div className="d-flex align-items-center">
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
                            <p className="mt-3">Total Price: ${totalPrice}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleBuyTickets}>Buy Tickets</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

