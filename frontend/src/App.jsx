import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from './redux/authSlice';
import API from './api/axios';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import PostGig from './pages/PostGig';
import Home from './pages/Home';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await API.get('/auth/me');
        dispatch(setCredentials(data));
      } catch {
        console.log("No active session");
      }
    };
    checkUser();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<div className="p-8">Marketplace Feed</div>} />
          <Route path="/login" element={<Auth />} />
          <Route path="/post-gig" element={<PostGig />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;