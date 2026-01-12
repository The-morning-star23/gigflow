import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Added to check current user
import API from '../api/axios';
import { Search, ArrowRight, CheckCircle, Briefcase } from 'lucide-react';
import socket from '../socket';

const BrowseGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [loading, setLoading] = useState(true);
  
  // Access the logged-in user from Redux
  const { user } = useSelector((state) => state.auth);

  const fetchGigs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/gigs?search=${search}&status=${statusFilter}`);
      setGigs(data);
    } catch (err) {
      console.error("Error fetching gigs", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGigs();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchGigs]);

  useEffect(() => {
    socket.on('new-gig-added', (newGig) => {
      setGigs((prev) => [newGig, ...prev]);
    });

    socket.on('gig-status-updated', ({ gigId, status }) => {
      setGigs((prev) => prev.map(g => g._id === gigId ? { ...g, status } : g));
    });

    return () => {
      socket.off('new-gig-added');
      socket.off('gig-status-updated');
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER --- */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Browse Opportunities</h1>
          <p className="text-slate-500 font-medium mt-2">Find the perfect project to showcase your skills</p>
        </div>

        {/* --- SEARCH & FILTER --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by project title..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'all' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All Gigs
              </button>
              <button 
                onClick={() => setStatusFilter('open')}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'open' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Active Only
              </button>
            </div>
          </div>
        </div>

        {/* --- GIG GRID --- */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gigs.map((gig) => {
              // LOGIC: Check if current user is the job owner
              const isOwner = gig.ownerId?._id === (user?._id || user?.id);

              return (
                <div key={gig._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        gig.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {gig.status === 'open' ? 'Active' : 'Assigned'}
                      </span>
                      <span className="font-bold text-emerald-600 text-lg">${gig.budget}</span>
                    </div>
                    
                    <h3 className="font-bold text-xl text-slate-800 mb-2 group-hover:text-blue-600 transition-colors truncate">{gig.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">{gig.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-5 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-slate-200">
                        {gig.ownerId?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">{gig.ownerId?.name || 'User'}</span>
                    </div>

                    {/* BUTTON LOGIC START */}
                    {gig.status !== 'open' ? (
                      <button disabled className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl font-bold text-sm cursor-not-allowed flex items-center gap-1">
                        Closed <CheckCircle size={14} />
                      </button>
                    ) : isOwner ? (
                      <Link 
                        to="/dashboard" 
                        className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md flex items-center gap-1"
                      >
                        Manage <Briefcase size={14} />
                      </Link>
                    ) : (
                      <Link 
                        to={`/gig/${gig._id}`} 
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-1 shadow-md"
                      >
                        Place Bid <ArrowRight size={14} />
                      </Link>
                    )}
                    {/* BUTTON LOGIC END */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseGigs;