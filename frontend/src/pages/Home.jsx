import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Search, DollarSign, Briefcase } from 'lucide-react';

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const { data } = await API.get(`/gigs?search=${search}`);
        setGigs(data);
      } catch (err) {
        console.error("Error fetching gigs", err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchGigs();
    }, 500); // Wait 500ms after typing before searching

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Available Gigs</h1>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full pl-10 pr-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-500">Loading gigs...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div key={gig._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-3 text-blue-600 font-semibold text-sm uppercase">
                <Briefcase size={14} /> Open Job
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{gig.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">{gig.description}</p>
              
              <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center text-green-600 font-bold text-lg">
                  <DollarSign size={18} /> {gig.budget}
                </div>
                <Link 
                  to={`/gig/${gig._id}`}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
          {gigs.length === 0 && <p className="col-span-full text-center text-slate-500 py-10">No gigs found.</p>}
        </div>
      )}
    </div>
  );
};

export default Home;