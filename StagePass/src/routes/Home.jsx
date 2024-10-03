import  {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import { formatDate, formatTime } from '../utils';

export default function Home() {
    const [concerts, setAllConcerts] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        const getAllConcerts = async () => {
          try {
            let response = await fetch("http://localhost:3000/api/AllConcerts");
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            let data = await response.json();
            setAllConcerts(data);
          } catch (error) {
            setError(error.message); // Set error message
          } finally {
            setLoading(false); // Set loading to false
          }
        };
        getAllConcerts();
      }, []);

      if (loading) {
        return <p>Loading concerts...</p>; // Loading message
      }
    
      if (error) {
        return <p>Error: {error}</p>; // Error message
      }

      return (
        <main id="main" className="container mt-5">
            <h1 className="text-center mb-4">Explore Concerts Near You</h1>
            <h3 className="mb-3">All Concerts</h3>
            <div className="row">
                {concerts.map((concert) => (
                    <div key={concert._id} className="col-md-4">
                        <div className="card mb-4 shadow-sm">
                            <img
                                className="concert-img card-img-top"
                                src={`imgs/${concert.image}`}
                                alt={concert.concertName}
                            />
                            <div className="card-body">
                                <h5 className="card-title">
                                    {concert.artist} at {concert.venue}
                                </h5>
                                <p className="card-text">
                                    {concert.tour}
                                </p>
                                <p className="card-text">
                                    {formatDate(concert.date)} at {formatTime(concert.time)}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <Link to={`/ConcertDetails/${concert._id}`} className="btn btn-primary">
                                        Tickets and Info
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>

    );
    
    }