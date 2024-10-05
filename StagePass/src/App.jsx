import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './routes/Home';
import ConcertsByVenue from './routes/ConcertsByVenue';
import Login from './routes/Login';
import Register from './routes/Register';
import Settings from './routes/Settings';
import YourTickets from './routes/YourTickets';
import NewConcert from './routes/NewConcert';
import YourConcerts from './routes/YourConcerts';
import EditConcert from './routes/EditConcert';
import OrganizerRoute from './components/OrganizerRoute';
import ConcertDetails from './routes/ConcertDetails';
import {UserProvider, useUser} from './UserContext';
import './App.css';

function AppWrapper() {
    const navigate = useNavigate();
    const { user } = useUser(); 

    return (
      <UserProvider navigate={navigate}>
          <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                  <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/ConcertsByVenue/:venue" element={<ConcertsByVenue/>} />
                      <Route path="/ConcertDetails/:id" element={<ConcertDetails userToken={user?.token}/>} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/settings" element={<Settings/>} />
                      <Route path="/yourTickets" element={<YourTickets userToken={user?.token} />} />
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