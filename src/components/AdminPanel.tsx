import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Users, Package, Wallet, Settings, Bell, Gift, 
  CheckCircle, XCircle, Search, Edit2, Plus, Trash2,
  ArrowLeft, LayoutDashboard, LogOut
} from 'lucide-react';

export default function AdminPanel({ user }: { user: any }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-500" />
            Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
            <Users className="w-5 h-5" /> Users
          </Link>
          <Link to="/admin/packages" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
            <Package className="w-5 h-5" /> Packages
          </Link>
          <Link to="/admin/deposits" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
            <Wallet className="w-5 h-5" /> Deposits
          </Link>
          <Link to="/admin/withdrawals" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
            <ArrowLeft className="w-5 h-5" /> Withdrawals
          </Link>
          <Link to="/admin/gift-codes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
            <Gift className="w-5 h-5" /> Gift Codes
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-900/30 hover:text-red-400 transition-all w-full text-left">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminUsers />} />
          <Route path="/packages" element={<AdminPackages />} />
          <Route path="/deposits" element={<AdminDeposits />} />
          <Route path="/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/gift-codes" element={<AdminGiftCodes />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    if (!search) return;
    const res = await fetch(`/api/admin/users/search?phone=${search}`);
    if (res.ok) setSelectedUser(await res.json());
    else alert('User not found');
  };

  const updateBalance = async (userId: number, amount: number, type: string) => {
    const res = await fetch('/api/admin/users/update-balance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, type }),
    });
    if (res.ok) {
      alert('Balance updated');
      fetchUsers();
      if (selectedUser) handleSearch();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search by phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button onClick={handleSearch} className="bg-emerald-600 text-white p-2 rounded-xl">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedUser && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{selectedUser.user.phone}</h3>
              <p className="text-sm text-slate-500">Balance: ৳{selectedUser.user.balance}</p>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Update Balance</h4>
              <div className="flex gap-2">
                <input id="bal-amt" type="number" placeholder="Amount" className="w-full px-3 py-2 rounded-lg border border-slate-200" />
                <button onClick={() => updateBalance(selectedUser.user.id, parseFloat((document.getElementById('bal-amt') as HTMLInputElement).value), 'add')} className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold">Add</button>
                <button onClick={() => updateBalance(selectedUser.user.id, parseFloat((document.getElementById('bal-amt') as HTMLInputElement).value), 'sub')} className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-bold">Sub</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800">Active Packages</h4>
            <div className="grid grid-cols-2 gap-4">
              {selectedUser.packages.map((pkg: any) => (
                <div key={pkg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-bold">{pkg.name}</p>
                  <p className="text-xs text-slate-500">Expires: {new Date(pkg.expires_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Phone</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Balance</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">{u.phone}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">৳{u.balance}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button onClick={() => { setSearch(u.phone); handleSearch(); }} className="text-emerald-600 hover:text-emerald-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', daily_earning: '', total_income: '', validity_days: '365', referral_commission: '10', image_url: ''
  });

  const fetchPackages = async () => {
    const res = await fetch('/api/packages');
    if (res.ok) setPackages(await res.json());
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert('Package added');
      setShowForm(false);
      fetchPackages();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">VIP Packages</h2>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold">
          <Plus className="w-5 h-5" /> Add Package
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-2xl">
          <h3 className="text-xl font-bold mb-6">Create New Package</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price (৳)</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Daily Earning (৳)</label>
              <input type="number" required value={formData.daily_earning} onChange={(e) => setFormData({...formData, daily_earning: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Income (৳)</label>
              <input type="number" required value={formData.total_income} onChange={(e) => setFormData({...formData, total_income: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Validity (Days)</label>
              <input type="number" required value={formData.validity_days} onChange={(e) => setFormData({...formData, validity_days: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image URL</label>
              <input type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200" placeholder="https://..." />
            </div>
            <div className="col-span-2 flex gap-3 mt-4">
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold">Save Package</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {packages.map((pkg: any) => (
          <div key={pkg.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
            <img src={pkg.image_url || `https://picsum.photos/seed/${pkg.id}/400/200`} alt={pkg.name} className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
            <div className="p-4">
              <h4 className="font-bold text-slate-800">{pkg.name}</h4>
              <p className="text-xl font-bold text-emerald-600 mt-1">৳{pkg.price}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-slate-400">
                <div className="bg-slate-50 p-2 rounded-lg">Daily: <span className="text-slate-700">৳{pkg.daily_earning}</span></div>
                <div className="bg-slate-50 p-2 rounded-lg">Total: <span className="text-slate-700">৳{pkg.total_income}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDeposits() {
  const [deposits, setDeposits] = useState<any[]>([]);

  const fetchDeposits = async () => {
    const res = await fetch('/api/admin/deposits');
    if (res.ok) setDeposits(await res.json());
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleAction = async (depositId: number, action: string) => {
    const res = await fetch('/api/admin/deposits/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId, action }),
    });
    if (res.ok) {
      alert(`Deposit ${action}ed`);
      fetchDeposits();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Deposit Requests</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Method</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Trx ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deposits.map((d: any) => (
              <tr key={d.id}>
                <td className="px-6 py-4 text-sm font-semibold">{d.phone}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">৳{d.amount}</td>
                <td className="px-6 py-4 text-xs font-bold uppercase">{d.method}</td>
                <td className="px-6 py-4 text-xs font-mono">{d.transaction_id}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {d.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(d.id, 'approve')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><CheckCircle className="w-5 h-5" /></button>
                      <button onClick={() => handleAction(d.id, 'reject')} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-5 h-5" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const fetchWithdrawals = async () => {
    const res = await fetch('/api/admin/withdrawals');
    if (res.ok) setWithdrawals(await res.json());
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (withdrawalId: number, action: string) => {
    const res = await fetch('/api/admin/withdrawals/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, action }),
    });
    if (res.ok) {
      alert(`Withdrawal ${action}ed`);
      fetchWithdrawals();
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Withdrawal Requests</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Method</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Account</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {withdrawals.map((w: any) => (
              <tr key={w.id}>
                <td className="px-6 py-4 text-sm font-semibold">{w.phone}</td>
                <td className="px-6 py-4 font-bold text-red-600">৳{w.amount}</td>
                <td className="px-6 py-4 text-xs font-bold uppercase">{w.method}</td>
                <td className="px-6 py-4 text-xs font-mono">{w.account_number}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${w.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : w.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(w.id, 'approve')} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><CheckCircle className="w-5 h-5" /></button>
                      <button onClick={() => handleAction(w.id, 'reject')} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle className="w-5 h-5" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminGiftCodes() {
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [maxClaims, setMaxClaims] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/gift-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount: parseFloat(amount), max_claims: parseInt(maxClaims) }),
    });
    if (res.ok) {
      alert('Gift code created');
      setCode(''); setAmount(''); setMaxClaims('');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Gift Codes</h2>
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Code</label>
            <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 font-mono" placeholder="GIFT2024" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount (৳)</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Claims</label>
            <input type="number" required value={maxClaims} onChange={(e) => setMaxClaims(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200" />
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Create Code</button>
        </form>
      </div>
    </div>
  );
}

function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  const updateSetting = async (key: string, value: string) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) alert('Setting updated');
  };

  const addNotice = async () => {
    const res = await fetch('/api/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: notice }),
    });
    if (res.ok) {
      alert('Notice added');
      setNotice('');
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="font-bold text-slate-800">Payment Numbers</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">bKash Number</label>
            <div className="flex gap-2">
              <input type="text" value={settings.bkash_number || ''} onChange={(e) => setSettings({...settings, bkash_number: e.target.value})} className="flex-1 px-4 py-2 rounded-xl border border-slate-200" />
              <button onClick={() => updateSetting('bkash_number', settings.bkash_number)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold">Save</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nagad Number</label>
            <div className="flex gap-2">
              <input type="text" value={settings.nagad_number || ''} onChange={(e) => setSettings({...settings, nagad_number: e.target.value})} className="flex-1 px-4 py-2 rounded-xl border border-slate-200" />
              <button onClick={() => updateSetting('nagad_number', settings.nagad_number)} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-bold">Save</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="font-bold text-slate-800">App Notice</h3>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">New Notice</label>
            <textarea value={notice} onChange={(e) => setNotice(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 h-24 mb-2" placeholder="Enter notice for users..." />
            <button onClick={addNotice} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Broadcast Notice</button>
          </div>
        </div>
      </div>
    </div>
  );
}
