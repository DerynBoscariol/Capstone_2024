import { useUser } from "../UserContext";
import { Navigate } from "react-router-dom";
import PropTypes from 'prop-types';

const OrganizerRoute = ({ children }) => {
    const { user } = useUser();

    if (!user) {
        // If user is not logged in, redirect to login
        return <Navigate to="/login" />;
    }

    if (!user.organizer) {
        // If user is logged in but not an organizer, redirect to home (or some other page)
        return <Navigate to="/" />;
    }

    // If user is an organizer, allow access to the page
    return children;
};

export default OrganizerRoute;

OrganizerRoute.propTypes = {
    children: PropTypes.node.isRequired,
};