// src/pages/ProfileSetup.jsx
import { useState } from 'react';
import { User, FileText, Briefcase, DollarSign, Loader } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function ProfileSetup({ user, onProfileSetup, darkMode }) {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    skills: '',
    hourly_rate: '',
    profile_picture_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = darkMode
    ? {
        bg: 'bg-gray-900',
        card: 'bg-gray-800',
        text: 'text-white',
        border: 'border-gray-700',
        input: 'bg-gray-700 border-gray-600 text-white',
        button: 'bg-green-600 hover:bg-green-700',
        label: 'text-green-400',
        icon: 'text-green-500',
      }
    : {
        bg: 'bg-gray-50',
        card: 'bg-white',
        text: 'text-slate-900',
        border: 'border-slate-200',
        input: 'bg-white border-slate-300 text-slate-900',
        button: 'bg-green-600 hover:bg-green-700',
        label: 'text-green-700',
        icon: 'text-green-500',
      };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    if (!formData.full_name.trim() || !formData.bio.trim()) {
      setError('Full name and bio are required');
      setLoading(false);
      return;
    }

    try {
      // Call backend to save profile
      const response = await fetch(`${BACKEND_URL}/api/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: formData.full_name,
          bio: formData.bio,
          skills: formData.skills,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          profile_picture_url: formData.profile_picture_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      // Call parent callback after successful save
      onProfileSetup(formData);
    } catch (err) {
      setError(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.full_name.trim().length > 0 && formData.bio.trim().length > 0;

  return (
    <div className={`min-h-screen ${colors.bg} flex items-center justify-center p-4`}>
      <div className={`${colors.card} rounded-3xl shadow-2xl p-8 max-w-2xl w-full border ${colors.border}`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${colors.text} mb-2`}>Complete Your Profile</h1>
          <p className={`${colors.text} opacity-70`}>Help others learn about your skills and experience</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.label}`}>Full Name *</label>
            <div className="relative">
              <User size={18} className={`absolute left-3 top-3.5 ${colors.icon} pointer-events-none`} />
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-3 ${colors.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition`}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.label}`}>Bio / About You *</label>
            <div className="relative">
              <FileText size={18} className={`absolute left-3 top-3.5 ${colors.icon} pointer-events-none`} />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell others about yourself and what you do..."
                rows="4"
                className={`w-full pl-10 pr-4 py-3 ${colors.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition resize-none`}
                required
                disabled={loading}
              />
            </div>
            <p className={`text-xs ${colors.text} opacity-60 mt-1`}>Share your experience and what makes you unique</p>
          </div>

          {/* Skills */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.label}`}>Skills (comma-separated)</label>
            <div className="relative">
              <Briefcase size={18} className={`absolute left-3 top-3.5 ${colors.icon} pointer-events-none`} />
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g. Python, Web Design, Tutoring, Gardening"
                className={`w-full pl-10 pr-4 py-3 ${colors.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.label}`}>Hourly Rate ($)</label>
            <div className="relative">
              <DollarSign size={18} className={`absolute left-3 top-3.5 ${colors.icon} pointer-events-none`} />
              <input
                type="number"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleInputChange}
                placeholder="25"
                min="0"
                step="0.50"
                className={`w-full pl-10 pr-4 py-3 ${colors.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Profile Picture URL */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${colors.label}`}>Profile Picture URL</label>
            <input
              type="url"
              name="profile_picture_url"
              value={formData.profile_picture_url}
              onChange={handleInputChange}
              placeholder="https://example.com/photo.jpg"
              className={`w-full px-4 py-3 ${colors.input} border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition`}
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full ${colors.button} text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Setting up profile...
              </>
            ) : (
              'Complete Profile & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}