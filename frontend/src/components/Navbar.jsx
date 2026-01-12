import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Briefcase, LogOut, User as UserIcon, LayoutDashboard, PlusCircle } from 'lucide-react';
import API from '../api/axios';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
    // 1. Tell the server to kill the cookie
    await API.post('/auth/logout'); 
    
    // 2. Clear the Redux state
    dispatch(logout()); 
    
    // 3. Redirect to the Home Page (The professional choice)
    navigate('/'); 
  } catch (err) {
    console.error("Logout failed", err);
  }
  };

  return (
    <nav className="bg-slate-950 text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <Briefcase size={24} className="text-white" />
          </div>
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            GigFlow
          </span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex gap-8 items-center">
          <Link to="/browse" className="text-slate-300 hover:text-white transition-colors font-medium">
            Browse Gigs
          </Link>

          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-medium"
              >
                <LayoutDashboard size={18} />
                My Dashboard
              </Link>

              <Link 
                to="/post-gig" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-md flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Post a Job
              </Link>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
                <div className="flex items-center gap-2 group">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 group-hover:border-blue-400 transition-colors">
                    <UserIcon size={16} className="text-slate-300 group-hover:text-blue-400" />
                  </div>
                  <span className="hidden md:inline font-semibold text-slate-200">{user.name}</span>
                </div>

                <button 
                  onClick={handleLogout} 
                  className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  title="Logout"
                >
                  <LogOut size={22} />
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-full font-bold transition-all border border-slate-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;