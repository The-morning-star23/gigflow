import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Added to check current user
import API from '../api/axios';
import { ArrowRight, Star, CheckCircle, Briefcase } from 'lucide-react'; 
import socket from '../socket'; 

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Access the logged-in user from Redux
  const { user } = useSelector((state) => state.auth);

  const fetchGigs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/gigs?limit=4`);
      setGigs(data);
    } catch (err) {
      console.error("Error fetching gigs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleNewGig = (newGig) => {
      setGigs((prevGigs) => {
        const updatedGigs = [newGig, ...prevGigs];
        return updatedGigs.slice(0, 4);
      });
    };

    const handleStatusUpdate = ({ gigId, status }) => {
      setGigs((prevGigs) => 
        prevGigs.map(g => g._id === gigId ? { ...g, status: status } : g)
      );
    };

    socket.on('new-gig-added', handleNewGig);
    socket.on('gig-status-updated', handleStatusUpdate);

    return () => {
      socket.off('new-gig-added');
      socket.off('gig-status-updated');
    };
  }, []);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  return (
    <div className="pb-20 bg-slate-50 min-h-screen">
      {/* --- HERO SECTION --- */}
      <div className="w-full bg-slate-900 text-white pt-16 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full text-blue-400 text-sm mb-6">
            <Star size={14} fill="currentColor" />
            <span>Premium Freelance Marketplace</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Find the Best <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Gig Talent</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Post projects in seconds and connect with freelancers instantly.
          </p>
          <Link 
            to="/browse" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg transform hover:-translate-y-1"
          >
            Start Browsing <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* --- FEATURED GIGS SECTION --- */}
      <div id="gigs-feed" className="px-4 max-w-6xl mx-auto py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Featured Opportunities</h2>
          <p className="text-slate-500 font-medium mt-1">Hand-picked latest projects for you</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {gigs.map((gig) => {
                // LOGIC: Check if current user is the job owner
                const isOwner = gig.ownerId?._id === (user?._id || user?.id);

                return (
                  <div key={gig._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        gig.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {gig.status === 'open' ? 'Active' : 'Assigned'}
                      </span>
                      <span className="text-emerald-600 font-bold text-lg">${gig.budget}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{gig.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{gig.description}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                          {gig.ownerId?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{gig.ownerId?.name || 'User'}</span>
                      </div>

                      {/* BUTTON LOGIC MATCHED WITH BROWSE */}
                      {gig.status !== 'open' ? (
                        <button 
                          disabled 
                          className="bg-slate-100 text-slate-400 px-4 py-2 rounded-lg font-bold text-sm cursor-not-allowed flex items-center gap-1"
                        >
                          Closed <CheckCircle size={14} />
                        </button>
                      ) : isOwner ? (
                        <Link 
                          to="/dashboard" 
                          className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-900 transition-all flex items-center gap-1 shadow-md"
                        >
                          Manage <Briefcase size={14} />
                        </Link>
                      ) : (
                        <Link 
                          to={`/gig/${gig._id}`} 
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-1 shadow-md"
                        >
                          Place Bid <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link 
                to="/browse" 
                className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                View More Gigs <ArrowRight size={20} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;