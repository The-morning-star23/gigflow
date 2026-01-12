import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import { CheckCircle, Users, Clock, AlertCircle, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';

const Dashboard = () => {
  const [myGigs, setMyGigs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [selectedGigBids, setSelectedGigBids] = useState([]);
  const [activeGigId, setActiveGigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  
  // We rename 'user' to 'currentUser' here to avoid confusion inside the maps
  const { user: currentUser } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/hiring/dashboard'); 
        setMyGigs(data.myGigs || []);
        setMyJobs(data.myJobs || []);
      } catch (err) {
        console.error("Error fetching dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchDashboardData();
  }, [currentUser]);

  const toggleBids = async (gigId) => {
    if (activeGigId === gigId) {
      setActiveGigId(null);
      return;
    }
    setLoadingBids(true);
    setActiveGigId(gigId);
    try {
      const { data } = await API.get(`/hiring/${gigId}`);
      setSelectedGigBids(data);
    } catch (err) {
      console.error("Error fetching bids", err);
    } finally {
      setLoadingBids(false);
    }
  };

  const handleHire = async (bidId, freelancerName) => {
    if (!window.confirm(`Confirm hiring ${freelancerName}? This will reject other bidders.`)) return;
    try {
      await API.patch(`/hiring/${bidId}/hire`);
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.error || "Hiring failed");
    }
  };

  // Strict check: current user must be the hired freelancer
  const isHiredUser = (job) => {
    if (!job.hiredFreelancerId || !currentUser) return false;
    const hiredId = job.hiredFreelancerId._id || job.hiredFreelancerId;
    const currentId = currentUser._id || currentUser.id;
    return hiredId.toString() === currentId.toString();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-slate-50">
      
      {/* --- SECTION 1: EMPLOYER VIEW --- */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-2 rounded-lg text-white"><Users size={24} /></div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage My Projects</h1>
          <p className="text-slate-500 text-sm">Review and hire talent for gigs you've posted</p>
        </div>
      </div>
      
      <div className="grid gap-6 mb-16">
        {myGigs.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <AlertCircle className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500 font-medium">You haven't posted any jobs yet.</p>
          </div>
        ) : (
          myGigs.map(gig => (
            <div key={gig._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{gig.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      gig.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white'
                    }`}>
                      {gig.status === 'open' ? 'Accepting Bids' : 'Assigned'}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">${gig.budget} budget</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleBids(gig._id)} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeGigId === gig._id ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {activeGigId === gig._id ? <><ChevronUp size={16}/> Hide Bids</> : <><ChevronDown size={16}/> View Bids</>}
                </button>
              </div>

              {activeGigId === gig._id && (
                <div className="mt-8 border-t border-slate-50 pt-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Applicant Proposals</h3>
                  {loadingBids ? <p className="animate-pulse">Loading...</p> : selectedGigBids.map(bid => (
                    <div key={bid._id} className="flex justify-between items-center p-4 rounded-xl border bg-slate-50 mb-2">
                      <div>
                        <p className="font-bold text-slate-800">{bid.freelancerId?.name}</p>
                        <p className="text-xs text-slate-500 italic">"{bid.message}"</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-700">${bid.price}</span>
                        {gig.status === 'open' ? (
                          <button onClick={() => handleHire(bid._id, bid.freelancerId?.name)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Hire</button>
                        ) : <span className="text-[10px] font-black uppercase px-2 py-1 rounded text-emerald-700 bg-emerald-100">{bid.status}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- SECTION 2: MY ASSIGNMENTS --- */}
      <div className="flex items-center gap-3 mb-8 pt-10 border-t border-slate-200">
        <div className="bg-emerald-600 p-2 rounded-lg text-white"><Briefcase size={24} /></div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Assignments</h1>
          <p className="text-slate-500 text-sm">Projects you have been officially hired to complete</p>
        </div>
      </div>

      <div className="grid gap-6">
        {myJobs.filter(isHiredUser).length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <p className="text-slate-500 font-medium">No assignments yet.</p>
          </div>
        ) : (
          myJobs.filter(isHiredUser).map(assignedJob => (
            <div key={assignedJob._id} className="bg-white border-l-4 border-l-emerald-500 rounded-2xl p-6 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{assignedJob.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-600 uppercase">
                    {/* GET NAME FROM assignedJob, NOT currentUser */}
                    {assignedJob.ownerId?.name?.charAt(0) || 'C'}
                  </div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-tighter">
                    {/* HERE IS THE FIX: explicitly assignedJob.ownerId.name */}
                    CLIENT: <span className="text-slate-700">{assignedJob.ownerId?.name || 'Loading...'}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Active Contract</span>
                <p className="text-2xl font-black text-slate-800 mt-2">${assignedJob.budget}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;