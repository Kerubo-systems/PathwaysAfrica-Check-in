import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, KeyRound, Mail, Calendar, Trash2, Eye, ArrowRight, RefreshCw, ChevronLeft, ChevronRight, Search, Heart, Sliders, Filter, CheckCircle, Info, UserPlus, Layers, Power, PowerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CohortInsightsView from './CohortInsightsView';

interface SubmissionsResponse {
  submissions: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function AdminView({ 
  showToast,
  isLoggedIn,
  setIsLoggedIn,
  adminUser,
  setAdminUser
}: { 
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  adminUser: any;
  setAdminUser: (val: any) => void;
}) {
  // Navigation Tab State inside Authenticated Dashboard
  const [adminTab, setAdminTab] = useState<'submissions' | 'insights' | 'admins'>('submissions');

  // Dynamic App Configurations
  const [availableCohorts, setAvailableCohorts] = useState<string[]>(['Cohort 1', 'Cohort 2', 'Cohort 3', 'Other']);
  const [availableModules, setAvailableModules] = useState<string[]>(['Module 1', 'Module 2', 'Module 3', 'Other']);

  const [selectedCohortTab, setSelectedCohortTab] = useState<string>('all');

  // Dashboard Data State
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsData, setSubmissionsData] = useState<SubmissionsResponse | null>(null);
  
  // Filters and Query Params state
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [search, setSearch] = useState('');
  const [feeling, setFeeling] = useState('All');
  const [identify, setIdentify] = useState('All'); // 'All' | 'Identified' | 'Anonymous'
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Modal / Detail state
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Stats aggregate
  const [summaryStats, setSummaryStats] = useState<any | null>(null);

  // Password changing state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Administrators Management state
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'General Administrator' | 'Cohort Administrator'>('Cohort Administrator');
  const [newAdminCohortAccess, setNewAdminCohortAccess] = useState<string>('Cohort 1');
  const [addingAdmin, setAddingAdmin] = useState(false);

  // Dynamic config fields state
  const [newCohortName, setNewCohortName] = useState('');
  const [newModuleName, setNewModuleName] = useState('');

  // Confirmation state variables to replace standard alert/prompt/confirm inside iframes
  const [showClearCohortConfirm, setShowClearCohortConfirm] = useState(false);
  const [showWipeDbConfirm, setShowWipeDbConfirm] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');

  // Fetch dynamic app config
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const d = await res.json();
      if (d.success) {
        setAvailableCohorts(d.data.cohorts);
        setAvailableModules(d.data.modules);
        if (d.data.cohorts.length > 0 && !d.data.cohorts.includes(newAdminCohortAccess)) {
          setNewAdminCohortAccess(d.data.cohorts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load configuration.', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Helper to retrieve auth header
  const getAuthHeaders = (additionalHeaders = {}) => {
    const token = localStorage.getItem('pathways_admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      ...additionalHeaders
    };
  };

  // Sync cohort access
  useEffect(() => {
    if (adminUser && adminUser.cohortAccess && adminUser.cohortAccess !== 'all') {
      setSelectedCohortTab(adminUser.cohortAccess);
    } else {
      setSelectedCohortTab('all');
    }
  }, [adminUser]);

  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminUser(null);
    try {
      localStorage.removeItem('pathways_admin_logged');
      localStorage.removeItem('pathways_admin_token');
      localStorage.removeItem('pathways_admin_user');
      localStorage.removeItem('pathways_admin_login_time');
    } catch (_) {}
    showToast('Admin logged out successfully 🔒', 'info');
  };

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    if (!isLoggedIn) return;
    setLoadingSubmissions(true);
    try {
      // Build query string
      let query = `?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (feeling !== 'All') query += `&feeling=${feeling}`;
      if (identify === 'Identified') query += `&identify=true`;
      if (identify === 'Anonymous') query += `&identify=false`;
      
      // Enforce cohort filtering logic
      const cohortFilter = (adminUser && adminUser.cohortAccess !== 'all') ? adminUser.cohortAccess : selectedCohortTab;
      if (cohortFilter !== 'all') {
        query += `&cohort=${encodeURIComponent(cohortFilter)}`;
      }

      const res = await fetch(`/api/dashboard/submissions${query}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        setSubmissionsData(data.data);
      }
    } catch (err) {
      console.error('Error fetching submissions', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Fetch summary statistics
  const fetchSummaryStats = async () => {
    if (!isLoggedIn) return;
    try {
      const cohortFilter = (adminUser && adminUser.cohortAccess !== 'all') ? adminUser.cohortAccess : selectedCohortTab;
      const query = cohortFilter !== 'all' ? `?cohort=${encodeURIComponent(cohortFilter)}` : '';
      const res = await fetch(`/api/dashboard/summary${query}`, {
        headers: getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        setSummaryStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching summary stats', err);
    }
  };

  // Fetch administrator list
  const fetchAdmins = async () => {
    if (!isLoggedIn || adminUser?.role !== 'General Administrator') return;
    setLoadingAdmins(true);
    try {
      const res = await fetch('/api/admin/list', {
        headers: getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (data.success) {
        setAdminsList(data.admins || []);
      }
    } catch (e) {
      console.error('Error fetching administrators', e);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Add a new administrator
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      showToast('Please fill in all details.', 'warning');
      return;
    }
    setAddingAdmin(true);
    try {
      const res = await fetch('/api/admin/add', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          role: newAdminRole,
          cohortAccess: newAdminRole === 'General Administrator' ? 'all' : newAdminCohortAccess
        })
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('Administrator profile added successfully! 🎉', 'success');
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchAdmins();
      } else {
        showToast(data.message || 'Could not add administrator.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection to the server failed.', 'warning');
    } finally {
      setAddingAdmin(false);
    }
  };

  // Toggle administrator disabled status
  const handleToggleAdminStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/toggle-status/${id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Admin status updated!', 'success');
        fetchAdmins();
      } else {
        showToast(data.message || 'Could not update status.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to the server.', 'warning');
    }
  };

  // Delete an administrator
  const handleDeleteAdmin = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to remove this administrator? They will lose access instantly.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('Administrator removed successfully! 🔒', 'success');
        fetchAdmins();
      } else {
        showToast(data.message || 'Could not remove administrator.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection to the server failed.', 'warning');
    }
  };

  // Change password handler
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('Please fill in both old and new passwords.', 'warning');
      return;
    }
    setChangingPassword(true);
    setPasswordChangeSuccess('');
    setPasswordChangeError('');
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('Password changed successfully! Key updated. 🔐', 'success');
        setOldPassword('');
        setNewPassword('');
        setPasswordChangeSuccess('Password changed successfully!');
      } else {
        setPasswordChangeError(data.message || 'Failed to change password.');
        showToast(data.message || 'Failed to change password.', 'warning');
      }
    } catch (err) {
      console.error(err);
      setPasswordChangeError('Could not reach server to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Delete submission handler
  const handleDeleteSubmission = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this check-in? It will be soft-deleted and removed from all dashboards.')) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/checkins/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        showToast('Check-in record deleted successfully 🗑️', 'success');
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
        // Refresh data
        fetchSubmissions();
        fetchSummaryStats();
      } else {
        showToast('Failed to delete submission.', 'warning');
      }
    } catch (err) {
      console.error('Error deleting submission', err);
      showToast('Could not reach backend to delete record.', 'warning');
    } finally {
      setDeletingId(null);
    }
  };

  // Clear Cohort Check-ins handler
  const handleClearCohortData = () => {
    const cohortToClear = adminUser?.role === 'Cohort Administrator' 
      ? adminUser.cohortAccess 
      : selectedCohortTab;

    if (!cohortToClear || cohortToClear === 'all') {
      showToast('Please select a specific cohort to clear.', 'warning');
      return;
    }
    setShowClearCohortConfirm(true);
  };

  // Execution for Clear Cohort (called by custom Modal)
  const executeClearCohortData = async () => {
    const cohortToClear = adminUser?.role === 'Cohort Administrator' 
      ? adminUser.cohortAccess 
      : selectedCohortTab;

    if (!cohortToClear || cohortToClear === 'all') return;

    try {
      const res = await fetch('/api/admin/clear-cohort', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ cohort: cohortToClear })
      });

      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        showToast(`Cohort "${cohortToClear}" responses successfully cleared 🗑️`, 'success');
        fetchSubmissions();
        fetchSummaryStats();
      } else {
        showToast(data.message || 'Failed to clear cohort responses.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not reach backend to clear cohort responses.', 'warning');
    } finally {
      setShowClearCohortConfirm(false);
    }
  };

  // Wipe entire database handler
  const handleWipeDatabase = () => {
    setWipeConfirmInput('');
    setShowWipeDbConfirm(true);
  };

  // Execution for Wipe Database (called by custom Modal)
  const executeWipeDatabase = async () => {
    if (wipeConfirmInput !== 'WIPE') {
      showToast('To confirm, please type "WIPE" in the confirmation box.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/admin/wipe-database', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        showToast('Your session could not be authenticated. Redirecting to login...', 'warning');
        handleLogout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        showToast('The entire check-ins database has been successfully wiped 🌪️', 'success');
        fetchSubmissions();
        fetchSummaryStats();
      } else {
        showToast(data.message || 'Failed to wipe database.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not reach backend to wipe database.', 'warning');
    } finally {
      setShowWipeDbConfirm(false);
      setWipeConfirmInput('');
    }
  };

  // Add Dynamic Cohort
  const handleAddCohort = async () => {
    if (!newCohortName.trim()) return;
    try {
      const res = await fetch('/api/config/cohorts', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: newCohortName.trim() })
      });
      const d = await res.json();
      if (d.success) {
        showToast('Cohort added successfully! 👥', 'success');
        setNewCohortName('');
        fetchConfig();
      } else {
        showToast(d.message || 'Could not add cohort.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error.', 'warning');
    }
  };

  // Delete Dynamic Cohort
  const handleDeleteCohort = async (cohort: string) => {
    if (!window.confirm(`Are you sure you want to delete "${cohort}"? This doesn't delete students records, but removes it from dropdown options.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/config/cohorts/${encodeURIComponent(cohort)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const d = await res.json();
      if (d.success) {
        showToast('Cohort removed successfully.', 'success');
        fetchConfig();
      } else {
        showToast(d.message || 'Could not remove cohort.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error.', 'warning');
    }
  };

  // Add Dynamic Module
  const handleAddModule = async () => {
    if (!newModuleName.trim()) return;
    try {
      const res = await fetch('/api/config/modules', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name: newModuleName.trim() })
      });
      const d = await res.json();
      if (d.success) {
        showToast('Module added successfully! 📘', 'success');
        setNewModuleName('');
        fetchConfig();
      } else {
        showToast(d.message || 'Could not add module.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error.', 'warning');
    }
  };

  // Delete Dynamic Module
  const handleDeleteModule = async (moduleName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${moduleName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/config/modules/${encodeURIComponent(moduleName)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const d = await res.json();
      if (d.success) {
        showToast('Module removed successfully.', 'success');
        fetchConfig();
      } else {
        showToast(d.message || 'Could not remove module.', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error.', 'warning');
    }
  };

  // Trigger refetches when parameters update
  useEffect(() => {
    fetchSubmissions();
  }, [isLoggedIn, page, feeling, identify, sortBy, order, selectedCohortTab]);

  // Debounced/delayed search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isLoggedIn) {
        setPage(1); // Reset to page 1 on search
        fetchSubmissions();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Fetch initial stats & list once logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSummaryStats();
      if (adminTab === 'admins') {
        fetchAdmins();
      }
    }
  }, [isLoggedIn, adminTab, selectedCohortTab]);

  // Toggle confidence sorting convenience
  const toggleConfidenceSort = () => {
    setPage(1);
    setSortBy('confidence');
    setOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Toggle date sorting convenience
  const toggleDateSort = () => {
    setPage(1);
    setSortBy('createdAt');
    setOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getFeelingBadge = (f: string) => {
    const badges: Record<string, string> = {
      'Excited': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50',
      'Motivated': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/50',
      'Okay': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/50',
      'Overwhelmed': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-950/20',
      'Burnt Out': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
    };
    const emojis: Record<string, string> = {
      'Excited': '😁 Excited', 'Motivated': '🙂 Motivated', 'Okay': '😐 Okay', 'Overwhelmed': '😕 Overwhelmed', 'Burnt Out': '😣 Burnt Out'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badges[f] || 'bg-slate-50 border-slate-200'}`}>
        {emojis[f] || f}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="admin-authenticated-dashboard">
      
      {/* Top Banner Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sleek-accent bg-sleek-accent-light px-2 py-0.5 rounded-md uppercase">
            <Shield className="w-3 h-3" /> System Admin Panel
          </span>
          <h1 className="font-display text-3xl text-sleek-charcoal dark:text-slate-50 tracking-tight leading-none mt-1">
            Student Support Dashboard
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchSubmissions(); fetchSummaryStats(); if(adminTab === 'admins') fetchAdmins(); }}
            className="p-2.5 rounded-full border border-slate-200/60 dark:border-slate-800 text-sleek-muted dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50/50 border border-rose-200/30 cursor-pointer transition-colors"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Cohort Access Level Scope Selector */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-[#34d399]">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Current Access Scope</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {adminUser?.cohortAccess === 'all' ? '🏆 All Cohorts (General Coordinator)' : `👥 Specific Cohort Access: ${adminUser?.cohortAccess}`}
            </span>
          </div>
        </div>

        {adminUser?.cohortAccess === 'all' ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
              {[
                { id: 'all', label: '🌍 General Overview' },
                ...availableCohorts.map(c => ({ id: c, label: c }))
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setPage(1);
                    setSelectedCohortTab(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedCohortTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {selectedCohortTab !== 'all' && (
              <button
                onClick={handleClearCohortData}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/30 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
                title={`Clear all responses for ${selectedCohortTab}`}
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Cohort
              </button>
            )}

            <button
              onClick={handleWipeDatabase}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/30 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              title="Wipe entire database to start the year afresh"
            >
              <Trash2 className="w-3.5 h-3.5" /> Wipe Database
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/30 text-[11px] text-amber-700 dark:text-amber-400 font-semibold shadow-sm">
              <span>🔒 Locked to {adminUser?.cohortAccess} responses by system security rules</span>
            </div>
            <button
              onClick={handleClearCohortData}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/30 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              title="Clear all responses of your cohort to start with a new team"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Cohort Responses
            </button>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs inside Admin Portal */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px mb-8 gap-6 overflow-x-auto">
        <button
          onClick={() => setAdminTab('submissions')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
            adminTab === 'submissions'
              ? 'border-sleek-accent text-sleek-accent dark:border-slate-300 dark:text-slate-200'
              : 'border-transparent text-sleek-muted hover:text-sleek-charcoal dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          id="admin-tab-submissions"
        >
          📝 Submissions Feed
        </button>
        <button
          onClick={() => setAdminTab('insights')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
            adminTab === 'insights'
              ? 'border-sleek-accent text-sleek-accent dark:border-slate-300 dark:text-slate-200'
              : 'border-transparent text-sleek-muted hover:text-sleek-charcoal dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          id="admin-tab-insights"
        >
          📊 Cohort Insights & Analytics
        </button>
        {adminUser?.role === 'General Administrator' && (
          <button
            onClick={() => setAdminTab('admins')}
            className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
              adminTab === 'admins'
                ? 'border-sleek-accent text-sleek-accent dark:border-slate-300 dark:text-slate-200'
                : 'border-transparent text-sleek-muted hover:text-sleek-charcoal dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            id="admin-tab-admins"
          >
            👥 Manage Platform & Admins
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {adminTab === 'submissions' && (
          <motion.div
            key="submissions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
          {/* Grid of Key Submissions Stats */}
          {summaryStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8" id="admin-mini-stats-grid">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                <span className="block text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Submissions</span>
                <span className="block font-sans text-xl font-extrabold text-sleek-charcoal dark:text-slate-100">{summaryStats.totalCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                <span className="block text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Avg. Confidence</span>
                <span className="block font-sans text-xl font-extrabold text-sleek-charcoal dark:text-slate-100">{summaryStats.averageConfidence} / 10</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                <span className="block text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Identified Mentees</span>
                <span className="block font-sans text-xl font-extrabold text-sleek-charcoal dark:text-slate-100">{summaryStats.identifiedCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
                <span className="block text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Anonymous Rate</span>
                <span className="block font-sans text-xl font-extrabold text-sleek-charcoal dark:text-slate-100">{summaryStats.anonymousPercentage}%</span>
              </div>
            </div>
          )}

          {/* Filtering Controls Row */}
          <div className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <Filter className="w-4 h-4 text-sleek-accent" />
              <h3 className="text-xs font-bold text-sleek-charcoal dark:text-slate-200 uppercase tracking-wider">Filter & Query Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Text Search */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-sleek-muted dark:text-slate-400 uppercase tracking-wider block">Keyword Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, wins, feedback..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-xs focus:border-[#0B6A3E] outline-none"
                  />
                </div>
              </div>

              {/* Feelings filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-sleek-muted dark:text-slate-400 uppercase tracking-wider block">Feeling State</label>
                <select
                  value={feeling}
                  onChange={(e) => { setPage(1); setFeeling(e.target.value); }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:border-[#0B6A3E] outline-none cursor-pointer"
                >
                  <option value="All">All Feelings</option>
                  <option value="Excited">😁 Excited</option>
                  <option value="Motivated">🙂 Motivated</option>
                  <option value="Okay">😐 Okay</option>
                  <option value="Overwhelmed">😕 Overwhelmed</option>
                  <option value="Burnt Out">😣 Burnt Out</option>
                </select>
              </div>

              {/* Identity Choices filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-sleek-muted dark:text-slate-400 uppercase tracking-wider block">Anonymity Mode</label>
                <select
                  value={identify}
                  onChange={(e) => { setPage(1); setIdentify(e.target.value); }}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-xs focus:border-[#0B6A3E] outline-none cursor-pointer"
                >
                  <option value="All">All submissions</option>
                  <option value="Identified">🤝 Identified Mentees</option>
                  <option value="Anonymous">👤 Anonymous Only</option>
                </select>
              </div>

              {/* Reset All Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPage(1);
                    setSearch('');
                    setFeeling('All');
                    setIdentify('All');
                    setSortBy('createdAt');
                    setOrder('desc');
                    showToast('Queries reset to defaults 🛡️', 'info');
                  }}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sleek-charcoal dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Reset Filtering Queries
                </button>
              </div>
            </div>
          </div>

          {/* Submissions Feed List Table Container */}
          <div className="relative" id="admin-submissions-table-area">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0B6A3E]/10 to-teal-600/10 dark:from-[#10b981]/5 dark:to-teal-500/5 rounded-[32px] blur opacity-30" />
            
            <div className="relative wellness-card rounded-[32px] border border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90 backdrop-blur shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl text-sleek-charcoal dark:text-slate-50">
                    Mentee Submissions Log
                  </h2>
                  <p className="text-[11px] text-sleek-muted dark:text-slate-400">
                    Weekly wins, confidence values, mental wellness states, and contact queries.
                  </p>
                </div>
                
                {loadingSubmissions && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/50 rounded-full animate-pulse">
                    <RefreshCw className="w-3 h-3 text-sleek-accent dark:text-[#34d399] animate-spin" />
                    <span className="text-[10px] font-semibold text-sleek-accent dark:text-[#34d399]">Refreshing Feed...</span>
                  </div>
                )}
              </div>

              {/* Feed table element */}
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-950/50">
                      <tr>
                        <th className="py-3 px-5 text-left text-[10px] font-bold text-sleek-muted dark:text-slate-400 uppercase tracking-wider">Mentee Name</th>
                        <th className="py-3 px-5 text-left text-[10px] font-bold text-sleek-muted dark:text-slate-400 uppercase tracking-wider">Group & Module</th>
                        <th className="py-3 px-5 text-left text-[10px] font-bold text-sleek-muted dark:text-slate-400 uppercase tracking-wider">Feeling State</th>
                        <th 
                          className="py-3 px-5 text-left text-[10px] font-bold text-sleek-muted dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 select-none transition-colors"
                          onClick={toggleConfidenceSort}
                        >
                          <span className="flex items-center gap-1">
                            Confidence Level
                            {sortBy === 'confidence' && (order === 'desc' ? '▼' : '▲')}
                          </span>
                        </th>
                        <th className="py-3 px-5 text-left text-[10px] font-bold text-sleek-muted dark:text-slate-400 uppercase tracking-wider">Weekly Win Preview</th>
                        <th 
                          className="py-3 px-5 text-left text-[10px] font-bold text-sleek-muted dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 select-none transition-colors"
                          onClick={toggleDateSort}
                        >
                          <span className="flex items-center gap-1">
                            Submitted On
                            {sortBy === 'createdAt' && (order === 'desc' ? '▼' : '▲')}
                          </span>
                        </th>
                        <th className="py-3 px-5 text-right text-[10px] font-bold text-sleek-muted dark:text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {!submissionsData || submissionsData.submissions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-xs text-slate-400">
                            <Sliders className="w-10 h-10 opacity-30 mx-auto mb-2" />
                            No submissions found matching selected filters. Try broadening queries.
                          </td>
                        </tr>
                      ) : (
                        submissionsData.submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all duration-150">
                            {/* Name */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${sub.identify ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                <span className="text-xs font-bold text-sleek-charcoal dark:text-slate-200">
                                  {sub.identify ? sub.name : 'Anonymous Student'}
                                </span>
                              </div>
                            </td>

                            {/* Group & Module */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                                {sub.cohort} • {sub.module}
                              </span>
                            </td>

                            {/* Feeling */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              {getFeelingBadge(sub.feeling)}
                            </td>

                            {/* Confidence */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-sleek-charcoal dark:text-slate-200">{sub.confidence} / 10</span>
                                <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${sub.confidence >= 8 ? 'bg-emerald-500' : sub.confidence >= 5 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                    style={{ width: `${sub.confidence * 10}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Win */}
                            <td className="py-4 px-5 max-w-xs">
                              <span className="block text-xs text-sleek-muted dark:text-slate-300 truncate font-medium">
                                {sub.weeklyWin}
                              </span>
                            </td>

                            {/* Created At */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <span className="text-[11px] text-slate-400 font-mono">
                                {new Date(sub.createdAt).toLocaleDateString()}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedSubmission(sub)}
                                  className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-sleek-accent hover:bg-slate-50 cursor-pointer transition-colors"
                                  title="Inspect entry"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubmission(sub.id)}
                                  disabled={deletingId === sub.id}
                                  className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 cursor-pointer transition-colors"
                                  title="Delete record"
                                >
                                  {deletingId === sub.id ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {submissionsData && submissionsData.pagination.pages > 1 && (
                <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200/60 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, submissionsData.pagination.total)} of {submissionsData.pagination.total} records
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 px-2">
                      Page {page} of {submissionsData.pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(p + 1, submissionsData.pagination.pages))}
                      disabled={page === submissionsData.pagination.pages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {adminTab === 'insights' && (
        <motion.div
          key="insights"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="wellness-card rounded-[32px] p-2 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden"
        >
          <CohortInsightsView cohort={(adminUser && adminUser.cohortAccess !== 'all') ? adminUser.cohortAccess : selectedCohortTab as any} />
        </motion.div>
      )}

      {adminTab === 'admins' && adminUser?.role === 'General Administrator' && (
        <motion.div
          key="admins"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          
          {/* Left Column: Add Admin & Settings Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="wellness-card rounded-[24px] p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 space-y-6">
              
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-sleek-accent" />
                  Register New Administrator / Coordinator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You can register multiple Cohort Administrators per cohort and multiple General Coordinators respectively to help manage the portal.
                </p>
              </div>

              <form onSubmit={handleAddAdminSubmit} className="space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 text-xs focus:border-sleek-accent outline-none font-medium"
                  />
                </div>

                {/* Email / Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">Admin Email Address / Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe@example.com or johnd"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 text-xs focus:border-sleek-accent outline-none font-medium"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">Access Password</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. loremipsum123"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 text-xs focus:border-sleek-accent outline-none font-mono"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">Administrator Role</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 text-xs focus:border-sleek-accent outline-none font-medium cursor-pointer"
                  >
                    <option value="Cohort Administrator">Cohort Administrator (Assigned Cohort)</option>
                    <option value="General Administrator">General Coordinator / Administrator (All Cohorts)</option>
                  </select>
                </div>

                {/* Cohort Access Level */}
                {newAdminRole === 'Cohort Administrator' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">Assigned Cohort Access</label>
                    <select
                      value={newAdminCohortAccess}
                      onChange={(e) => setNewAdminCohortAccess(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 text-xs focus:border-sleek-accent outline-none font-medium cursor-pointer"
                    >
                      {availableCohorts.map(cohort => (
                        <option key={cohort} value={cohort}>{cohort}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addingAdmin}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sleek-accent rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#0B6A3E]/10"
                >
                  {addingAdmin ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Save Administrator Profile
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Password Changing Form */}
            <div className="wellness-card rounded-[24px] p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 space-y-5 mt-6">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-sleek-charcoal dark:text-slate-100 flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-sleek-accent animate-pulse" />
                  Update Access Password
                </h3>
                <p className="text-[11px] text-sleek-muted dark:text-slate-400">
                  Update your personal login password. Keep your credentials secure.
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                {passwordChangeSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-[#34d399] text-[11px] font-medium text-center border border-emerald-200/30">
                    ✅ {passwordChangeSuccess}
                  </div>
                )}
                {passwordChangeError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 text-[11px] font-medium text-center border border-rose-200/30">
                    ⚠️ {passwordChangeError}
                  </div>
                )}

                {/* Current password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-sleek-charcoal dark:text-slate-300">Current Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 text-xs focus:border-sleek-accent outline-none font-mono"
                  />
                </div>

                {/* New password */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-sleek-charcoal dark:text-slate-300">New Secure Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 text-xs focus:border-sleek-accent outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-700 dark:bg-slate-850 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {changingPassword ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Update Account Password'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Admins List & Program Config (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Administrators list wellness card */}
            <div className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-4">
              <div>
                <h3 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
                  Active Administrators List
                </h3>
                <p className="text-xs text-sleek-muted dark:text-slate-400">
                  Below are current secondary administrators with system credentials. The primary admin account is always active.
                </p>
              </div>

              {loadingAdmins ? (
                <div className="py-8 text-center text-xs text-sleek-muted italic">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-sleek-accent mb-2" />
                  Loading admins profiles...
                </div>
              ) : adminsList.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Shield className="w-8 h-8 opacity-40 mb-2" />
                  <span className="text-xs font-bold text-slate-500">No Custom Administrators Registered</span>
                  <span className="text-[10px] mt-1 text-slate-400">Use the form on the left to authorize custom mentor logins.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminsList.map((adm) => (
                    <div
                      key={adm.id}
                      className={`p-4 rounded-xl border transition-all ${
                        adm.isDisabled 
                          ? 'bg-slate-100/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-900 opacity-60' 
                          : 'border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40'
                      } flex items-center justify-between gap-4`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sleek-charcoal dark:text-slate-200">
                            👤 {adm.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                            adm.role === 'General Administrator' 
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' 
                              : 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                          }`}>
                            {adm.role}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          Username: <strong className="text-slate-600 dark:text-slate-300">{adm.email}</strong> • Access: <strong className="text-sleek-accent dark:text-[#34d399]">{adm.cohortAccess === 'all' ? '🌍 All Cohorts' : adm.cohortAccess}</strong>
                        </span>
                        {adm.isDisabled && (
                          <span className="inline-block text-[9px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.2 rounded mt-1">
                            DISABLED (No Access)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle Active Status */}
                        {adm.email.toLowerCase() !== 'kierafanning' && (
                          <button
                            onClick={() => handleToggleAdminStatus(adm.id)}
                            className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                              adm.isDisabled 
                                ? 'text-emerald-600 hover:bg-emerald-50 border-emerald-100' 
                                : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 border-transparent hover:border-amber-100'
                            }`}
                            title={adm.isDisabled ? "Enable Administrator Account" : "Disable Administrator Account"}
                          >
                            {adm.isDisabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                          </button>
                        )}

                        {/* Delete account */}
                        {adm.email.toLowerCase() !== 'kierafanning' && (
                          <button
                            onClick={() => handleDeleteAdmin(adm.id)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50/80 border border-transparent hover:border-rose-100 cursor-pointer transition-colors"
                            title="Remove Administrator Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Configuration Panel for Cohorts & Modules */}
            <div className="wellness-card rounded-[24px] p-6 border border-slate-200/60 dark:border-slate-800/80 space-y-6">
              <div>
                <h3 className="font-display font-bold text-lg text-sleek-charcoal dark:text-slate-100">
                  Academic Configuration Console
                </h3>
                <p className="text-xs text-sleek-muted dark:text-slate-400">
                  Easily register or decommission cohorts and modules. This future-proofs the portal so any additions instantly cascade to student drop-down selections and administrative filters without writing code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Cohorts panel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-xs font-bold text-sleek-accent dark:text-[#34d399] uppercase tracking-wider">Active Cohorts</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Count: {availableCohorts.length}</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Cohort 4"
                      value={newCohortName}
                      onChange={(e) => setNewCohortName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddCohort(); }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:border-sleek-accent outline-none font-medium"
                    />
                    <button
                      onClick={handleAddCohort}
                      className="px-3.5 py-1.5 bg-sleek-accent hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {availableCohorts.map((cohort) => (
                      <div 
                        key={cohort} 
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850"
                      >
                        <span className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">{cohort}</span>
                        {cohort !== 'Other' && (
                          <button
                            onClick={() => handleDeleteCohort(cohort)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                            title={`Delete cohort ${cohort}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modules panel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-xs font-bold text-sleek-accent dark:text-[#34d399] uppercase tracking-wider">Active Modules</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">Count: {availableModules.length}</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Module 4"
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddModule(); }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:border-sleek-accent outline-none font-medium"
                    />
                    <button
                      onClick={handleAddModule}
                      className="px-3.5 py-1.5 bg-sleek-accent hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {availableModules.map((mod) => (
                      <div 
                        key={mod} 
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850"
                      >
                        <span className="text-xs font-semibold text-sleek-charcoal dark:text-slate-300">{mod}</span>
                        {mod !== 'Other' && (
                          <button
                            onClick={() => handleDeleteModule(mod)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                            title={`Delete module ${mod}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Detail Inspector Drawer Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-end" id="submission-inspector-overlay">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-float-delayed relative border-l border-slate-100 dark:border-slate-800">
            <div className="space-y-6">
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="block text-[10px] font-mono font-bold text-sleek-accent bg-sleek-accent-light px-2 py-0.5 rounded uppercase">
                    Check-in Record Inspector
                  </span>
                  <h3 className="font-display text-2xl text-sleek-charcoal dark:text-slate-55 mt-1">
                    {selectedSubmission.identify ? `🤝 ${selectedSubmission.name}` : '👤 Anonymous Student'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-2 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Inspector Content */}
              <div className="space-y-5 text-sm">
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Timestamp</span>
                    <span className="text-xs text-sleek-charcoal dark:text-slate-200 font-medium">
                      {new Date(selectedSubmission.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Contact Address</span>
                    <span className="text-xs text-sleek-charcoal dark:text-slate-200 font-medium">
                      {selectedSubmission.identify && selectedSubmission.email ? selectedSubmission.email : 'None provided'}
                    </span>
                  </div>
                </div>

                {/* Group Meta details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Cohort</span>
                    <span className="text-xs text-sleek-charcoal dark:text-slate-200 font-medium font-mono">
                      {selectedSubmission.cohort}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase">Module</span>
                    <span className="text-xs text-sleek-charcoal dark:text-slate-200 font-medium font-mono">
                      {selectedSubmission.module}
                    </span>
                  </div>
                </div>

                {/* Feeling details */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase">Emotion / Mental Wellness State</span>
                  <div className="flex items-center gap-3">
                    {getFeelingBadge(selectedSubmission.feeling)}
                    <span className="px-2.5 py-1 rounded-full border border-sleek-border/30 bg-sleek-accent-light text-xs font-bold text-sleek-accent">
                      Confidence Level: {selectedSubmission.confidence} / 10
                    </span>
                  </div>
                  {selectedSubmission.feelingDetail && (
                    <blockquote className="p-3 rounded-xl border-l-4 border-sleek-accent bg-slate-50 dark:bg-slate-950/50 text-xs italic text-sleek-muted dark:text-slate-300">
                      "{selectedSubmission.feelingDetail}"
                    </blockquote>
                  )}
                </div>

                {/* Stress Areas */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase">Stress areas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubmission.stressAreas.map((area: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-sleek-charcoal dark:text-slate-300">
                        {area}
                      </span>
                    ))}
                    {selectedSubmission.otherStressArea && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                        ✏️ {selectedSubmission.otherStressArea}
                      </span>
                    )}
                  </div>
                </div>

                {/* Support requests */}
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase">Support requests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubmission.supportNeeds.map((need: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-sleek-accent-light text-xs font-bold text-sleek-accent">
                        {need}
                      </span>
                    ))}
                    {selectedSubmission.otherSupportNeed && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
                        ✏️ {selectedSubmission.otherSupportNeed}
                      </span>
                    )}
                  </div>
                </div>

                {/* Weekly win */}
                <div className="space-y-1 bg-sleek-peach/20 dark:bg-slate-950 p-4 rounded-2xl border border-sleek-border/10">
                  <span className="block text-[11px] font-mono font-bold text-sleek-accent uppercase">🎉 Weekly Win Celebration</span>
                  <p className="text-xs sm:text-sm font-semibold text-sleek-charcoal dark:text-slate-200">
                    {selectedSubmission.weeklyWin}
                  </p>
                </div>

                {/* About yourself */}
                {selectedSubmission.aboutYourself && (
                  <div className="space-y-1">
                    <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase">Hobbies & Beyond Academics</span>
                    <p className="text-xs text-sleek-muted dark:text-slate-300 leading-relaxed">
                      {selectedSubmission.aboutYourself}
                    </p>
                  </div>
                )}

                {/* Mindshare */}
                {selectedSubmission.mindShare && (
                  <div className="space-y-1">
                    <span className="block text-[11px] font-mono font-bold text-slate-400 uppercase">Student Advice / Feedback</span>
                    <p className="text-xs text-sleek-muted dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl italic">
                      "{selectedSubmission.mindShare}"
                    </p>
                  </div>
                )}

              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-6">
              <button
                onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-100 hover:border-rose-200 text-rose-500 hover:bg-rose-50/50 text-xs font-bold cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" /> Soft Delete Check-in
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sleek-charcoal dark:text-slate-200 text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cohort Confirmation Modal */}
      <AnimatePresence>
        {showClearCohortConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="clear-cohort-confirm-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
              onClick={() => setShowClearCohortConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10"
            >
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-50">
                  Clear Cohort Responses
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                Are you absolutely sure you want to clear all check-in responses for{' '}
                <strong className="text-slate-900 dark:text-white">
                  "{adminUser?.role === 'Cohort Administrator' ? adminUser.cohortAccess : selectedCohortTab}"
                </strong>
                ? This action will hide all entries for this cohort from your active dashboards.
              </p>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClearCohortConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeClearCohortData}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-all shadow-sm"
                >
                  Clear Responses
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wipe Database Confirmation Modal */}
      <AnimatePresence>
        {showWipeDbConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="wipe-database-confirm-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setShowWipeDbConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10"
            >
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                  <Trash2 className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-50">
                  Wipe Entire Database
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                <strong className="text-rose-600 dark:text-rose-400">⚠️ WARNING:</strong> This action will mark all student entries across <strong className="text-slate-900 dark:text-white">ALL COHORTS</strong> as deleted. It is intended to start the academic year afresh and cannot be undone.
              </p>
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-mono font-bold text-slate-400 uppercase">
                  Please type "WIPE" below to confirm:
                </label>
                <input
                  type="text"
                  value={wipeConfirmInput}
                  onChange={(e) => setWipeConfirmInput(e.target.value)}
                  placeholder='Type "WIPE" here'
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-slate-50"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWipeDbConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeWipeDatabase}
                  disabled={wipeConfirmInput !== 'WIPE'}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm ${
                    wipeConfirmInput === 'WIPE'
                      ? 'bg-rose-600 hover:bg-rose-700 cursor-pointer'
                      : 'bg-rose-300 dark:bg-rose-950/40 text-slate-100 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Wipe Database
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
