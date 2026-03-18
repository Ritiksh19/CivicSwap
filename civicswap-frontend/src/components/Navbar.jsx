import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="w-full bg-green-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-bold tracking-wide">
        🔄 CivicSwap
      </Link>
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link to="/items" className="hover:text-green-200">
              Items
            </Link>
            <Link to="/map" className="hover:text-green-200">
              Map
            </Link>
            <Link to="/dashboard" className="hover:text-green-200">
              Dashboard
            </Link>
            <Link to={`/profile/${user._id}`} className="hover:text-green-200">
              {user.name}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-green-600 px-4 py-1 rounded-full font-semibold hover:bg-green-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-green-200">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-green-600 px-4 py-1 rounded-full font-semibold hover:bg-green-100"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
