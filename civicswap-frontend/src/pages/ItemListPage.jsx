import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';

const CATEGORIES = ['All', 'Tools', 'Books', 'Kitchenware', 'Electronics', 'Sports', 'Clothing', 'Other'];

const categoryIcon = (cat) => {
  const icons = { Tools: '🔧', Books: '📚', Kitchenware: '🍳', Electronics: '💻', Sports: '⚽', Clothing: '👕', Other: '📦' };
  return icons[cat] || '📦';
};

const ItemListPage = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const params = location
          ? `?latitude=${location.lat}&longitude=${location.lng}&radius=10`
          : '';
        const { data } = await axios.get(`/items${params}`);
        setItems(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [location]);

  useEffect(() => {
    let result = items;
    if (category !== 'All') result = result.filter(i => i.category === category);
    if (search) result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, category, items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Community Items</p>
            <h1 className="text-4xl font-extrabold text-black tracking-tight">Browse Items</h1>
            <p className="text-gray-400 mt-1 text-sm">{filtered.length} items available near you</p>
          </div>
          <Link
            to="/items/create"
            className="group inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg self-start"
          >
            + Post Item
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-white hover:border-gray-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-300 hover:scale-105 ${
                category === cat
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {cat !== 'All' && categoryIcon(cat)} {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-black mb-2">No items found</h3>
            <p className="text-gray-400 text-sm mb-6">Try a different search or category</p>
            <Link to="/items/create" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all duration-300">
              Post the first item →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <Link
                key={item._id}
                to={`/items/${item._id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl group-hover:bg-gray-200 transition-colors duration-300">
                  {categoryIcon(item.category)}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-black text-base group-hover:underline">{item.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                      item.status === 'AVAILABLE'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {item.owner?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-black">{item.owner?.name}</p>
                        <p className="text-xs text-gray-400">{item.owner?.reputationScore}★</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      {item.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemListPage;