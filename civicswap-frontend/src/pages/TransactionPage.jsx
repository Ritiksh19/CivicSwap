import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const statusColors = {
  PENDING:  { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  APPROVED: { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200'  },
  REJECTED: { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-200'    },
  ON_LOAN:  { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200'   },
  RETURNED: { bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200'   },
  CLOSED:   { bg: 'bg-black/5',   text: 'text-black',      border: 'border-black/10'   },
};

const TransactionPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  const [actionLoading, setActionLoading] = useState('');

  const fetchData = async () => {
    try {
      const [txRes, reqRes] = await Promise.all([
        axios.get('/transactions/my'),
        axios.get('/transactions/requests'),
      ]);
      setTransactions(txRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, action) => {
  setActionLoading(id + action);

  // Optimistic update — pehle UI update karo
  if (action === 'approve') {
    setRequests(prev => prev.filter(r => r._id !== id));
    setTransactions(prev => prev.map(t =>
      t._id === id ? { ...t, status: 'APPROVED' } : t
    ));
  } else if (action === 'reject') {
    setRequests(prev => prev.filter(r => r._id !== id));
    setTransactions(prev => prev.map(t =>
      t._id === id ? { ...t, status: 'REJECTED' } : t
    ));
  } else if (action === 'return') {
    setTransactions(prev => prev.map(t =>
      t._id === id ? { ...t, status: 'RETURNED' } : t
    ));
  }

  try {
    await axios.put(`/transactions/${id}/${action}`);
    // Confirm with fresh data
    await fetchData();
  } catch (err) {
    console.error(err);
    // Revert on error
    await fetchData();
  } finally {
    setActionLoading('');
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const c = statusColors[status] || statusColors.CLOSED;
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Exchanges</p>
          <h1 className="text-4xl font-extrabold text-black tracking-tight">Transactions</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage your borrows and lending activity</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-2xl border border-gray-100 p-1 w-fit">
          {[
            { key: 'activity', label: `All Activity (${transactions.length})` },
            { key: 'requests', label: `Incoming Requests (${requests.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-black text-white shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* All Activity */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">🤝</div>
                <p className="text-gray-400 text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {transactions.map((tx, i) => (
                  <div key={i} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-black text-sm">{tx.item?.title}</p>
                        <StatusBadge status={tx.status} />
                      </div>
                      <p className="text-xs text-gray-400">
                        {tx.borrower?._id === user._id ? (
                          <>You borrowed from <span className="font-semibold text-black">{tx.lender?.name}</span></>
                        ) : (
                          <>Lent to <span className="font-semibold text-black">{tx.borrower?.name}</span></>
                        )}
                        {' · '}
                        {new Date(tx.startDate).toLocaleDateString()} — {new Date(tx.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    {tx.status === 'APPROVED' || tx.status === 'ON_LOAN' ? (
                      <button
                        onClick={() => handleAction(tx._id, 'return')}
                        disabled={actionLoading === tx._id + 'return'}
                        className="px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                      >
                        {actionLoading === tx._id + 'return' ? 'Processing...' : 'Mark Returned'}
                      </button>
                    ) : tx.status === 'RETURNED' ? (
                      <Link
                        to={`/rate/${tx._id}`}
                        className="px-4 py-2 border-2 border-black text-black rounded-xl text-xs font-semibold hover:bg-black hover:text-white transition-all duration-300"
                      >
                        Leave Rating
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Incoming Requests */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📬</div>
                <p className="text-gray-400 text-sm">No incoming requests</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {requests.map((req, i) => (
                  <div key={i} className="p-5 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        📦
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-black text-sm mb-1">{req.item?.title}</p>
                        <p className="text-xs text-gray-400 mb-1">
                          Requested by <span className="font-semibold text-black">{req.borrower?.name}</span>
                          {' · '}{req.borrower?.reputationScore}★
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(req.startDate).toLocaleDateString()} — {new Date(req.endDate).toLocaleDateString()}
                        </p>
                        {req.message && (
                          <p className="text-xs text-gray-500 mt-2 italic">"{req.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(req._id, 'approve')}
                          disabled={actionLoading === req._id + 'approve'}
                          className="px-4 py-2 bg-black text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                        >
                          {actionLoading === req._id + 'approve' ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(req._id, 'reject')}
                          disabled={actionLoading === req._id + 'reject'}
                          className="px-4 py-2 border-2 border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 transition-all duration-300 disabled:opacity-50"
                        >
                          {actionLoading === req._id + 'reject' ? '...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;