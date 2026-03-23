import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const RatingPage = () => {
  const { transactionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const { data } = await axios.get('/transactions/my');
        const tx = data.find(t => t._id === transactionId);
        setTransaction(tx);
      } catch (err) {
        setError('Transaction not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) return setError('Please select a star rating.');
    setSubmitLoading(true);
    setError('');
    try {
      await axios.post('/ratings', {
        transactionId,
        stars,
        feedback,
      });
      navigate('/transactions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const ratee = transaction
    ? transaction.borrower?._id === user?._id
      ? transaction.lender
      : transaction.borrower
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-6 flex items-center justify-center">
      <div className="w-full max-w-md">

        <Link to="/transactions" className="text-xs text-gray-400 hover:text-black transition-colors font-medium flex items-center gap-1 mb-8">
          ← Back to Transactions
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">⭐</div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Rate Your Experience</p>
            <h1 className="text-2xl font-extrabold text-black tracking-tight">
              How was it?
            </h1>
            {ratee && (
              <p className="text-gray-400 text-sm mt-2">
                Rate your experience with <span className="font-semibold text-black">{ratee?.name}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Stars */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 block text-center">
                Your Rating
              </label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="text-4xl transition-all duration-200 hover:scale-125 focus:outline-none"
                  >
                    {star <= (hoveredStar || stars) ? '★' : '☆'}
                  </button>
                ))}
              </div>
              {stars > 0 && (
                <p className="text-center text-sm font-semibold text-black mt-3">
                  {stars === 1 ? 'Poor' : stars === 2 ? 'Fair' : stars === 3 ? 'Good' : stars === 4 ? 'Very Good' : 'Excellent!'}
                </p>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Written Feedback (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with the community..."
                rows={4}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitLoading || stars === 0}
              className="group w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
              ) : (
                <>Submit Rating <span className="group-hover:translate-x-1 transition-transform duration-300">→</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingPage;