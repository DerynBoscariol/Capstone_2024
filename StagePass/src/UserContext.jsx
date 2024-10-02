import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create a context for user information
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        try {
            // Check if storedUser is not null or undefined before parsing
            return storedUser ? JSON.parse(storedUser) : null; // Load user from localStorage
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            return null; // Fallback if parsing fails
        }
    });

    const handleLogout = () => {
        setUser(null); // Clear user info
        localStorage.removeItem('token'); // Remove token from localStorage
        localStorage.removeItem('user'); // Remove user info
        // Optionally redirect or do other logout tasks
    };

    // Effect to keep localStorage in sync with user state
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user)); // Save user info to localStorage
        } else {
            localStorage.removeItem('user'); // Remove user info from localStorage if user is null
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser, handleLogout }}>
            {children}
        </UserContext.Provider>
    );
}

// Define prop types for the UserProvider
UserProvider.propTypes = {
    children: PropTypes.node.isRequired, // Validate that children is a required node
};

// Custom hook to use the UserContext
export const useUser = () => {
    return useContext(UserContext);
};

