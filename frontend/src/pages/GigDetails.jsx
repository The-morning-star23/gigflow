import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link import
import { useSelector } from 'react-redux';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'; // Added icons for better UI
import API from '../api/axios';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [gig, setGig] = useState(null);
  const [bidData, setBidData] = useState({ message: '', price: '' });

  useEffect(() => {
    const fetchGigDetails = async () => {
      try {
        // Fetching all and finding by ID (Note: GET /gigs/:id is better if your backend supports it)
        const { data } = await API.get(`/gigs?all=true`); 
        const foundGig = data.find(g => g._id === id);
        setGig(foundGig);
      } catch (err) {
        console.error("Error fetching gig details", err);
      }
    };
    fetchGigDetails();
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    
    // Safety check: Prevent submission if gig is not open
    if (gig.status !== 'open') {
      alert("This gig is no longer accepting bids.");
      return;
    }

    try {
      await API.post('/bids', { gigId: id, ...bidData });
      alert("Bid submitted successfully!");
      navigate('/browse'); // Redirect to Browse page
    } catch (err) {
      alert(err.response?.data?.error || "Error submitting bid");
    }
  };

  if (!gig) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Gig Content */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{gig.title}</h1>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
              gig.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {gig.status === 'open' ? 'Active' : 'Assigned'}
            </span>
          </div>

          <p className="text-slate-600 mb-8 whitespace-pre-wrap leading-relaxed text-lg">
            {gig.description}
          </p>
          
          <div className="pt-6 border-t border-slate-50">
            <div className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Project Budget</div>
            <div className="text-3xl font-black text-emerald-600">${gig.budget}</div>
          </div>
        </div>

        {/* Right Side: Bidding Sidebar */}
        <div className="w-full md:w-96">
          {gig.status === 'open' ? (
            user ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Place a Bid</h3>
                <form onSubmit={handleBid} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Proposal Price ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      onChange={(e) => setBidData({...bidData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Pitch</label>
                    <textarea 
                      placeholder="Describe why you're the best fit..." 
                      rows="4"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      onChange={(e) => setBidData({...bidData, message: e.target.value})}
                      required
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98]">
                    Submit Proposal
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center text-center">
                <AlertCircle className="text-blue-500 mb-3" size={32} />
                <p className="text-blue-800 font-medium mb-4">You need to be logged in to bid on this gig.</p>
                <Link to="/login" className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold">Login Now</Link>
              </div>
            )
          ) : (
            /* CLOSED STATUS UI */
            <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200 text-center sticky top-24">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hiring Closed</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                This project has been successfully assigned to a freelancer and is no longer accepting new bids.
              </p>
              <Link to="/browse" className="block mt-6 text-blue-600 font-bold text-sm hover:underline">
                Browse other gigs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GigDetails;