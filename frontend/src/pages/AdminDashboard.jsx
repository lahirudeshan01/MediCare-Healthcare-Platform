import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Stethoscope, Calendar, TrendingUp, ShieldCheck,
  FileText, CheckCircle, XCircle, LogOut, RefreshCw, Trash2,
  UserCheck, UserX, DollarSign, AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { AUTH_SERVICE, DOCTOR_SERVICE } from '../config/api';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SearchBar } from '../components/ui/SearchBar';

const TABS = ['Overview', 'Users', 'Verification', 'Transactions'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats
  const [userStats, setUserStats] = useState(null);
  const [doctorStats, setDoctorStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Users
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Verification
  const [pendingDoctors, setPendingDoctors] = useState([]);

  // Transactions
  const [transactions, setTransactions] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Auth guard
  useEffect(() => {
    const t = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!t || user.role !== 'admin') navigate('/auth', { replace: true });
  }, []);

  // Fetch stats on mount
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [us, ds, pd] = await Promise.all([
        axios.get(`${AUTH_SERVICE}/auth/admin/stats`, { headers }),
        axios.get(`${DOCTOR_SERVICE}/doctors/admin/stats`, { headers }),
        axios.get(`${AUTH_SERVICE}/auth/admin/pending-doctors`, { headers }),
      ]);
      setUserStats(us.data);
      setDoctorStats(ds.data);
      setPendingCount(pd.data.length);
    } catch (e) {
      setError('Failed to load stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, []);

  // Users tab
  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch.trim()) params.search = userSearch.trim();
      const res = await axios.get(`${AUTH_SERVICE}/auth/admin/users`, { headers, params });
      setUsers(res.data);
    } catch (e) {
      setError('Failed to load users.');
    }
  }, [userRoleFilter, userSearch]);

  useEffect(() => {
    if (tab === 'Users') fetchUsers();
  }, [tab, userRoleFilter]);

  const toggleUserStatus = async (id, currentActive) => {
    try {
      await axios.patch(`${AUTH_SERVICE}/auth/admin/users/${id}`, { isActive: !currentActive }, { headers });
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update user.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try {
      await axios.delete(`${AUTH_SERVICE}/auth/admin/users/${id}`, { headers });
      fetchUsers();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Verification tab
  const fetchPending = useCallback(async () => {
    try {
      const res = await axios.get(`${AUTH_SERVICE}/auth/admin/pending-doctors`, { headers });
      setPendingDoctors(res.data);
      setPendingCount(res.data.length);
    } catch (e) {
      setError('Failed to load pending doctors.');
    }
  }, []);

  useEffect(() => {
    if (tab === 'Verification') fetchPending();
  }, [tab]);

  const handleVerify = async (id, action) => {
    try {
      await axios.patch(`${AUTH_SERVICE}/auth/admin/doctors/${id}/verify`, { action }, { headers });
      fetchPending();
      fetchStats();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update verification.');
    }
  };

  // Transactions tab
  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${DOCTOR_SERVICE}/doctors/admin/transactions`, { headers });
      setTransactions(res.data);
    } catch (e) {
      setError('Failed to load transactions.');
    }
  }, []);

  useEffect(() => {
    if (tab === 'Transactions') fetchTransactions();
  }, [tab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth', { replace: true });
  };

  const totalRevenue = transactions.reduce((s, t) => s + (t.fee || 0), 0);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-['Inter',system-ui,sans-serif]">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-[#D2D2D7]/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Admin Portal</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex gap-1">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t ? 'bg-[#1D1D1F] text-white' : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 ml-2 text-sm font-medium text-[#86868B] hover:text-[#FF3B30] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#FF3B30]/5">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="sm:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? 'bg-[#1D1D1F] text-white' : 'text-[#86868B] bg-[#F5F5F7]'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-[#FF3B30]/10 text-[#FF3B30] text-sm px-4 py-3 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>
            <button onClick={() => setError('')} className="text-lg font-bold leading-none">×</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── OVERVIEW TAB ─────────────────────────────────── */}
        {tab === 'Overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: loading ? '...' : (userStats?.total ?? '—'), icon: Users, color: '#0071E3' },
                { label: 'Verified Doctors', value: loading ? '...' : (doctorStats?.verifiedDoctors ?? '—'), icon: Stethoscope, color: '#30D158' },
                { label: 'Total Appointments', value: loading ? '...' : (doctorStats?.totalAppointments ?? '—'), icon: Calendar, color: '#FF9F0A' },
                { label: 'Total Revenue', value: loading ? '...' : `Rs. ${((doctorStats?.totalRevenue) || 0).toLocaleString()}`, icon: TrendingUp, color: '#AF52DE' },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: stat.color + '18' }}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <p className="text-sm text-[#86868B] font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1D1D1F]">{stat.value}</p>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold">User Distribution</h3>
                  <button onClick={fetchStats} className="p-1.5 rounded-lg hover:bg-[#F5F5F7]">
                    <RefreshCw className="w-4 h-4 text-[#86868B]" />
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Patients', value: userStats?.patients || 0, color: '#0071E3' },
                    { label: 'Doctors', value: userStats?.doctors || 0, color: '#30D158' },
                    { label: 'Admins', value: userStats?.admins || 0, color: '#FF9F0A' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-[#86868B]">{item.value}</span>
                      </div>
                      <div className="h-2 bg-[#F5F5F7] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: userStats?.total ? `${Math.max(2, (item.value / userStats.total) * 100)}%` : '2%',
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F5F7] rounded-xl p-4">
                    <p className="text-xs text-[#86868B] mb-1">Active Accounts</p>
                    <p className="text-xl font-bold text-[#30D158]">{userStats?.active ?? '—'}</p>
                  </div>
                  <div className="bg-[#F5F5F7] rounded-xl p-4">
                    <p className="text-xs text-[#86868B] mb-1">Inactive Accounts</p>
                    <p className="text-xl font-bold text-[#FF3B30]">{userStats?.inactive ?? '—'}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Doctor Verification</h3>
                <div className="space-y-3 mb-5">
                  {[
                    { label: 'Verified', value: doctorStats?.verifiedDoctors || 0, color: '#30D158', bg: '#30D15815' },
                    { label: 'Pending Review', value: pendingCount, color: '#FF9F0A', bg: '#FF9F0A15' },
                    { label: 'Rejected', value: doctorStats?.rejectedDoctors || 0, color: '#FF3B30', bg: '#FF3B3015' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: item.bg }}>
                      <span className="text-sm font-medium" style={{ color: item.color }}>{item.label}</span>
                      <span className="text-xl font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                {pendingCount > 0 && (
                  <button
                    onClick={() => setTab('Verification')}
                    className="w-full py-2 bg-[#FF9F0A] text-white text-sm font-medium rounded-xl hover:bg-[#E8930A] transition-colors">
                    Review {pendingCount} Pending →
                  </button>
                )}
                {pendingCount === 0 && (
                  <div className="flex items-center gap-2 text-[#30D158] text-sm font-medium justify-center py-2">
                    <CheckCircle className="w-4 h-4" /> All up to date
                  </div>
                )}
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* ── USERS TAB ────────────────────────────────────── */}
        {tab === 'Users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold">User Accounts</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:w-64">
                    <SearchBar
                      value={userSearch}
                      onChange={setUserSearch}
                      placeholder="Search users..."
                    />
                  </div>
                  <button onClick={fetchUsers} className="p-2 rounded-lg hover:bg-[#F5F5F7] shrink-0">
                    <RefreshCw className="w-4 h-4 text-[#86868B]" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {['all', 'patient', 'doctor', 'admin'].map(r => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                      userRoleFilter === r ? 'bg-[#1D1D1F] text-white' : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F]'
                    }`}>
                    {r === 'all' ? 'All' : r + 's'}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#D2D2D7]/50 text-[#86868B]">
                    <tr>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Joined</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[#86868B]">No users found.</td>
                      </tr>
                    )}
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-[#D2D2D7]/30 last:border-0 hover:bg-[#F5F5F7]/50 transition-colors">
                        <td className="py-4">
                          <p className="font-medium text-[#1D1D1F]">{u.name}</p>
                          <p className="text-xs text-[#86868B]">{u.email}</p>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-[#F5F5F7] rounded-md text-xs font-medium capitalize">{u.role}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.isActive !== false ? 'bg-[#30D158]/10 text-[#30D158]' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                          }`}>
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 text-[#86868B] text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleUserStatus(u._id, u.isActive !== false)}
                              title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.isActive !== false
                                  ? 'text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10'
                                  : 'text-[#86868B] hover:text-[#30D158] hover:bg-[#30D158]/10'
                              }`}>
                              {u.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => deleteUser(u._id)}
                                title="Delete"
                                className="p-1.5 rounded-lg text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ── VERIFICATION TAB ─────────────────────────────── */}
        {tab === 'Verification' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">Doctor Verification Queue</h3>
                <p className="text-sm text-[#86868B]">Review and approve doctor registrations</p>
              </div>
              <button onClick={fetchPending} className="p-2 rounded-lg hover:bg-white border border-[#D2D2D7]/50 transition-colors">
                <RefreshCw className="w-4 h-4 text-[#86868B]" />
              </button>
            </div>

            {pendingDoctors.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-[#30D158] mx-auto mb-3" />
                <p className="font-semibold text-[#1D1D1F] mb-1">All clear!</p>
                <p className="text-sm text-[#86868B]">No pending doctor verifications.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingDoctors.map(doc => (
                  <GlassCard key={doc._id} className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] font-bold text-lg">
                        {doc.name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1D1D1F]">{doc.name || 'Unknown'}</p>
                        <p className="text-xs text-[#86868B]">{doc.specialization || 'No specialization'}</p>
                      </div>
                    </div>
                    <div className="space-y-1 mb-4">
                      {doc.email && <p className="text-xs text-[#86868B]">✉ {doc.email}</p>}
                      <p className="text-xs text-[#86868B]">
                        📅 Submitted: {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                      <p className="text-xs text-[#FF9F0A] font-medium">⏳ Awaiting verification</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(doc._id, 'approve')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#30D158] hover:bg-[#28B44C] text-white text-sm font-semibold rounded-xl transition-colors">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(doc._id, 'reject')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FF3B30] hover:bg-[#E03428] text-white text-sm font-semibold rounded-xl transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TRANSACTIONS TAB ─────────────────────────────── */}
        {tab === 'Transactions' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Financial Transactions</h3>
                  <p className="text-sm text-[#86868B]">Approved consultation fees</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#86868B]">Total Revenue</p>
                    <p className="text-xl font-bold text-[#1D1D1F]">Rs. {totalRevenue.toLocaleString()}</p>
                  </div>
                  <button onClick={fetchTransactions} className="p-2 rounded-lg hover:bg-[#F5F5F7]">
                    <RefreshCw className="w-4 h-4 text-[#86868B]" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#D2D2D7]/50 text-[#86868B]">
                    <tr>
                      <th className="pb-3 font-medium">Patient</th>
                      <th className="pb-3 font-medium">Doctor</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium text-right">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[#86868B]">
                          No approved consultations yet.
                        </td>
                      </tr>
                    )}
                    {transactions.map(t => (
                      <tr key={t.id} className="border-b border-[#D2D2D7]/30 last:border-0 hover:bg-[#F5F5F7]/50 transition-colors">
                        <td className="py-4 font-medium text-[#1D1D1F]">{t.patientName}</td>
                        <td className="py-4">
                          <p className="text-[#1D1D1F]">{t.doctorName}</p>
                          <p className="text-xs text-[#86868B]">{t.specialization}</p>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-[#F5F5F7] rounded-md text-xs font-medium capitalize">{t.consultType}</span>
                        </td>
                        <td className="py-4 text-[#86868B]">{t.date}</td>
                        <td className="py-4 text-right font-semibold text-[#30D158]">
                          Rs. {(t.fee || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

      </main>
    </div>
  );
}
