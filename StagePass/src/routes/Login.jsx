import { useState } from 'react';
import { useUser } from '../UserContext'; 
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { setUser } = useUser(); 
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
        
            const data = await response.json(); 
            console.log('Login response:', data); 
        
            if (!response.ok) {
                throw new Error(data.message || 'Invalid email or password');
            }
        
            // Set the user state with token included
            const userData = { 
                id: data.id, 
                username: data.username, 
                organizer: data.organizer, 
                token: data.token // Include the token here
            };
            localStorage.setItem('token', data.token); // Save token to localStorage
            localStorage.setItem('user', JSON.stringify(userData)); // Save user info to localStorage
            setUser(userData); // Update the user state with token
            navigate('/'); // Redirect after successful login
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {error && <p>{error}</p>}
            </form>
        </div>
    );
}
