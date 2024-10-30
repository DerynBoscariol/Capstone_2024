import SiteName from "./SiteName";
import { useUser } from "../UserContext"; // Import the useUser hook
import { Link } from 'react-router-dom'; 
import '../../public/css/styles.css';

function Header() {
    const { user, handleLogout } = useUser(); // Access user info and handleLogout from UserContext
    return (
        <header className="header-container d-flex flex-wrap justify-content-between align-items-center py-4 px-5 mb-4 border-bottom">
            <div className="d-flex align-items-baseline">
                <div className="me-3">
                    <SiteName />
                </div>
                <h3 id="tag-line" className="ms-3">Your Gateway to Intimate Music Memories</h3>
            </div>
            <div className="d-flex align-items-center ms-auto">
                {user ? (
                    <div className="dropdown">
                        <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            {user.username}
                        </button>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="/YourTickets">Your Tickets</Link></li>
                            {user.organizer && (
                                <>
                                    <li><Link className="dropdown-item" to="/YourConcerts">Your Concerts</Link></li>
                                    <li><Link className="dropdown-item" to="/NewConcert">Plan a New Concert</Link></li>
                                </>
                            )}
                            <li><Link className="dropdown-item" to="/Settings">Settings</Link></li>
                            <li><a className="dropdown-item" href="#" onClick={handleLogout}>Log out</a></li>
                        </ul>
                    </div>
                ) : (
                    <div className="d-flex">
                        <Link to="/login" className="btn btn-primary me-2">Log in</Link>
                        <Link to="/register" className="btn btn-secondary">Register</Link>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
