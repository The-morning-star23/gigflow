import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Send } from 'lucide-react';

const PostGig = () => {
  const [formData, setFormData] = useState({ title: '', description: '', budget: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/gigs', formData);
      alert("Gig posted successfully!");
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || "Failed to post gig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Create a New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
          <input
            type="text"
            placeholder="e.g. Build a Landing Page"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            placeholder="Describe the requirements..."
            rows="4"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Budget ($)</label>
          <input
            type="number"
            placeholder="500"
            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            required
          />
        </div>
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition disabled:bg-slate-400"
        >
          {loading ? "Posting..." : <><Send size={18} /> Post Gig</>}
        </button>
      </form>
    </div>
  );
};

export default PostGig;