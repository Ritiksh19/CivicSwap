import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const heroRef = useRef(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { number: '2,400+', label: 'Items Shared' },
    { number: '800+', label: 'Neighbors Connected' },
    { number: '12+', label: 'Neighborhoods' },
    { number: '4.9★', label: 'Average Rating' },
  ];

  const features = [
    {
      icon: '📍',
      title: 'Hyper-Local',
      desc: 'Everything stays within your neighborhood. Set your radius from 0.5km to 10km.',
    },
    {
      icon: '🔒',
      title: 'Trusted Community',
      desc: 'Reputation scores and verified ratings ensure every exchange is safe.',
    },
    {
      icon: '♻️',
      title: 'Reduce Waste',
      desc: 'Stop buying things you only need once. Borrow from neighbors instead.',
    },
    {
      icon: '⚡',
      title: 'Instant Requests',
      desc: 'Send a borrow request in seconds. Get notified the moment it\'s approved.',
    },
    {
      icon: '🗺️',
      title: 'Interactive Map',
      desc: 'See available items pinned on a live map. Filter by category and distance.',
    },
    {
      icon: '🤝',
      title: 'Build Connections',
      desc: 'Meet your neighbors. Build trust. Strengthen your local community.',
    },
  ];

  const categories = [
    { icon: '🔧', name: 'Tools' },
    { icon: '📚', name: 'Books' },
    { icon: '🍳', name: 'Kitchenware' },
    { icon: '💻', name: 'Electronics' },
    { icon: '⚽', name: 'Sports' },
    { icon: '👕', name: 'Clothing' },
  ];

  return (
    <div className="w-full bg-white overflow-hidden">

      {/* ── HERO ── */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Parallax background */}
        <div
          ref={heroRef}
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
          style={{ willChange: 'transform' }}
        />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm font-medium">Now live in your neighborhood</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-none tracking-tight mb-6">
            Share More.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
              Buy Less.
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            CivicSwap connects neighbors to share everyday items — tools, books,
            kitchenware and more. Hyper-local, trusted, and completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/items"
                className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
              >
                Browse Items
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                >
                  Get Started Free
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="bg-black py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group cursor-default">
              <div className="text-4xl font-extrabold text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Simple Process
            </span>
            <h2 className="text-5xl font-extrabold text-black mt-3 tracking-tight">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                desc: 'Sign up, set your home location, and join your local CivicSwap community in under 2 minutes.',
                icon: '👤',
              },
              {
                step: '02',
                title: 'Discover Nearby Items',
                desc: 'Browse the interactive map or list view to find available items within your chosen radius.',
                icon: '🗺️',
              },
              {
                step: '03',
                title: 'Borrow & Return',
                desc: 'Send a request, get approved, pick up the item, and return it when done. Rate each other after.',
                icon: '🤝',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-10 group hover:bg-black transition-all duration-500 cursor-default"
              >
                <div className="text-5xl mb-6">{item.icon}</div>
                <div className="text-xs font-bold text-gray-300 group-hover:text-gray-600 mb-3 tracking-widest transition-colors duration-500">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-black group-hover:text-white mb-3 transition-colors duration-500">
                  {item.title}
                </h3>
                <p className="text-gray-500 group-hover:text-gray-400 text-sm leading-relaxed transition-colors duration-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <div className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              What You Can Share
            </span>
            <h2 className="text-5xl font-extrabold text-black mt-3 tracking-tight">
              Browse Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-6 text-center cursor-pointer hover:border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {cat.icon}
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors duration-300">
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Why CivicSwap
            </span>
            <h2 className="text-5xl font-extrabold text-black mt-3 tracking-tight">
              Built for Communities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-black hover:shadow-2xl transition-all duration-400 hover:-translate-y-1 cursor-default"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-32 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-extrabold text-white mb-6 tracking-tight leading-none">
            Ready to share
            <br />
            with your neighbors?
          </h2>
          <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of neighbors already sharing resources, reducing waste,
            and building stronger communities.
          </p>
          <Link
            to="/register"
            className="group inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
          >
            Join CivicSwap Today
            <span className="group-hover:translate-x-2 transition-transform duration-300 text-xl">→</span>
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="bg-black border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="text-black text-xs font-bold">CS</span>
            </div>
            <span className="text-white font-semibold">CivicSwap</span>
          </div>
          <p className="text-gray-600 text-sm">
            © 2026 CivicSwap. Built for communities.
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="text-gray-600 text-sm hover:text-white transition-colors duration-300">Login</Link>
            <Link to="/register" className="text-gray-600 text-sm hover:text-white transition-colors duration-300">Register</Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;