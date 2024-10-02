import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './routes/Home';
import Login from './routes/Login';
import Register from './routes/Register';
import ConcertDetails from './routes/ConcertDetails';
import { UserProvider } from './UserContext';
import './App.css';

function AppWrapper() {
    const navigate = useNavigate();

    return (
        <UserProvider navigate={navigate}>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ConcertDetails/:id" element={<ConcertDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
            <Footer />
        </UserProvider>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppWrapper />
        </BrowserRouter>
    );
}
