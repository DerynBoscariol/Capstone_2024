import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isOrganizer, setIsOrganizer] = useState(false); // State for organizer checkbox
    const [error, setError] = useState(''); // State for error messages
    const navigate = useNavigate(); // Initialize navigate function

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password, organizer: isOrganizer }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.message); 
                navigate('/login'); // Redirect to the login page after successful registration
            } else {
                setError(data.message); // Set error message from backend
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Registration failed'); // General error message
        }
    };

    return (
        <main>
            <h1>Register for an Account</h1>
            <form onSubmit={handleRegister}>
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <div>
                    <input
                        type="checkbox"
                        id="organizer"
                        checked={isOrganizer}
                        onChange={(e) => setIsOrganizer(e.target.checked)}
                    />
                    <label htmlFor="organizer">Are you an organizer?</label>
                </div>
                <button type="submit">Register</button>
            </form>
        </main>
    );
};

export default Register;


