// src/pages/DashboardPages/Settings.jsx
import { Sun, Moon } from 'lucide-react';

export default function Settings({ profileData, neighborhood, user, userCreatedAt, darkMode, setDarkMode, saveDarkModePreference }) {
  const colors = darkMode
    ? { text: 'text-white', cardBg: 'bg-gray-800', border: 'border-gray-700', textMuted: 'text-gray-400' }
    : { text: 'text-slate-900', cardBg: 'bg-white', border: 'border-slate-200', textMuted: 'text-slate-600' };

  const userName = profileData?.full_name || 'User';
  const userEmail = user.email || "user@skillshare.com";
  const userBio = profileData?.bio || 'No bio added yet';
  const userSkills = profileData?.skills || 'No skills added yet';
  const hourlyRate = profileData?.hourly_rate || 'Not set';
  const neighborhoodName = neighborhood?.neighborhood_name || 'Unknown Neighborhood';

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    saveDarkModePreference(newDarkMode);
  };

  return (
    <div className={`${colors.cardBg} rounded-2xl border ${colors.border} p-8 shadow-lg`}>
      <h2 className={`text-3xl font-extrabold ${colors.text} mb-8 border-b pb-3`}>Account Settings</h2>
      
      <div className="space-y-6 max-w-2xl">
        {/* Profile Fields */}
        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Full Name</h3>
          <p className={colors.textMuted}>{userName}</p>
        </div>

        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Email</h3>
          <p className={colors.textMuted}>{userEmail}</p>
        </div>

        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Bio</h3>
          <p className={colors.textMuted}>{userBio}</p>
        </div>

        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Skills</h3>
          <p className={colors.textMuted}>{userSkills}</p>
        </div>

        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Hourly Rate</h3>
          <p className={colors.textMuted}>${hourlyRate}</p>
        </div>

        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Your Neighborhood</h3>
          <p className={colors.textMuted}>{neighborhoodName}</p>
        </div>

        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Account Created</h3>
          <p className={colors.textMuted}>{new Date(userCreatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Dark Mode Toggle */}
        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-4`}>Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon size={24} className="text-yellow-400" />
              ) : (
                <Sun size={24} className="text-yellow-500" />
              )}
              <span className={`font-semibold ${colors.text}`}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={handleDarkModeToggle}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                darkMode ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className={`p-4 border ${colors.border} rounded-xl`}>
          <h3 className={`font-bold text-xl ${colors.text} mb-1`}>Security</h3>
          <button className="text-blue-600 font-semibold hover:text-blue-700 transition">Change Password</button>
        </div>
      </div>
    </div>
  );
}