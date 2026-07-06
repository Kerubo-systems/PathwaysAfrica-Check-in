import React, { useState } from 'react';
import { Shield, Lock, User, KeyRound, Eye, EyeOff, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  onLoginSuccess: (user: any, token: string) => void;
}

export default function LoginView({ showToast, onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputUser = email.trim();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    // Hybrid fallback to server API route for administrator accounts
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputUser, password: inputPass })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast(`Welcome back, ${data.user.name}! Access granted 🔐`, 'success');
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.message || 'Invalid credentials. Please verify your username and password.');
        showToast('Login attempt failed 🔒', 'warning');
      }
    } catch (err) {
      console.error('Login connection error', err);
      setError('Could not establish connection to the authorization server. Please try again.');
      showToast('Authentication network error', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24" id="admin-login-screen">
      <div className="relative group">
        {/* Sleek dynamic glowing background blur ring */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-sleek-accent to-emerald-500 rounded-[36px] blur opacity-15 dark:opacity-30 group-hover:opacity-20 dark:group-hover:opacity-35 transition duration-1000" />
        
        <div className="relative wellness-card rounded-[32px] p-8 sm:p-10 border border-[#DCD3C5] dark:border-slate-800/80 bg-[#FAF7F2]/95 dark:bg-[#090F0C]/95 backdrop-blur-xl shadow-xl space-y-7">
          
          {/* Top Brand Logo & Shield Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-gradient-to-tr from-sleek-accent to-emerald-700 dark:from-emerald-600 dark:to-teal-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/5 animate-float">
              <Shield className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-3xl font-bold text-sleek-charcoal dark:text-slate-50 tracking-tight">
                Portal Authentication
              </h1>
              <p className="text-xs text-sleek-muted dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                Authorized coordinator or administrator credentials are required to view individual cohort responses.
              </p>
            </div>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/25 border border-rose-200/40 text-rose-700 dark:text-rose-400 text-xs text-center font-medium flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
 
            {/* Email / Username field */}
            <div className="space-y-1.5" id="login-username-group">
              <label htmlFor="login-username-input" className="text-xs font-bold uppercase tracking-wider text-sleek-accent dark:text-[#34d399] block px-0.5">
                Enter Username:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700 dark:text-emerald-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="login-username-input"
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-emerald-800/25 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-sans text-sm focus:border-sleek-accent dark:focus:border-[#34d399] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                />
              </div>
            </div>
 
            {/* Password field */}
            <div className="space-y-1.5" id="login-password-group">
              <div className="flex justify-between items-center px-0.5">
                <label htmlFor="login-password-input" className="text-xs font-bold uppercase tracking-wider text-sleek-accent dark:text-[#34d399] block">
                  Enter Password:
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-700 dark:text-emerald-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3.5 rounded-xl border-2 border-emerald-800/25 dark:border-slate-800 bg-white dark:bg-slate-900 text-sleek-charcoal dark:text-slate-100 font-mono text-sm focus:border-sleek-accent dark:focus:border-[#34d399] outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                />
                <button
                  id="login-toggle-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
 
            {/* Authenticate Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-sleek-accent to-emerald-700 dark:from-emerald-600 dark:to-teal-600 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:scale-100 shadow-md shadow-sleek-accent/15 dark:shadow-emerald-500/10 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
 
          {/* Privacy Footnote */}
          <div className="pt-4 border-t border-[#DCD3C5]/50 dark:border-slate-800 text-center">
            <p className="text-[10px] text-sleek-muted dark:text-slate-500 leading-normal">
              For student privacy and data integrity, all authentication events are logged under Pathways Africa security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
