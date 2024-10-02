import { useState } from 'react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State for error messages

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.message); // Handle successful registration
                // Optionally redirect or update UI
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
            <button type="submit">Register</button>
        </form>
        </main>
    );
};

export default Register;
