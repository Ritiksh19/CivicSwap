import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="w-full bg-green-600 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to CivicSwap</h1>
        <p className="text-xl mb-8 text-green-100">
          Borrow everyday items from your neighbors — completely free!
        </p>
        {user ? (
          <Link
            to="/items"
            className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-100"
          >
            Browse Items →
          </Link>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-100"
            >
              Get Started →
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="w-full py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <div className="text-5xl mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Register</h3>
            <p className="text-gray-500">
              Set your home location and join your local community
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <div className="text-5xl mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Discover Items</h3>
            <p className="text-gray-500">
              Find available items near you on an interactive map
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <div className="text-5xl mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Borrow</h3>
            <p className="text-gray-500">
              Send a request and pick up the item once approved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
