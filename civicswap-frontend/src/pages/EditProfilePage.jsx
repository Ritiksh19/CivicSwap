import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const EditProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    password: '',
    confirmPassword: '',
    longitude: '',
    latitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const detectLocation = () => {
    setLocationLoading(true);
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
        setError('Location access denied.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match!');
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        bio: formData.bio,
      };

      if (formData.password) updateData.password = formData.password;
      if (formData.latitude && formData.longitude) {
        updateData.latitude = parseFloat(formData.latitude);
        updateData.longitude = parseFloat(formData.longitude);
      }

      const { data } = await axios.put('/auth/profile', updateData);

      // Update localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">

        <Link to={`/profile/${user?._id}`} className="text-xs text-gray-400 hover:text-black transition-colors font-medium flex items-center gap-1 mb-8">
          ← Back to Profile
        </Link>

        <div className="mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Account</p>
          <h1 className="text-4xl font-extrabold text-black tracking-tight">Edit Profile</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-extrabold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-black">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

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
                required
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell your neighbors about yourself..."
                rows={3}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                New Password <span className="normal-case font-normal text-gray-300">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Confirm Password */}
            {formData.password && (
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-black transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
            )}

            {/* Location */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">
                Update Location <span className="normal-case font-normal text-gray-300">(optional)</span>
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locationLoading}
                className={`w-full border-2 rounded-2xl px-5 py-4 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  formData.latitude
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-600 hover:border-black bg-gray-50'
                }`}
              >
                {locationLoading ? (
                  <><div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />Detecting...</>
                ) : formData.latitude ? (
                  <>✅ Location Updated — {formData.latitude}, {formData.longitude}</>
                ) : (
                  <>📍 Update My Location</>
                )}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-black text-white py-4 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
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

export default EditProfilePage;