// src/pages/SearchUsers.jsx
import { useState, useCallback } from 'react';
import { Search, X, MapPin, Trophy } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function SearchUsers({ user, darkMode }) {
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearched(false);
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
      setSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim().length >= 2) {
      handleSearch(value);
    } else {
      setResults([]);
      setSearched(false);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setResults([]);
    setSearched(false);
  };

  const colors = darkMode
    ? {
        bg: 'bg-gray-900',
        cardBg: 'bg-gray-800',
        text: 'text-white',
        textMuted: 'text-gray-400',
        border: 'border-gray-700',
        inputBg: 'bg-gray-700',
        inputBorder: 'border-gray-600',
        placeholder: 'placeholder-gray-500',
        hover: 'hover:bg-gray-700',
      }
    : {
        bg: 'bg-gray-50',
        cardBg: 'bg-white',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        border: 'border-gray-200',
        inputBg: 'bg-white',
        inputBorder: 'border-gray-300',
        placeholder: 'placeholder-gray-400',
        hover: 'hover:bg-gray-50',
      };

  return (
    <div className={`min-h-screen ${colors.bg} p-6`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-extrabold ${colors.text} mb-2`}>
            Discover People
          </h1>
          <p className={colors.textMuted}>
            Find community members who can teach or learn skills with you
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className={`relative flex items-center ${colors.inputBg} border ${colors.inputBorder} rounded-lg p-1`}>
            <Search size={20} className={`ml-3 ${colors.textMuted}`} />
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              placeholder="Search by name or bio..."
              className={`flex-1 px-4 py-3 ${colors.inputBg} border-0 focus:outline-none ${colors.text} ${colors.placeholder}`}
            />
            {searchInput && (
              <button
                onClick={handleClear}
                className={`mr-3 p-1 rounded transition ${colors.textMuted} hover:${colors.text}`}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <p className={`${colors.textMuted} mt-4`}>Searching...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className={colors.textMuted}>No users found matching "{searchInput}"</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <p className={`text-sm ${colors.textMuted} mb-4`}>
              Found {results.length} user{results.length !== 1 ? 's' : ''}
            </p>

            {results.map((profile) => (
              <div
                key={profile.id}
                className={`${colors.cardBg} border ${colors.border} rounded-lg p-6 transition ${colors.hover}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Name & Reputation */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-bold ${colors.text}`}>
                        {profile.full_name || 'Anonymous User'}
                      </h3>
                      {profile.reputation_score > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                          <Trophy size={16} className="text-yellow-500" />
                          <span className="text-sm font-semibold text-yellow-600">
                            {profile.reputation_score}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className={`${colors.textMuted} text-sm mb-3 line-clamp-2`}>
                        {profile.bio}
                      </p>
                    )}

                    {/* Location */}
                    {profile.neighborhood_name && (
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={16} className={colors.textMuted} />
                        <span className={`text-sm ${colors.textMuted}`}>
                          {profile.neighborhood_name}
                        </span>
                      </div>
                    )}

                    {/* Can Teach */}
                    {profile.skills_teaching && profile.skills_teaching.length > 0 && (
                      <div className="mb-3">
                        <p className={`text-xs font-semibold ${colors.textMuted} mb-1`}>
                          Can Teach
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills_teaching.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-green-500/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {profile.skills_teaching.length > 3 && (
                            <span className={`text-xs ${colors.textMuted}`}>
                              +{profile.skills_teaching.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Wants to Learn */}
                    {profile.skills_learning && profile.skills_learning.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold ${colors.textMuted} mb-1`}>
                          Wants to Learn
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills_learning.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-500/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {profile.skills_learning.length > 3 && (
                            <span className={`text-xs ${colors.textMuted}`}>
                              +{profile.skills_learning.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Connect Button */}
                  <button className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex-shrink-0">
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!searched && results.length === 0 && !loading && (
          <div className={`text-center py-16 ${colors.cardBg} border ${colors.border} rounded-lg`}>
            <Search size={48} className={`${colors.textMuted} mx-auto mb-4 opacity-50`} />
            <p className={`${colors.textMuted} text-lg`}>
              Start typing to discover people
            </p>
          </div>
        )}
      </div>
    </div>
  );
}