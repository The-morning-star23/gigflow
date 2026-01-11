import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Briefcase, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-blue-400" /> GigFlow
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-blue-400">Browse Gigs</Link>
          {user ? (
            <>
              <Link to="/post-gig" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition">Post a Job</Link>
              <div className="flex items-center gap-2 text-slate-300">
                <UserIcon size={18} />
                <span>{user.name}</span>
              </div>
              <button onClick={() => dispatch(logout())} className="text-red-400 hover:text-red-300">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-blue-400">Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;