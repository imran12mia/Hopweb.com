import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, User, Wallet, History, Package, Gift, Bell, 
  ArrowUpCircle, ArrowDownCircle, LogOut, ChevronRight,
  TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

export default function UserApp({ user: initialUser }: { user: any }) {
  const [user, setUser] = useState(initialUser);
  const [settings, setSettings] = useState<any>({});
  const [notices, setNotices] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = async () => {
    const res = await fetch('/api/me');
    if (res.ok) setUser(await res.json());
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    if (res.ok) setSettings(await res.json());
  };

  const fetchNotices = async () => {
    const res = await fetch('/api/notices');
    if (res.ok) setNotices(await res.json());
  };

  useEffect(() => {
    fetchUser();
    fetchSettings();
    fetchNotices();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Icon className={`w-6 h-6 ${isActive ? 'fill-emerald-50' : ''}`} />
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </Link>
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
            {user.phone.slice(-2)}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">{user.phone}</h2>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
              <TrendingUp className="w-3 h-3" />
              VIP Member
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<HomeView user={user} notices={notices} />} />
          <Route path="/profile" element={<ProfileView user={user} />} />
          <Route path="/deposit" element={<DepositView settings={settings} onUpdate={fetchUser} />} />
          <Route path="/withdraw" element={<WithdrawView user={user} onUpdate={fetchUser} />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/packages" element={<PackagesView user={user} onUpdate={fetchUser} />} />
          <Route path="/gift" element={<GiftView onUpdate={fetchUser} />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center max-w-md mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <NavItem to="/" icon={Home} label="Home" />
        <NavItem to="/packages" icon={Package} label="VIP" />
        <NavItem to="/history" icon={History} label="History" />
        <NavItem to="/profile" icon={User} label="Profile" />
      </nav>
    </div>
  );
}

function HomeView({ user, notices }: any) {
  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 relative overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-widest mb-1">Total Balance</p>
          <h3 className="text-4xl font-bold">৳{user.balance.toLocaleString()}</h3>
          <div className="mt-6 flex gap-3">
            <Link to="/deposit" className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all">
              <ArrowUpCircle className="w-4 h-4" /> Deposit
            </Link>
            <Link to="/withdraw" className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all">
              <ArrowDownCircle className="w-4 h-4" /> Withdraw
            </Link>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </motion.div>

      {/* Notice Section */}
      {notices.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
          <Bell className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-amber-800 uppercase mb-1">Notice</p>
            <div className="text-sm text-amber-700 animate-marquee whitespace-nowrap">
              {notices[0].content}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/packages" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:border-emerald-200 transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
            <Package className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-700">VIP Packages</span>
        </Link>
        <Link to="/gift" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 hover:border-emerald-200 transition-all">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
            <Gift className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-700">Gift Code</span>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 mb-4">Account Stats</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-600">Active Packages</span>
            </div>
            <span className="text-sm font-bold">0</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-600">Daily Earning</span>
            </div>
            <span className="text-sm font-bold">৳0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ user }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
          {user.phone.slice(-2)}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{user.phone}</h3>
        <p className="text-slate-500 text-sm">Member since {new Date(user.created_at).toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
            <h4 className="text-2xl font-bold text-emerald-600">৳{user.balance.toLocaleString()}</h4>
          </div>
          <Link to="/deposit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100">
            Add Funds
          </Link>
        </div>

        <div className="space-y-2">
          <Link to="/history" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Transaction History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>
          <Link to="/gift" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Redeem Gift Code</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DepositView({ settings, onUpdate }: any) {
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [method, setMethod] = useState('bkash');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), transactionId, method }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: 'Deposit request submitted successfully!' });
      setAmount('');
      setTransactionId('');
      onUpdate();
    } else {
      setMessage({ type: 'error', text: data.error });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Deposit Funds</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          বিকাশ পার্সোনাল নাম্বারে সেন্ড মানি করে সঠিক ট্রানজেকশন আইডি দিন এবং সাবমিট করুন। 
          আপনার টাকার পরিমান ভুল হয় অথবা ট্রানজেকশন আইডি ভুল হয় তাহলে আপনার টাকা হারাতে অক্ষম হবে।
        </p>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">bKash Personal</p>
              <p className="text-lg font-bold text-emerald-900">{settings.bkash_number}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(settings.bkash_number)} className="bg-white text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-emerald-100">Copy</button>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Nagad Personal</p>
              <p className="text-lg font-bold text-amber-900">{settings.nagad_number}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(settings.nagad_number)} className="bg-white text-amber-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-amber-100">Copy</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setMethod('bkash')}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${method === 'bkash' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                bKash
              </button>
              <button 
                type="button"
                onClick={() => setMethod('nagad')}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${method === 'nagad' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                Nagad
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount (৳)</label>
            <input 
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Min ৳500"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</label>
            <input 
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. 8N7X6W5V4U"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
}

function WithdrawView({ user, onUpdate }: any) {
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [method, setMethod] = useState('bkash');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) > user.balance) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), accountNumber, method }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: 'Withdrawal request submitted!' });
      setAmount('');
      setAccountNumber('');
      onUpdate();
    } else {
      setMessage({ type: 'error', text: data.error });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Withdraw Funds</h3>
        <p className="text-xs text-slate-500 mb-6">Enter your details correctly to receive funds within 24 hours.</p>

        <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex justify-between items-center">
          <span className="text-xs font-medium text-slate-500">Available Balance</span>
          <span className="text-lg font-bold text-emerald-600">৳{user.balance.toLocaleString()}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Select Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setMethod('bkash')}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${method === 'bkash' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                bKash
              </button>
              <button 
                type="button"
                onClick={() => setMethod('nagad')}
                className={`py-3 rounded-xl text-sm font-bold border transition-all ${method === 'nagad' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                Nagad
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount (৳)</label>
            <input 
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Min ৳200"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Number</label>
            <input 
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
}

function HistoryView() {
  const [type, setType] = useState('deposits');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/history/${type}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      });
  }, [type]);

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
        <button 
          onClick={() => setType('deposits')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'deposits' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
        >
          Deposits
        </button>
        <button 
          onClick={() => setType('withdrawals')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'withdrawals' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
        >
          Withdrawals
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
            <History className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No transactions found</p>
          </div>
        ) : (
          history.map((item: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : item.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                  {item.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> : item.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">৳{item.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : item.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{item.transaction_id || item.account_number}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function PackagesView({ user, onUpdate }: any) {
  const [packages, setPackages] = useState<any[]>([]);
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all'); // 'all' or 'mine'

  const fetchData = async () => {
    setLoading(true);
    const [pkgRes, myPkgRes] = await Promise.all([
      fetch('/api/packages'),
      fetch('/api/my-packages')
    ]);
    if (pkgRes.ok) setPackages(await pkgRes.json());
    if (myPkgRes.ok) setMyPackages(await myPkgRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuy = async (pkgId: number) => {
    const res = await fetch('/api/buy-package', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId: pkgId }),
    });
    if (res.ok) {
      alert('Package purchased successfully!');
      fetchData();
      onUpdate();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleClaim = async (upId: number) => {
    const res = await fetch('/api/claim-earning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPackageId: upId }),
    });
    if (res.ok) {
      const data = await res.json();
      alert(`Claimed ৳${data.earning} successfully!`);
      fetchData();
      onUpdate();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
        <button 
          onClick={() => setView('all')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
        >
          All Packages
        </button>
        <button 
          onClick={() => setView('mine')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'mine' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
        >
          My Packages
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading packages...</div>
        ) : view === 'all' ? (
          packages.map((pkg: any) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={pkg.id} 
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
            >
              <img 
                src={pkg.image_url || `https://picsum.photos/seed/${pkg.id}/400/200`} 
                alt={pkg.name} 
                className="w-full h-40 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{pkg.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">Validity: {pkg.validity_days} Days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-600">৳{pkg.price}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Price</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Daily Earning</p>
                    <p className="text-sm font-bold text-slate-700">৳{pkg.daily_earning}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Income</p>
                    <p className="text-sm font-bold text-slate-700">৳{pkg.total_income}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleBuy(pkg.id)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  Invest Now
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          myPackages.map((up: any) => (
            <div key={up.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800">{up.name}</h4>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Daily</p>
                  <p className="text-sm font-bold text-slate-700">৳{up.daily_earning}</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Expires</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(up.expires_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => handleClaim(up.id)}
                className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Claim Daily Earning
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GiftView({ onUpdate }: any) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/claim-gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage({ type: 'success', text: `Gift code redeemed! You received ৳${data.amount}` });
      setCode('');
      onUpdate();
    } else {
      setMessage({ type: 'error', text: data.error });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mx-auto mb-6">
          <Gift className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Redeem Gift Code</h3>
        <p className="text-xs text-slate-500 mb-8">Enter the special code provided by admin to get instant balance.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Gift Code"
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none text-center font-bold tracking-widest uppercase"
          />

          {message && (
            <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-100 disabled:opacity-50"
          >
            {loading ? 'Redeeming...' : 'Claim Gift'}
          </button>
        </form>
      </div>
    </div>
  );
}
