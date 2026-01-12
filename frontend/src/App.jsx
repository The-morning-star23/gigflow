import { useEffect, useState } from 'react'; // Added useState
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setCredentials, logout } from './redux/authSlice';
import API from './api/axios';

import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Home from './pages/Home';
import PostGig from './pages/PostGig';
import GigDetails from './pages/GigDetails';
import Dashboard from './pages/Dashboard';
import BrowseGigs from './pages/BrowseGigs';
const socket = io('http://localhost:5000');

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await API.get('/auth/me');
        dispatch(setCredentials(data));
      } catch {
        dispatch(logout()); 
      } finally {
        setLoading(false); // Stop loading regardless of result
      }
    };
    checkUser();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const userId = user.id || user._id;
      socket.emit('register-user', userId);

      socket.on('hired-notification', (data) => {
        alert(`🎉 EXCITING NEWS: ${data.message}`);
      });
    }

    return () => {
      socket.off('hired-notification');
    };
  }, [user]);

  // Prevent UI from jumping while checking authentication
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500 font-medium">
      Loading GigFlow...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/post-gig" element={<PostGig />} />
          <Route path="/gig/:id" element={<GigDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse" element={<BrowseGigs />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;