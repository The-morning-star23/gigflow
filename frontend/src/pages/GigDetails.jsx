import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';

const GigDetails = () => {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);
  const [gig, setGig] = useState(null);
  const [bidData, setBidData] = useState({ message: '', price: '' });

  useEffect(() => {
    const fetchGigDetails = async () => {
      const { data } = await API.get(`/gigs`); // Usually you'd have a specific GET /gigs/:id
      const foundGig = data.find(g => g._id === id);
      setGig(foundGig);
    };
    fetchGigDetails();
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    try {
      await API.post('/gigs/bid', { gigId: id, ...bidData });
      alert("Bid submitted successfully!");
    } catch {
      alert("Error submitting bid.");
    }
  };

  if (!gig) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-8">
      <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-3xl font-bold mb-4">{gig.title}</h1>
        <p className="text-slate-600 mb-6 whitespace-pre-wrap">{gig.description}</p>
        <div className="text-2xl font-bold text-green-600">Budget: ${gig.budget}</div>
      </div>

      <div className="w-full md:w-80">
        {user ? (
          <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold mb-4">Place a Bid</h3>
            <form onSubmit={handleBid} className="space-y-4">
              <input 
                type="number" placeholder="Your Price" 
                className="w-full p-2 border rounded" 
                onChange={(e) => setBidData({...bidData, price: e.target.value})}
                required
              />
              <textarea 
                placeholder="Pitch yourself..." 
                className="w-full p-2 border rounded"
                onChange={(e) => setBidData({...bidData, message: e.target.value})}
                required
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
                Submit Bid
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-700">
            Please <Link to="/login" className="underline font-bold">login</Link> to place a bid.
          </div>
        )}
      </div>
    </div>
  );
};

export default GigDetails;