import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './routes/Home';
import Login from './routes/Login';
import Register from './routes/Register';
import NewConcert from './routes/NewConcert';
import YourConcerts from './routes/YourConcerts';
import EditConcert from './routes/EditConcert';
import OrganizerRoute from './components/OrganizerRoute';
import ConcertDetails from './routes/ConcertDetails';
import {UserProvider} from './UserContext';
import './App.css';

function AppWrapper() {
    const navigate = useNavigate();

    return (
      <UserProvider navigate={navigate}>
          <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                  <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/ConcertDetails/:id" element={<ConcertDetails />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/NewConcert" element={<OrganizerRoute><NewConcert /></OrganizerRoute>} />
                      <Route path="/yourConcerts" element={<OrganizerRoute><YourConcerts /></OrganizerRoute>} />
                      <Route path="/EditConcert/:id" element={<OrganizerRoute><EditConcert/></OrganizerRoute>} />
                  </Routes>
              </main>
              <Footer />
          </div>
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
