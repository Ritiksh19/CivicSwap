import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const DashboardPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, itemRes] = await Promise.all([
          axios.get('/transactions/my'),
          axios.get('/items'),
        ]);
        setTransactions(txRes.data.slice(0, 5));
        setMyItems(itemRes.data.filter(item => item.owner._id === user._id).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColors = {
    PENDING:  'bg-yellow-50 text-yellow-600 border-yellow-200',
    APPROVED: 'bg-green-50 text-green-600 border-green-200',
    REJECTED: 'bg-red-50 text-red-600 border-red-200',
    ON_LOAN:  'bg-blue-50 text-blue-600 border-blue-200',
    RETURNED: 'bg-gray-50 text-gray-600 border-gray-200',
    CLOSED:   'bg-black/5 text-black border-black/10',
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
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="text-4xl font-extrabold text-black tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Here's what's happening in your neighborhood</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'My Items', value: myItems.length, icon: '📦' },
            { label: 'Active Borrows', value: transactions.filter(t => t.status === 'APPROVED' || t.status === 'ON_LOAN').length, icon: '🤝' },
            { label: 'Pending Requests', value: transactions.filter(t => t.status === 'PENDING').length, icon: '⏳' },
            { label: 'Reputation', value: `${user?.reputationScore || 0}★`, icon: '⭐' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300 group cursor-default">
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
              <div className="text-3xl font-extrabold text-black mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { to: '/items/create', icon: '➕', title: 'Post an Item', desc: 'Share something with neighbors', bg: 'bg-black', text: 'text-white', sub: 'text-gray-400' },
            { to: '/items', icon: '🔍', title: 'Browse Items', desc: 'Find what you need nearby', bg: 'bg-white', text: 'text-black', sub: 'text-gray-400' },
            { to: '/map', icon: '🗺️', title: 'Open Map', desc: 'Discover items on the map', bg: 'bg-white', text: 'text-black', sub: 'text-gray-400' },
          ].map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className={`${action.bg} ${action.text} rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex items-center gap-4`}
            >
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
              <div>
                <div className="font-bold text-base">{action.title}</div>
                <div className={`text-xs mt-0.5 ${action.sub}`}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-black text-lg">Recent Activity</h2>
              <Link to="/transactions" className="text-xs text-gray-400 hover:text-black transition-colors font-medium">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No activity yet</div>
              ) : (
                transactions.map((tx, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                        📦
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">{tx.item?.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {tx.borrower?._id === user._id ? 'You borrowed' : 'You lent'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Items */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-black text-lg">My Items</h2>
              <Link to="/items/create" className="text-xs text-gray-400 hover:text-black transition-colors font-medium">
                + Add new
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {myItems.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-sm mb-4">You haven't posted any items yet</p>
                  <Link
                    to="/items/create"
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                  >
                    Post your first item →
                  </Link>
                </div>
              ) : (
                myItems.map((item, i) => (
                  <Link
                    key={i}
                    to={`/items/${item._id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                        {item.category === 'Tools' ? '🔧' :
                         item.category === 'Books' ? '📚' :
                         item.category === 'Electronics' ? '💻' :
                         item.category === 'Kitchenware' ? '🍳' : '📦'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black group-hover:underline">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      item.status === 'AVAILABLE'
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : item.status === 'ON_LOAN'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {item.status}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;