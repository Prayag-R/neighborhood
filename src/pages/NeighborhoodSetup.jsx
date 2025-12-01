// src/pages/NeighborhoodSetup.jsx
import { useState, useCallback } from 'react';
import { MapPin, Loader, Map } from 'lucide-react';
import { getUserLocation } from '../lib/neighborhoodService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export default function NeighborhoodSetup({ user, onNeighborhoodSet, darkMode }) {
  const [step, setStep] = useState('method');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentNeighborhood, setCurrentNeighborhood] = useState(null);
  const [error, setError] = useState('');

  // Call backend to reverse geocode coordinates to neighborhood
  const getNeighborhoodFromBackend = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/reverse-geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });

      if (!response.ok) throw new Error('Failed to get neighborhood');

      const data = await response.json();
      return { 
        name: data.name, 
        city: data.city, 
        lat: data.lat, 
        lng: data.lng,
        geometry: data.geometry,
        address: data.address,
      };
    } catch (err) {
      console.error('Error getting neighborhood from backend:', err);
      throw err;
    }
  }, []);

  // Call backend to geocode address
  const geocodeAddressViaBackend = useCallback(async (addr) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/geocode-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      });

      if (!response.ok) throw new Error('Address not found');

      return await response.json();
    } catch (err) {
      console.error('Error geocoding address:', err);
      throw err;
    }
  }, []);

  // Find neighborhood from coordinates
  const findNeighborhood = useCallback(
    async (lat, lng) => {
      setError('');
      setLoading(true);
      try {
        const neighborhood = await getNeighborhoodFromBackend(lat, lng);
        setCurrentNeighborhood(neighborhood);
        setStep('confirm');
      } catch (err) {
        setError('Could not identify a neighborhood. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [getNeighborhoodFromBackend]
  );

  // Use device location
  const handleUseLocation = async () => {
    setError('');
    setLoading(true);
    try {
      const coords = await getUserLocation();
      await findNeighborhood(coords.lat, coords.lng);
    } catch (err) {
      setError('Could not access your location. Please enable location services.');
      setLoading(false);
    }
  };

  // Geocode address and find neighborhood
  const handleAddressLookup = async (addr = address) => {
    if (!addr.trim()) {
      setError('Please enter a valid address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await geocodeAddressViaBackend(addr);
      await findNeighborhood(result.lat, result.lng);
    } catch (err) {
      setError('Address not found. Please try a different address.');
      setLoading(false);
    }
  };

  // Save neighborhood to profile
  const handleConfirm = async () => {
    if (!currentNeighborhood || !user) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          neighborhood_name: currentNeighborhood.name,
          city: currentNeighborhood.city,
          lat: currentNeighborhood.lat,
          lng: currentNeighborhood.lng,
          geometry: currentNeighborhood.geometry,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      onNeighborhoodSet(currentNeighborhood);
    } catch (err) {
      console.error('Error saving neighborhood:', err);
      setError('Failed to save neighborhood. Please try again.');
      setLoading(false);
    }
  };

  const colors = darkMode
    ? {
        bg: 'bg-gray-900',
        cardBg: 'bg-gray-800',
        text: 'text-gray-100',
        textMuted: 'text-gray-400',
        border: 'border-gray-700',
        inputBg: 'bg-gray-700',
        placeholder: 'placeholder-gray-500',
        button: 'bg-green-600 hover:bg-green-500',
        itemHover: 'hover:bg-gray-600',
      }
    : {
        bg: 'bg-slate-50',
        cardBg: 'bg-white',
        text: 'text-gray-800',
        textMuted: 'text-gray-500',
        border: 'border-gray-200',
        inputBg: 'bg-gray-50',
        placeholder: 'placeholder-gray-400',
        button: 'bg-green-600 hover:bg-green-700',
        itemHover: 'hover:bg-slate-50',
      };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${colors.bg}`}>
      <div className={`w-full max-w-lg p-8 rounded-2xl shadow-2xl ${colors.cardBg}`}>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {step === 'method' && (
          <>
            <div className="flex justify-center mb-6">
              <MapPin size={48} className="text-green-600" />
            </div>
            <h2 className={`text-2xl font-bold ${colors.text} text-center mb-2`}>
              Set Your Neighborhood
            </h2>
            <p className={`text-center ${colors.textMuted} mb-8`}>
              Let's find your local community
            </p>
            <button
              onClick={handleUseLocation}
              disabled={loading}
              className={`w-full ${colors.button} text-white font-bold py-4 rounded-xl mb-3 transition`}
            >
              {loading ? <Loader size={18} className="inline animate-spin mr-2" /> : <MapPin size={18} className="inline mr-2" />}
              Use My Location
            </button>
            <button
              onClick={() => setStep('address')}
              className={`w-full ${colors.text} py-4 rounded-xl border ${colors.border} transition ${colors.itemHover}`}
            >
              <Map size={18} className="inline mr-2" /> Enter Address
            </button>
          </>
        )}

        {step === 'address' && (
          <>
            <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>Enter Your Address</h2>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Cary NC"
              className={`w-full p-4 rounded-xl ${colors.inputBg} ${colors.text} ${colors.placeholder} border ${colors.border} mb-4 focus:outline-none focus:ring-2 focus:ring-green-600`}
            />
            <button
              onClick={() => handleAddressLookup()}
              disabled={loading}
              className={`w-full ${colors.button} text-white font-bold py-4 rounded-xl mb-3 transition`}
            >
              {loading ? <Loader size={18} className="inline animate-spin mr-2" /> : null}
              {loading ? 'Finding...' : 'Find Neighborhood'}
            </button>
            <button
              onClick={() => setStep('method')}
              className={`w-full ${colors.textMuted} py-4 rounded-xl transition`}
            >
              Back
            </button>
          </>
        )}

        {step === 'confirm' && currentNeighborhood && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} className="text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${colors.text}`}>Got It!</h2>
              <p className={`${colors.textMuted} mb-4`}>Your neighborhood:</p>
              <p className="text-green-600 font-bold text-2xl">
                {currentNeighborhood.name}
              </p>
              <p className={`text-sm ${colors.textMuted}`}>
                {currentNeighborhood.city}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`w-full ${colors.button} text-white font-bold py-4 rounded-xl mb-3 transition disabled:opacity-50`}
            >
              {loading ? <Loader size={18} className="inline animate-spin mr-2" /> : null}
              {loading ? 'Setting up...' : 'Confirm & Continue'}
            </button>
            <button
              onClick={() => setStep('method')}
              className={`w-full ${colors.textMuted} py-4 rounded-xl transition`}
            >
              Start Over
            </button>
          </>
        )}
      </div>
    </div>
  );
}