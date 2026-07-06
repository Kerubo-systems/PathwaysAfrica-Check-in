/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingView from './components/views/LandingView';
import AboutView from './components/views/AboutView';
import PrivacyView from './components/views/PrivacyView';
import SurveyView from './components/views/SurveyView';
import AdminView from './components/views/AdminView';
import LoginView from './components/views/LoginView';
import ToastNotification, { Toast } from './components/ToastNotification';
import Modal from './components/Modal';
import { Heart, Info, Landmark } from 'lucide-react';
import Button from './components/Button';
import { motion, AnimatePresence } from 'motion/react';
import BackgroundSparkles from './components/BackgroundSparkles';

const getInitialView = (): 'landing' | 'survey' | 'about' | 'privacy' | 'admin' => {
  try {
    const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    
    if (path === 'admin' || hash === '#admin' || search.includes('admin')) return 'admin';
    if (path === 'survey' || hash === '#survey' || search.includes('survey')) return 'survey';
    if (path === 'about' || hash === '#about' || search.includes('about')) return 'about';
    if (path === 'privacy' || hash === '#privacy' || search.includes('privacy')) return 'privacy';
  } catch (_) {}
  return 'landing';
};

export default function App() {
  const [currentView, setView] = useState<'landing' | 'survey' | 'about' | 'privacy' | 'admin'>(getInitialView);
  
  // Synchronize state changes with browser URL
  useEffect(() => {
    try {
      const targetPath = currentView === 'landing' ? '/' : `/${currentView}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } catch (_) {}
  }, [currentView]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
        if (path === 'admin') {
          setView('admin');
        } else if (path === 'survey') {
          setView('survey');
        } else if (path === 'about') {
          setView('about');
        } else if (path === 'privacy') {
          setView('privacy');
        } else {
          setView('landing');
        }
      } catch (_) {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check local storage or system preference
    try {
      const saved = localStorage.getItem('pathways_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (_) {}
    return 'light'; // Default to warm light theme as recommended
  });

  const [toast, setToast] = useState<Toast | null>(null);

  const getValidAdminSession = () => {
    try {
      const logged = localStorage.getItem('pathways_admin_logged') === 'true';
      const token = localStorage.getItem('pathways_admin_token');
      const userStr = localStorage.getItem('pathways_admin_user');
      
      if (logged && token && userStr) {
        return {
          isLoggedIn: true,
          user: JSON.parse(userStr)
        };
      }
    } catch (_) {}
    return { isLoggedIn: false, user: null };
  };

  // Authenticated state shared across views
  const [isLoggedIn, setIsLoggedIn] = useState(() => getValidAdminSession().isLoggedIn);
  const [adminUser, setAdminUser] = useState<any | null>(() => getValidAdminSession().user);

  // Sync theme to root class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('pathways_theme', theme);
    } catch (_) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    showToast(`Switched to ${theme === 'light' ? 'Dark' : 'Light'} theme ✨`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({
      id: Date.now().toString(),
      message,
      type,
    });
  };

  const handleCompleteSurvey = () => {
    showToast('Draft updated and check-in successfully submitted 🎉', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-[#FAF7F2] via-[#FAF5EC] to-[#EFE8DE] dark:from-[#090F0C] dark:to-[#122019] dark:bg-[#090F0C] text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      
      {/* Background soft ambient glowing circles */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-[#FAF5EC]/30 via-[#F2EBE1]/40 to-[#FAF7F2]/30 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20 rounded-full blur-3xl" />
      </div>

      {/* Subtle magical premium background sparkle effect */}
      <BackgroundSparkles />

      {/* Header */}
      <Header
        currentView={currentView}
        setView={(view) => {
          setView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Stage */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <LandingView
                onStart={() => setView('survey')}
                setView={(view) => {
                  setView(view);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {currentView === 'survey' && (
            <motion.div
              key="survey"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <SurveyView
                onComplete={handleCompleteSurvey}
                onCancel={() => setView('landing')}
                showToast={showToast}
              />
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <AboutView
                onBackToHome={() => setView('landing')}
                onStartSurvey={() => setView('survey')}
              />
            </motion.div>
          )}

          {currentView === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <PrivacyView
                onBackToHome={() => setView('landing')}
                onStartSurvey={() => setView('survey')}
              />
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {isLoggedIn ? (
                <AdminView 
                  showToast={showToast} 
                  isLoggedIn={isLoggedIn}
                  setIsLoggedIn={setIsLoggedIn}
                  adminUser={adminUser}
                  setAdminUser={setAdminUser}
                />
              ) : (
                <LoginView 
                  showToast={showToast} 
                  onLoginSuccess={(user, token) => {
                    const now = Date.now();
                    try {
                      localStorage.setItem('pathways_admin_logged', 'true');
                      localStorage.setItem('pathways_admin_token', token);
                      localStorage.setItem('pathways_admin_user', JSON.stringify(user));
                      localStorage.setItem('pathways_admin_login_time', now.toString());
                    } catch (_) {}
                    setAdminUser(user);
                    setIsLoggedIn(true);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        setView={(view) => {
          setView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Central Toast Notifications */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
