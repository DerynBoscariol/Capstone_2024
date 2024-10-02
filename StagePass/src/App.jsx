import Header from './components/Header'
import Footer from './components/Footer'
import Home from './routes/Home'
import Login from './routes/Login'
import Register from './routes/Register'
import ConcertDetails from './routes/ConcertDetails'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <div className="page">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/ConcertDetails/:id" element={<ConcertDetails />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          {/*<Route path="yourTickets" element={<YourTickets />} />
          <Route path="settings" element={<Settings/>}/>
          <Route path="newConcert" element={<NewConcert/>}/>
          <Route path="yourConcerts" element={<YourConcerts />} /> */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
