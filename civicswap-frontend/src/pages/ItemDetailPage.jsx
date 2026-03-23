import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowData, setBorrowData] = useState({
    startDate: '',
    endDate: '',
    message: '',
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await axios.get(`/items/${id}`);
        setItem(data);
      } catch (err) {
        setError('Item not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleBorrow = async (e) => {
    e.preventDefault();
    setBorrowLoading(true);
    setError('');
    try {
      await axios.post('/transactions', {
        itemId: id,
        startDate: borrowData.startDate,
        endDate: borrowData.endDate,
        message: borrowData.message,
      });
      setSuccess('Borrow request sent successfully!');
      setShowBorrowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/items/${id}`);
      navigate('/items');
    } catch (err) {
      setError('Failed to delete item.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const categoryIcon = (cat) => {
    const icons = { Tools: '🔧', Books: '📚', Kitchenware: '🍳', Electronics: '💻', Sports: '⚽', Clothing: '👕', Other: '📦' };
    return icons[cat] || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-black mb-2">Item not found</h2>
          <Link to="/items" className="text-gray-400 hover:text-black transition-colors text-sm">← Back to Items</Link>
        </div>
      </div>
    );
  }

  const isOwner = item.owner?._id === user?._id;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link to="/items" className="text-xs text-gray-400 hover:text-black transition-colors font-medium flex items-center gap-1 mb-8">
          ← Back to Items
        </Link>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl mb-6 text-sm">
            <span>✅</span><span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Image */}
          <div className="bg-white rounded-2xl border border-gray-100 h-80 md:h-full flex items-center justify-center text-8xl hover:border-black transition-all duration-300">
            {categoryIcon(item.category)}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  item.status === 'AVAILABLE'
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  {item.status}
                </span>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  {item.category}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-black tracking-tight mb-3">{item.title}</h1>
              <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Owner */}
            <Link
              to={`/profile/${item.owner?._id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-black transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform duration-300">
                {item.owner?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-black text-sm">{item.owner?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.owner?.reputationScore}★ Reputation Score</p>
              </div>
              <span className="ml-auto text-gray-300 group-hover:text-black transition-colors">→</span>
            </Link>

            {/* Posted date */}
            <p className="text-xs text-gray-400">
              Posted {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {/* Actions */}
            {isOwner ? (
              <div className="flex gap-3">
                <Link
                  to={`/items/${id}/edit`}
                  className="flex-1 text-center bg-black text-white py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02]"
                >
                  Edit Item
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex-1 border-2 border-red-200 text-red-500 py-3 rounded-2xl text-sm font-semibold hover:bg-red-50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Item'}
                </button>
              </div>
            ) : (
              item.status === 'AVAILABLE' && (
                <div>
                  {!showBorrowForm ? (
                    <button
                      onClick={() => setShowBorrowForm(true)}
                      className="group w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      Request to Borrow
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </button>
                  ) : (
                    <form onSubmit={handleBorrow} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
                      <h3 className="font-bold text-black text-sm">Borrow Request</h3>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 block">From</label>
                          <input
                            type="date"
                            value={borrowData.startDate}
                            onChange={(e) => setBorrowData({ ...borrowData, startDate: e.target.value })}
                            required
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 block">To</label>
                          <input
                            type="date"
                            value={borrowData.endDate}
                            onChange={(e) => setBorrowData({ ...borrowData, endDate: e.target.value })}
                            required
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1 block">Message (optional)</label>
                        <textarea
                          value={borrowData.message}
                          onChange={(e) => setBorrowData({ ...borrowData, message: e.target.value })}
                          placeholder="Why do you need this item?"
                          rows={2}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 resize-none"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={borrowLoading}
                          className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                        >
                          {borrowLoading ? 'Sending...' : 'Send Request'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBorrowForm(false)}
                          className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:border-black transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;