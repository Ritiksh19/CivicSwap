import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/90 backdrop-blur-md shadow-sm py-3'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <span className="text-white text-sm font-bold">CS</span>
          </div>
          <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-black' : 'text-white'}`}>
            CivicSwap
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              {[
                { to: '/items', label: 'Browse' },
                { to: '/map', label: 'Map' },
                { to: '/dashboard', label: 'Dashboard' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-all duration-300 hover:opacity-70 ${
                    location.pathname === link.to
                      ? scrolled ? 'text-black border-b-2 border-black' : 'text-white border-b-2 border-white'
                      : scrolled ? 'text-gray-600' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold group-hover:scale-110 transition-transform duration-300">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-all duration-300 hover:scale-105 ${
                  scrolled
                    ? 'border-black text-black hover:bg-black hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-black'
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium transition-all duration-300 hover:opacity-70 ${
                  scrolled ? 'text-gray-600' : 'text-white/80'
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  scrolled
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;