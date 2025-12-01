// src/pages/SignInOverlay.jsx
import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Loader, Eye, EyeOff, User, FileText, Briefcase, DollarSign } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

function SignInOverlay({ onSignInSuccess, onBack, isDark = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileStep, setProfileStep] = useState(1); // Step 1 or 2
  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    skills_teaching: '',
    skills_learning: '',
    hourly_rate: '',
    profile_picture_url: '',
  });
  const [currentUser, setCurrentUser] = useState(null);

  // Define colors
  const colors = isDark
    ? {
        overlayBg: 'bg-gray-950/80 backdrop-blur-sm',
        cardBg: 'bg-gray-800/95',
        border: 'border-green-800/50',
        text: 'text-white',
        textMuted: 'text-gray-400',
        primaryText: 'text-green-400',
        inputBg: 'bg-gray-900',
        inputBorder: 'border-green-700',
        inputFocusRing: 'focus:ring-green-400',
        iconColor: 'text-green-500',
        toggleButton: 'text-green-400 hover:text-green-200',
        successBg: 'bg-green-950/50 border-green-700',
        errorBg: 'bg-red-950/50 border-red-700',
        successText: 'text-green-300',
        errorText: 'text-red-300',
        primaryButton:
          'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
      }
    : {
        overlayBg: 'bg-black/50 backdrop-blur-sm',
        cardBg: 'bg-white',
        border: 'border-green-200',
        text: 'text-green-950',
        textMuted: 'text-green-700',
        primaryText: 'text-green-950',
        inputBg: 'bg-white',
        inputBorder: 'border-green-300',
        inputFocusRing: 'focus:ring-green-600',
        iconColor: 'text-green-400',
        toggleButton: 'text-green-400 hover:text-green-600',
        successBg: 'bg-green-50 border-green-200',
        errorBg: 'bg-red-50 border-red-200',
        successText: 'text-green-700',
        errorText: 'text-red-700',
        primaryButton:
          'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
      };

  // ---------------------------
  // Backend Calls
  // ---------------------------
  const signUp = async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  };

  const signIn = async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  };

  const saveProfile = async (id, profileData) => {
    const res = await fetch(`${BACKEND_URL}/api/save-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...profileData }),
    });
    return res.json();
  };

  // ---------------------------
  // Form Handlers
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        const data = await signUp(email, password);
        if (data.error) throw new Error(data.error);

        setCurrentUser({ id: data.userId });
        setShowProfileSetup(true);
      } else {
        const data = await signIn(email, password);
        if (data.error) throw new Error(data.error);

        setCurrentUser({ id: data.user.id });
        setSuccess('Signed in successfully!');
        setTimeout(() => onSignInSuccess({ id: data.user.id }), 500);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Step 1: Just validate and move to step 2
    if (profileStep === 1) {
      if (!profileData.full_name.trim() || !profileData.bio.trim()) {
        setError('Full name and bio are required');
        return;
      }
      setProfileStep(2);
      return;
    }

    // Step 2: Save everything
    setLoading(true);
    try {
      if (!currentUser) throw new Error('User not found');

      const dataToSave = {
        id: currentUser.id,
        full_name: profileData.full_name || null,
        bio: profileData.bio || null,
        skills_teaching: profileData.skills_teaching ? profileData.skills_teaching.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
        skills_learning: profileData.skills_learning ? profileData.skills_learning.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
        hourly_rate: profileData.hourly_rate && profileData.hourly_rate.trim() ? parseFloat(profileData.hourly_rate) : null,
        profile_picture_url: profileData.profile_picture_url || null,
      };

      console.log('Saving profile:', dataToSave);

      const data = await saveProfile(currentUser.id, dataToSave);
      if (data.error) throw new Error(data.error);

      setSuccess('Profile saved! Signing in...');
      setShowProfileSetup(false);
      setProfileStep(1); // Reset for next time
      setTimeout(() => onSignInSuccess({ id: currentUser.id }), 500);
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password;
  

  // ---------------------------
  // UI RENDER - Profile Setup
  // ---------------------------
  if (showProfileSetup) {
    return (
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${colors.overlayBg}`}>
        <div className="w-full max-w-md relative z-20">
          <button
            onClick={() => {
              setShowProfileSetup(false);
              setCurrentUser(null);
              setProfileData({
                full_name: '',
                bio: '',
                skills_teaching: '',
                skills_learning: '',
                hourly_rate: '',
                profile_picture_url: '',
              });
              setError('');
              setSuccess('');
            }}
            className={`flex items-center gap-2 mb-4 transition font-medium ${isDark ? 'text-green-300 hover:text-green-200' : 'text-green-700 hover:text-green-800'}`}
          >
            <ArrowLeft size={20} /> Back
          </button>

          <div className={`${colors.cardBg} rounded-3xl shadow-2xl p-8 border ${colors.border}`}>
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${colors.text}`}>
                {profileStep === 1 ? 'Tell Us About Yourself' : 'Share Your Skills'}
              </h1>
              <p className={`text-sm ${colors.textMuted}`}>
                {profileStep === 1 
                  ? 'Help the community learn about you' 
                  : 'What can you teach or learn?'}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${profileStep >= 1 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className={`w-2 h-2 rounded-full ${profileStep >= 2 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
            </div>

            {error && <div className={`mb-6 p-4 ${colors.errorBg} border rounded-lg`}><p className={`text-sm font-medium ${colors.errorText}`}>{error}</p></div>}
            {success && <div className={`mb-6 p-4 ${colors.successBg} border rounded-lg`}><p className={`text-sm font-medium ${colors.successText}`}>{success}</p></div>}

            <form onSubmit={handleProfileSubmit} className="space-y-4 mb-6">
              {profileStep === 1 ? (
                <>
                  {/* Step 1: Full Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Full Name *</label>
                    <div className="relative">
                      <User size={18} className={`absolute left-3 top-3.5 ${colors.iconColor} pointer-events-none`} />
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition`}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Step 1: Bio */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Bio / About You *</label>
                    <div className="relative">
                      <FileText size={18} className={`absolute left-3 top-3.5 ${colors.iconColor} pointer-events-none`} />
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Tell others about yourself and what you do..."
                        rows="4"
                        className={`w-full pl-10 pr-4 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition resize-none`}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${colors.primaryButton} text-white py-2.5 rounded-lg transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg hover:shadow-xl`}
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  {/* Step 2: Skills Teaching */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Skills You Can Teach</label>
                    <div className="relative">
                      <Briefcase size={18} className={`absolute left-3 top-3.5 ${colors.iconColor} pointer-events-none`} />
                      <input
                        type="text"
                        value={profileData.skills_teaching}
                        onChange={(e) => setProfileData({ ...profileData, skills_teaching: e.target.value })}
                        placeholder="e.g. Python, Guitar, Cooking"
                        className={`w-full pl-10 pr-4 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Step 2: Skills Learning */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Skills You Want to Learn</label>
                    <div className="relative">
                      <Briefcase size={18} className={`absolute left-3 top-3.5 ${colors.iconColor} pointer-events-none`} />
                      <input
                        type="text"
                        value={profileData.skills_learning}
                        onChange={(e) => setProfileData({ ...profileData, skills_learning: e.target.value })}
                        placeholder="e.g. Spanish, Photography, Gardening"
                        className={`w-full pl-10 pr-4 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Step 2: Hourly Rate */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Hourly Rate ($) - Optional</label>
                    <div className="relative">
                      <DollarSign size={18} className={`absolute left-3 top-3.5 ${colors.iconColor} pointer-events-none`} />
                      <input
                        type="number"
                        value={profileData.hourly_rate}
                        onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                        placeholder="25"
                        min="0"
                        step="0.5"
                        className={`w-full pl-10 pr-4 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition`}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Step 2: Profile Picture URL */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Profile Picture URL - Optional</label>
                    <input
                      type="url"
                      value={profileData.profile_picture_url}
                      onChange={(e) => setProfileData({ ...profileData, profile_picture_url: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                      className={`w-full px-4 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition`}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setProfileStep(1)}
                      disabled={loading}
                      className={`flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded-lg transition font-semibold disabled:opacity-50`}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 bg-gradient-to-r ${colors.primaryButton} text-white py-2.5 rounded-lg transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl`}
                    >
                      {loading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Complete Profile'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------
  // UI RENDER - Sign In / Sign Up Form
  // ---------------------------
  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${colors.overlayBg}`}>
      <div className="w-full max-w-md relative z-20">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-4 transition font-medium ${isDark ? 'text-green-300 hover:text-green-200' : 'text-green-700 hover:text-green-800'}`}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className={`${colors.cardBg} rounded-3xl shadow-2xl p-8 border ${colors.border}`}>
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${colors.text}`}>{isSignUp ? 'Join SkillShare' : 'Welcome Back'}</h1>
            <p className={`text-sm ${colors.textMuted}`}>
              {isSignUp ? 'Start connecting with neighbors and share your skills' : 'Access your SkillShare community'}
            </p>
          </div>

          {error && <div className={`mb-6 p-4 ${colors.errorBg} border rounded-lg animate-shake`}><p className={`text-sm font-medium ${colors.errorText}`}>{error}</p></div>}
          {success && <div className={`mb-6 p-4 ${colors.successBg} border rounded-lg`}><p className={`text-sm font-medium ${colors.successText}`}>{success}</p></div>}

          {/* Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Email Address</label>
              <div className="relative">
                <Mail size={18} className={`absolute left-3 top-3.5 ${colors.iconColor} pointer-events-none`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition`}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${colors.primaryText}`}>Password</label>
              <div className="relative">
                <Lock size={18} className={`absolute left-3 top-3.5 ${colors.iconColor} pointer-events-none`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.text} placeholder-gray-400 focus:outline-none focus:ring-2 ${colors.inputFocusRing} focus:border-transparent transition`}
                  required
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-3.5 ${colors.toggleButton} transition`} tabIndex="-1">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements (only show on sign up) */}
          {isSignUp && (
            <div className={`mb-6 p-3 rounded-lg border ${isDark ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-300'}`}>
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Password must have:</p>
              <ul className={`text-xs space-y-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <li>✓ At least 6 characters</li>
                <li>✓ Mix of uppercase and lowercase letters</li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className={`w-full bg-gradient-to-r ${colors.primaryButton} text-white py-2.5 rounded-lg transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg hover:shadow-xl`}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>

          {/* Toggle Sign Up / Sign In */}
          <div className={`pt-6 border-t ${colors.border} text-center`}>
            <p className={`text-sm mb-3 ${colors.textMuted}`}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setEmail('');
                setPassword('');
              }}
              className={`font-medium transition ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'}`}
            >
              {isSignUp ? 'Sign In Instead' : 'Create One Now'}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className={`text-center text-xs mt-8 ${isDark ? 'text-gray-500' : 'text-green-700/60'}`}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export default SignInOverlay;