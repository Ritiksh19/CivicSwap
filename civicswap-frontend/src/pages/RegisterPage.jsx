import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    longitude: '',
    latitude: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const detectLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            ...formData,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          });
          setLocationLoading(false);
        },
        () => {
          setError('Location access denied. Please enable location.');
          setLocationLoading(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match!');
    }
    if (!formData.latitude || !formData.longitude) {
      return setError('Please set your location first!');
    }
    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">

      {/* Left — Visual */}
      <div className="hidden md:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 text-center px-12">
          <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight leading-none">
            Join your
            <br />
            <span className="text-gray-500">neighborhood</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto mb-12">
            Set your location, discover nearby items, and start sharing with your community today.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { number: '2,400+', label: 'Items Shared' },
              { number: '800+', label: 'Neighbors' },
              { number: '4.9★', label: 'Avg Rating' },
              { number: 'Free', label: 'Always' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-2xl font-extrabold text-white">{stat.number}</div>
                <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-20 bg-white overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-sm font-bold">CS</span>
            </div>
            <span className="text-lg font-bold text-black">CivicSwap</span>
          </Link>

          <h1 className="text-4xl font-extrabold text-black mb-2 tracking-tight">
            Create account
          </h1>
          <p className="text-gray-400 mb-10 text-sm">
            Join your local community — it's completely free
          </p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 hover:border-gray-400 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 hover:border-gray-400 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 hover:border-gray-400 bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-300 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 hover:border-gray-400 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Your Location
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading}
                className={`w-full border-2 rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  formData.latitude
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-600 hover:border-black hover:text-black bg-gray-50'
                }`}
              >
                {locationLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    Detecting...
                  </>
                ) : formData.latitude ? (
                  <>
                    ✅ Location Set — {formData.latitude}, {formData.longitude}
                  </>
                ) : (
                  <>
                    📍 Detect My Location
                  </>
                )}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;