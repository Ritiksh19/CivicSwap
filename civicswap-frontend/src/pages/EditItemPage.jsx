import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';

const CATEGORIES = ['Tools', 'Books', 'Kitchenware', 'Electronics', 'Sports', 'Clothing', 'Other'];

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await axios.get(`/items/${id}`);
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          status: data.status,
        });
      } catch (err) {
        setError('Item not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    try {
      await axios.put(`/items/${id}`, formData);
      navigate(`/items/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        <Link to={`/items/${id}`} className="text-xs text-gray-400 hover:text-black transition-colors font-medium flex items-center gap-1 mb-8">
          ← Back to Item
        </Link>

        <div className="mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Edit Listing</p>
          <h1 className="text-4xl font-extrabold text-black tracking-tight">Update Item</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Item Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">
                Category
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-3 px-4 rounded-2xl text-sm font-semibold border-2 transition-all duration-300 hover:scale-105 ${
                      formData.category === cat
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-black hover:text-black'
                    }`}
                  >
                    {cat === 'Tools' ? '🔧' :
                     cat === 'Books' ? '📚' :
                     cat === 'Kitchenware' ? '🍳' :
                     cat === 'Electronics' ? '💻' :
                     cat === 'Sports' ? '⚽' :
                     cat === 'Clothing' ? '👕' : '📦'} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">
                Status
              </label>
              <div className="flex gap-3">
                {['AVAILABLE', 'UNAVAILABLE'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`flex-1 py-3 rounded-2xl text-sm font-semibold border-2 transition-all duration-300 ${
                      formData.status === s
                        ? s === 'AVAILABLE'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-black'
                    }`}
                  >
                    {s === 'AVAILABLE' ? '✓ Available' : '✗ Unavailable'}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saveLoading}
              className="group w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              ) : (
                <>Save Changes <span className="group-hover:translate-x-1 transition-transform duration-300">→</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItemPage;