// src/App.js
import { useState, useEffect, useCallback } from 'react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import NeighborhoodSetup from './pages/NeighborhoodSetup';
import ProfileSetup from './pages/ProfileSetup';

// Use environment variable for backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [page, setPage] = useState('loading');
  const [user, setUser] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [browserNavigation, setBrowserNavigation] = useState(false);

  const updatePage = useCallback((newPage) => {
    setPage(newPage);
    window.history.pushState({ page: newPage }, '', window.location.href);
  }, []);

  /* ----------------------------
     Save neighborhood via backend
  ----------------------------- */
  const handleNeighborhoodSet = useCallback(async (neighborhoodData) => {
    if (!user) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          neighborhood_name: neighborhoodData.name,
          city: neighborhoodData.city,
          lat: neighborhoodData.lat,
          lng: neighborhoodData.lng,
          geometry: neighborhoodData.geometry,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNeighborhood({
          user_id: user.id,
          neighborhood_name: neighborhoodData.name,
          city: neighborhoodData.city,
          lat: neighborhoodData.lat,
          lng: neighborhoodData.lng,
          geometry: neighborhoodData.geometry,
        });
        updatePage('profile-setup');
      } else {
        throw new Error(data.error || 'Failed to save neighborhood');
      }
    } catch (err) {
      console.error('Error saving neighborhood:', err);
    }
  }, [user, updatePage]);

  /* ----------------------------
     Save profile via backend
  ----------------------------- */
  const handleProfileSetup = useCallback(async (profileData) => {
    if (!user) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: profileData.full_name,
          bio: profileData.bio,
          skills: profileData.skills,
          hourly_rate: profileData.hourly_rate,
          profile_picture_url: profileData.profile_picture_url,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileComplete(true);
        updatePage('dashboard');
      } else {
        throw new Error(data.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  }, [user, updatePage]);

  /* ----------------------------
     Dark mode save via backend
  ----------------------------- */
  const saveDarkModePreference = useCallback(async (isDarkMode) => {
    if (!user) return;

    try {
      await fetch(`${BACKEND_URL}/api/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, dark_mode: isDarkMode }),
      });
      setDarkMode(isDarkMode);
    } catch (err) {
      console.error('Error saving dark mode:', err);
    }
  }, [user]);

  /* ----------------------------
     Initial load - Check for existing session
  ----------------------------- */
  useEffect(() => {
    const checkUser = async () => {
      // Check if user is stored in localStorage
      const savedUserId = localStorage.getItem('skillshare_user_id');
      
      if (savedUserId) {
        // Restore user session
        setUser({ id: savedUserId });
        
        // Fetch full profile data
        try {
          const res = await fetch(`${BACKEND_URL}/api/get-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: savedUserId }),
          });
          const data = await res.json();
          
          if (res.ok) {
            if (data.neighborhood_name) {
              setNeighborhood({ 
                neighborhood_name: data.neighborhood_name, 
                city: data.city, 
                lat: data.lat, 
                lng: data.lng 
              });
            }
            if (data.full_name && data.bio) setProfileComplete(true);
            if (data.dark_mode !== undefined) setDarkMode(data.dark_mode);
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
      
      setLoading(false);
    };

    checkUser();
  }, []);

  /* ----------------------------
     Page routing logic
  ----------------------------- */
  useEffect(() => {
    if (loading) return;
    if (browserNavigation) {
      setBrowserNavigation(false);
      return;
    }

    if (!user) updatePage('landing');
    else if (!neighborhood) updatePage('neighborhood-setup');
    else if (!profileComplete) updatePage('profile-setup');
    else updatePage('dashboard');
  }, [user, neighborhood, profileComplete, loading, browserNavigation, updatePage]);

  const handleLogout = () => {
    localStorage.removeItem('skillshare_user_id');
    setUser(null);
    setNeighborhood(null);
    setProfileComplete(false);
    updatePage('landing');
  };

  if (loading || page === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {page === 'landing' && <Landing darkMode={darkMode} setDarkMode={setDarkMode} onSignInSuccess={(userData) => {
        setUser(userData);
        // Fetch profile to check if setup is complete
        fetch(`${BACKEND_URL}/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userData.id }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.neighborhood_name) setNeighborhood({ neighborhood_name: data.neighborhood_name, city: data.city, lat: data.lat, lng: data.lng });
            if (data.full_name && data.bio) setProfileComplete(true);
          })
          .catch(err => console.error('Error fetching profile:', err));
      }} />}
      {page === 'neighborhood-setup' && user && !neighborhood && (
        <NeighborhoodSetup user={user} onNeighborhoodSet={handleNeighborhoodSet} darkMode={darkMode} />
      )}
      {page === 'profile-setup' && user && neighborhood && !profileComplete && (
        <ProfileSetup user={user} onProfileSetup={handleProfileSetup} darkMode={darkMode} />
      )}
      {page === 'dashboard' && user && neighborhood && profileComplete && (
        <Dashboard
          user={user}
          neighborhood={neighborhood}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
          saveDarkModePreference={saveDarkModePreference}
        />
      )}
    </>
  );
}