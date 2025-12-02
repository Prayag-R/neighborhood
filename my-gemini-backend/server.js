// server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
app.get("/test", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({ ok: true });
});
// Backend-only keys
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Supabase service key (never exposed to frontend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// CORS configuration - allow frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://neighborhood-pearl.vercel.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

app.use(express.json());

// Password hashing config
const SALT_ROUNDS = 10;

/* =====================================================
   AUTHENTICATION ENDPOINTS
===================================================== */

/**
 * Sign Up: Create new user account
 */
app.post('/api/sign-up', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user in Supabase auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    const userId = authData.user.id;

    // Upsert: Insert if doesn't exist, update if it does
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          user_id: userId,
          email,
          password_hash: hashedPassword,
          full_name: null,
          bio: null,
          skills_teaching: [],
          skills_learning: [],
          hourly_rate: null,
          profile_picture_url: null,
          avatar_url: null,
          dark_mode: false,
          reputation_score: 0,
          verified: false,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      await supabase.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Failed to setup user profile' });
    }

    res.status(201).json({
      userId,
      email,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Sign In: Authenticate user
 */
app.post('/api/sign-in', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, password_hash, full_name, bio')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        bio: user.bio,
      },
      session: {
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* =====================================================
   GEOCODING ENDPOINTS
===================================================== */

/**
 * Forward Geocoding: Address → Coordinates
 */
app.post('/api/geocode-address', async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'Address is required' });

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return res.json({
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address,
      });
    }

    res.status(404).json({ error: 'Address not found.' });
  } catch (error) {
    console.error('Forward geocoding error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * Reverse Geocoding: Coordinates → Neighborhood/City
 */
app.post('/api/reverse-geocode', async (req, res) => {
  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined)
    return res.status(400).json({ error: 'Latitude and longitude required' });

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result =
        data.results.find((r) => r.types.includes('neighborhood')) || data.results[0];

      const findComponent = (types) =>
        result.address_components.find((c) =>
          c.types.some((t) => types.includes(t))
        )?.long_name;

      const name =
        findComponent(['neighborhood', 'sublocality_level_1', 'locality']) ||
        'Unknown Neighborhood';
      const city = findComponent(['locality', 'postal_town']) || 'Unknown City';

      return res.json({
        name,
        city,
        lat,
        lng,
        geometry: result.geometry,
        address: result.formatted_address,
      });
    }

    res.status(404).json({ error: 'Location not found.' });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

/* =====================================================
   PROFILE ENDPOINTS
===================================================== */

/**
 * Get user profile
 */
app.post('/api/get-profile', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Supabase fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

/**
 * Get user's neighborhood info
 */
app.post('/api/get-profile-neighborhood', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('neighborhood_name, city, lat, lng')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data || !data.neighborhood_name) {
      return res.status(404).json({ error: 'Neighborhood not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Supabase fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch neighborhood.' });
  }
});

/**
 * Save or update user profile + neighborhood
 */
app.post('/api/save-profile', async (req, res) => {
  const { id, ...profileData } = req.body;
  
  if (!id) return res.status(400).json({ error: 'User ID is required' });

  try {
    console.log('Saving profile for user:', id);
    console.log('Profile data:', profileData);

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id);

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Supabase update error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: `Failed to save profile: ${error.message}` });
  }
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

/* =====================================================
   ERROR HANDLING
===================================================== */

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});