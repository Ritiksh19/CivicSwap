import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMe = id === user?._id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ratingsRes, itemsRes] = await Promise.all([
          axios.get(`/auth/profile`),
          axios.get(`/ratings/user/${id}`),
          axios.get(`/items`),
        ]);
        setProfile(isMe ? profileRes.data : { name: 'User', reputationScore: 0 });
        setRatings(ratingsRes.data);
        setItems(itemsRes.data.filter(item => item.owner?._id === id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-extrabold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-black tracking-tight">{profile?.name}</h1>
              <p className="text-gray-400 text-sm mt-1">{profile?.bio || 'CivicSwap community member'}</p>
              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-black">{profile?.reputationScore || 0}★</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-black">{ratings.length}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-black">{items.length}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Items</div>
                </div>
              </div>
            </div>
            {isMe && (
              <Link
                to="/profile/me/edit"
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-black text-lg">Listed Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No items listed yet</div>
              ) : (
                items.map((item, i) => (
                  <Link
                    key={i}
                    to={`/items/${item._id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                        {categoryIcon(item.category)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black group-hover:underline">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      item.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-black text-lg">Reviews ({ratings.length})</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {ratings.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No reviews yet</div>
              ) : (
                ratings.map((rating, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {rating.rater?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{rating.rater?.name}</p>
                        <p className="text-xs text-yellow-500">{'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}</p>
                      </div>
                    </div>
                    {rating.feedback && (
                      <p className="text-xs text-gray-500 leading-relaxed pl-11">{rating.feedback}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;