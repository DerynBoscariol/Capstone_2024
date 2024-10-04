import SiteName from "./SiteName";
import { useUser } from "../UserContext"; // Import the useUser hook
import { Link } from 'react-router-dom'; 

function Header() {
    const { user, handleLogout } = useUser(); // Access user info and handleLogout from UserContext
    return (
        <header className="d-flex flex-wrap justify-content-between align-items-center py-3 px-4 mb-4 border-bottom">
            <div className="d-flex align-items-center">
                <div className="me-3">
                    <SiteName />
                </div>
            </div>
            <h3 id="tag-line" className="ms-3">Think of a tagline</h3>
            <div className="d-flex align-items-center ms-auto">
                {/*<form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search..."
                        aria-label="Search"
                    />
                </form>*/}
                {/* Conditionally render Login/Register buttons or Dropdown */}
                {user ? (
                    <div className="dropdown">
                        <button type="button" className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            {user.username}
                        </button>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" to="#">Your Tickets</Link></li>

                            {/* Show these options only if the user is an organizer */}
                            {user && user.organizer && (
                                <>
                                    <li><Link className="dropdown-item" to="/YourConcerts">Your Concerts</Link></li>
                                    <li><Link className="dropdown-item" to="/NewConcert">Plan a New Concert</Link></li>
                                </>
                            )}
                            <li><Link className="dropdown-item" to="#">Settings</Link></li>
                            <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
                        </ul>
                    </div>
                ) : (
                    <div className="d-flex">
                        <Link to="/login" className="btn btn-primary me-2">Login</Link>
                        <Link to="/register" className="btn btn-secondary">Register</Link>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
