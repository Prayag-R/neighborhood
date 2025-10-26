import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        if (signUpError) throw signUpError;
        alert('Check your email for confirmation!');
        setEmail('');
        setPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (signInError) throw signInError;
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setEmail('');
              setPassword('');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Create one"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-600 hover:text-gray-700 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};