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
        <main className="d-flex justify-content-center vh-50">
            <div className="card p-4 shadow-sm" style={{ width: '400px' }}>
                <h1 className="text-center mb-4">Register for an Account</h1>
                <form onSubmit={handleRegister}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    <div className="mb-3 form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="organizer"
                            checked={isOrganizer}
                            onChange={(e) => setIsOrganizer(e.target.checked)}
                        />
                        <label htmlFor="organizer" className="form-check-label">Are you an organizer?</label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Register</button>
                </form>
            </div>
        </main>

    );
};

export default Register;


