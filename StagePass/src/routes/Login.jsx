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
        <div className="d-flex justify-content-center vh-50">
    <div className="card p-4 shadow-sm mt-5" style={{ width: '400px' }}>
        <h1 className="text-center mb-4">Log in to your account</h1>
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="mb-3">
                <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="text-center mt-3">
                <p className="mb-1">Don&apos;t have an account?</p>
                <a href="/register" className="btn btn-link">Register Here</a>
            </div>
            {error && (
                <div className="alert alert-danger mt-3" role="alert">
                    {error}
                </div>
            )}
        </form>
    </div>
</div>

    );
}
