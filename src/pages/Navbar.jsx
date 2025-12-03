// src/pages/Navbar.jsx
import { Search, X, Settings, LogOut, ChevronDown, MapPin, Trophy, Sun, Moon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function Navbar({ user, darkMode, setDarkMode, onLogout, saveDarkModePreference, onViewProfile }) {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/search-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          excludeUserId: user.id,
        }),
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    handleSearch(value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setResults([]);
    setShowResults(false);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (saveDarkModePreference) {
      saveDarkModePreference(newDarkMode);
    }
  };

  const colors = darkMode
    ? {
        bg: 'bg-gray-900',
        border: 'border-gray-800',
        text: 'text-white',
        textMuted: 'text-gray-400',
        inputBg: 'bg-gray-800',
        inputBorder: 'border-gray-700',
        inputText: 'text-white',
        placeholder: 'placeholder-gray-500',
        hoverLight: 'hover:bg-gray-700',
        resultsBg: 'bg-gray-800',
        resultsBorder: 'border-gray-700',
      }
    : {
        bg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        inputBg: 'bg-gray-100',
        inputBorder: 'border-gray-300',
        inputText: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        hoverLight: 'hover:bg-gray-100',
        resultsBg: 'bg-white',
        resultsBorder: 'border-gray-200',
      };

  return (
    <nav className={`sticky top-0 z-40 ${colors.bg} border-b ${colors.border} shadow-sm transition-colors`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className={`font-extrabold text-xl ${colors.text} hidden sm:inline`}>
                SkillShare
              </span>
            </div>
          </div>

          {/* Center Search Bar - Hidden on mobile */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className={`w-full flex items-center ${colors.inputBg} border ${colors.inputBorder} rounded-full transition focus-within:ring-2 focus-within:ring-green-500`}>
              <Search size={18} className={`ml-4 ${colors.textMuted} flex-shrink-0`} />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search people or skills..."
                className={`flex-1 px-4 py-2.5 ${colors.inputBg} border-0 focus:outline-none ${colors.inputText} ${colors.placeholder} text-sm rounded-full`}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className={`mr-4 p-1 rounded-full transition ${colors.textMuted} ${colors.hoverLight}`}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className={`absolute top-full left-0 right-0 mt-2 ${colors.resultsBg} border ${colors.resultsBorder} rounded-lg shadow-xl max-h-96 overflow-y-auto`}>
                {loading && (
                  <div className="p-4 text-center">
                    <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                  </div>
                )}

                {!loading && results.length === 0 && searchInput.trim() && (
                  <div className={`p-4 text-center ${colors.textMuted}`}>
                    No results found
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div>
                    <div className={`px-4 py-2 text-xs font-semibold ${colors.textMuted} border-b ${colors.resultsBorder}`}>
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </div>
                    {results.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          if (onViewProfile) onViewProfile(profile.id);
                          handleClearSearch();
                        }}
                        className={`w-full text-left px-4 py-3 border-b ${colors.resultsBorder} transition ${colors.hoverLight} flex items-start gap-3`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {profile.full_name?.[0] || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${colors.text} truncate`}>
                              {profile.full_name || 'Anonymous User'}
                            </h4>
                            {profile.reputation_score > 0 && (
                              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                                <Trophy size={12} className="text-yellow-500" />
                                <span className="text-xs font-semibold text-yellow-600">
                                  {profile.reputation_score}
                                </span>
                              </div>
                            )}
                          </div>
                          {profile.bio && (
                            <p className={`text-xs ${colors.textMuted} truncate mb-1`}>
                              {profile.bio}
                            </p>
                          )}
                          {profile.neighborhood_name && (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className={colors.textMuted} />
                              <span className={`text-xs ${colors.textMuted}`}>
                                {profile.neighborhood_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button for Mobile */}
            <button className={`md:hidden p-2 rounded-full transition ${colors.hoverLight}`}>
              <Search size={20} className={colors.text} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleDarkModeToggle}
              className={`p-2 rounded-full transition ${colors.hoverLight}`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${colors.hoverLight}`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.full_name?.[0] || 'U'}
                  </span>
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${colors.text}`}>
                  {user?.full_name || 'User'}
                </span>
                <ChevronDown size={16} className={`${colors.textMuted} hidden sm:inline transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${colors.inputBg} border ${colors.inputBorder} rounded-lg shadow-lg py-2 z-50`}>
                  <div className={`px-4 py-2 border-b ${colors.inputBorder}`}>
                    <p className={`text-sm font-medium ${colors.text}`}>{user?.full_name}</p>
                    <p className={`text-xs ${colors.textMuted}`}>{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (onViewProfile) onViewProfile(user?.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${colors.text} ${colors.hoverLight} transition`}
                  >
                    <Settings size={16} />
                    View My Profile
                  </button>
                  <button className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${colors.text} ${colors.hoverLight} transition`}>
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition`}
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}