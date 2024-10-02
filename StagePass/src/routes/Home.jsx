import  {useState, useEffect} from "react";
import {Link} from "react-router-dom";

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


    return(
    <main id="main" className="mx-4">
    <h1 className="text-center">Explore Concerts Near You</h1>
    <h3>All concerts</h3>
    <ul className="d-flex flex-wrap">
    {
          concerts.map((concert) => (
            <div key={concert._id}>
              <li className="concert-item card m-2">
                <div className="concert-info card-body">
                    <h4 className="card-title">{concert.artist} at {concert.venue}</h4>
                  <img className="concert-img card-img-top" src={`imgs/${concert.image}`} alt={concert.concertName} />
                  <div className="info-text">
                    <p>{concert.tour}</p>
                    <p>{concert.date} at {concert.time}</p>
                  </div>
                </div>
                <div className="card-footer">
                    <Link to={`/ConcertDetails/${concert._id}`}>
                        <p>Tickets and info</p>
                    </Link></div>
              </li>
            </div>
          ))
          }

    </ul>

    </main>
    );
    }