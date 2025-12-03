// src/pages/UserProfile.jsx
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Trophy} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function UserProfile({ userId, currentUserId, darkMode, onBack }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = userId === currentUserId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId }),
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const colors = darkMode
    ? {
        bg: 'bg-gray-900',
        cardBg: 'bg-gray-800',
        text: 'text-white',
        textMuted: 'text-gray-400',
        border: 'border-gray-700',
      }
    : {
        bg: 'bg-gray-50',
        cardBg: 'bg-white',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        border: 'border-gray-200',
      };

  if (loading) {
    return (
      <div className={`${colors.bg} min-h-screen flex items-center justify-center p-4`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={colors.textMuted}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className={`${colors.bg} min-h-screen flex items-center justify-center p-4`}>
        <div className="text-center">
          <p className={colors.textMuted}>Profile not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} min-h-screen p-4 sm:p-8`}>
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-6 ${colors.textMuted} hover:${colors.text} transition`}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Profile Card */}
        <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-8 shadow-lg`}>
          {/* Header with Avatar */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-4xl font-bold">
                {profileData.full_name?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-4xl font-extrabold ${colors.text}`}>
                  {profileData.full_name || 'Anonymous User'}
                </h1>
                {profileData.reputation_score > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Trophy size={20} className="text-yellow-500" />
                    <span className="text-lg font-semibold text-yellow-600">
                      {profileData.reputation_score}
                    </span>
                  </div>
                )}
              </div>
              {profileData.bio && (
                <p className={`${colors.textMuted} text-lg`}>{profileData.bio}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          {profileData.neighborhood_name && (
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={20} className={colors.textMuted} />
              <span className={`text-lg ${colors.textMuted}`}>
                {profileData.neighborhood_name}
                {profileData.city && `, ${profileData.city}`}
              </span>
            </div>
          )}

          {/* Skills Teaching */}
          {profileData.skills_teaching && profileData.skills_teaching.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>Can Teach</h2>
              <div className="flex flex-wrap gap-3">
                {profileData.skills_teaching.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-green-500/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills Learning */}
          {profileData.skills_learning && profileData.skills_learning.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${colors.text} mb-4`}>Wants to Learn</h2>
              <div className="flex flex-wrap gap-3">
                {profileData.skills_learning.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-500/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hourly Rate */}
          {profileData.hourly_rate && (
            <div className={`mb-8 p-4 border ${colors.border} rounded-lg`}>
              <p className={`${colors.textMuted} text-sm mb-1`}>Hourly Rate</p>
              <p className={`text-2xl font-bold ${colors.text}`}>${profileData.hourly_rate}/hr</p>
            </div>
          )}

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
                Connect
              </button>
              <button className={`flex-1 px-4 py-3 border ${colors.border} ${colors.text} rounded-lg font-semibold transition hover:${colors.border}`}>
                Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}