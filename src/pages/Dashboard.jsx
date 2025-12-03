// src/pages/Dashboard.jsx - MAIN LAYOUT & ROUTER
import { LogOut, Settings as SettingsIcon, Zap, LayoutDashboard, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import DashboardHome from './DashboardPages/DashboardHome';
import MySkills from './DashboardPages/MySkills';
import Settings from './DashboardPages/Settings';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function Dashboard({ user, neighborhood, onLogout, darkMode, setDarkMode, saveDarkModePreference }) {
  // Make sure saveDarkModePreference is available
  if (!saveDarkModePreference) {
    console.warn('saveDarkModePreference not passed to Dashboard');
  }
  const [activeTab, setActiveTab] = useState('home');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Handle browser back/forward for tabs
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser history when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.history.pushState({ tab: tabId }, '', window.location.href);
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const colors = darkMode
    ? { bg: 'bg-gray-900', text: 'text-white', nav: 'bg-gray-800', border: 'border-gray-700', active: 'bg-green-600 text-white', inactive: 'text-gray-300 hover:bg-gray-700', cardBg: 'bg-gray-800', textMuted: 'text-gray-400' }
    : { bg: 'bg-gray-50', text: 'text-slate-900', nav: 'bg-white', border: 'border-slate-200', active: 'bg-green-600 text-white', inactive: 'text-slate-700 hover:bg-slate-100', cardBg: 'bg-white', textMuted: 'text-slate-600' };

  const navItems = [
    { id: 'home', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'skills', icon: Zap, label: 'My Skills' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const userName = profileData?.full_name || 'User';
  const userCreatedAt = profileData?.created_at || user.created_at || new Date().toISOString();

  if (loading) {
    return (
      <div className={`min-h-screen ${colors.bg} flex items-center justify-center`}>
        <p className={colors.text}>Loading your profile...</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardHome 
            profileData={profileData} 
            neighborhood={neighborhood}
            darkMode={darkMode}
          />
        );
      case 'skills':
        return (
          <MySkills 
            profileData={profileData}
            darkMode={darkMode}
          />
        );
      case 'settings':
        return (
          <Settings 
            profileData={profileData}
            neighborhood={neighborhood}
            user={user}
            userCreatedAt={userCreatedAt}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            saveDarkModePreference={saveDarkModePreference}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <Navbar 
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        saveDarkModePreference={saveDarkModePreference}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <div className={`min-h-screen ${colors.bg} ${colors.text} transition-colors`}>
        <div className="flex">
          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 min-h-screen sticky top-16 border-r ${colors.border} ${colors.nav} p-6 shadow-xl`}>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition ${activeTab === item.id ? colors.active : colors.inactive}`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-700 dark:border-gray-600">
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl font-semibold transition text-red-500 hover:bg-red-500/10`}
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-8">
            <header className={`mb-10 pb-4 border-b ${colors.border}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className={`text-4xl font-extrabold ${colors.text}`}>
                    {navItems.find(item => item.id === activeTab)?.label}
                  </h1>
                  <p className="text-sm text-gray-500">Welcome, {userName}!</p>
                </div>
              </div>
            </header>

            {/* Render the Active Tab Content */}
            <div className="space-y-8">
              {renderTabContent()}
            </div>
          </main>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`${colors.cardBg} rounded-2xl shadow-2xl p-8 max-w-sm border ${colors.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${colors.text}`}>Confirm Logout</h2>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition`}
                >
                  <X size={24} />
                </button>
              </div>

              <p className={`${colors.textMuted} mb-8`}>
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition bg-red-500 hover:bg-red-600 text-white"
                >
                  Confirm Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}