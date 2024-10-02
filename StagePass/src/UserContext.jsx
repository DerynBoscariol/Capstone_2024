import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

// Create a context for user information
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null; // Load user from localStorage
    }); // Store user information

    const handleLogout = () => {
        setUser(null); // Clear user info
        localStorage.removeItem('token'); // Remove token from localStorage
        localStorage.removeItem('user'); // Remove user info
        // Optionally redirect or do other logout tasks
    };

    return (
        <UserContext.Provider value={{ user, setUser, handleLogout }}>
            {children}
        </UserContext.Provider>
    );
};


// Define prop types for the UserProvider
UserProvider.propTypes = {
    children: PropTypes.node.isRequired, // Validate that children is a required node
};

// Custom hook to use the UserContext
export const useUser = () => {
    return useContext(UserContext);
};


