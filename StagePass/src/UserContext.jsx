import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create UserContext
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children, navigate }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        try {
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            return null; 
        }
    });

    const handleLogout = () => {
        setUser(null); // Clear user info
        localStorage.removeItem('token'); // Remove token from localStorage
        localStorage.removeItem('user'); // Remove user info
        navigate('/'); // Redirect to home after logout
    };

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user)); // Save user info to localStorage
        } else {
            localStorage.removeItem('user'); // Remove user info if null
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
    children: PropTypes.node.isRequired,
    navigate: PropTypes.func.isRequired, // Accept navigate as a prop
};

// Custom hook to use the UserContext
// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
    return useContext(UserContext);
};


