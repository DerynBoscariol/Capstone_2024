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
    
            localStorage.setItem('token', data.token); // Save token to local storage
            localStorage.setItem('user', JSON.stringify({ username: data.username, organizer: data.organizer })); // Save user info correctly
            setUser({ username: data.username, organizer: data.organizer }); // Set user in context
            navigate('/'); 
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
