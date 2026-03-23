import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">

      {/* Left — Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-20 bg-white">
        <div className="w-full max-w-md">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-sm font-bold">CS</span>
            </div>
            <span className="text-lg font-bold text-black">CivicSwap</span>
          </Link>

          <h1 className="text-4xl font-extrabold text-black mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-400 mb-10 text-sm">
            Sign in to your account to continue
          </p>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="group">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-black font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Visual */}
      <div className="hidden md:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Orbs */}
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight leading-none">
            Share with
            <br />
            <span className="text-gray-500">your neighbors</span>
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
            Join thousands of neighbors already sharing resources and building stronger communities.
          </p>

          {/* Floating cards */}
          <div className="mt-12 flex flex-col gap-3 max-w-xs mx-auto">
            {[
              { icon: '🔧', text: 'Cordless Drill — 0.3km away', sub: 'Available now' },
              { icon: '📚', text: 'Physics Textbooks — 0.8km', sub: 'Available now' },
              { icon: '🍳', text: 'Pasta Maker — 1.2km away', sub: 'Available now' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">{item.text}</p>
                  <p className="text-green-400 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;