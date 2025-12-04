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

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('/', cors());

app.use(express.json());

// Password hashing config
const SALT_ROUNDS = 10;

// Perspective API key
const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
const PERSPECTIVE_API_URL = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyzeComment';

/**
 * Check if text is a valid skill using Perspective API and relevance checks
 */
const checkSkillValidity = async (text) => {
  if (!PERSPECTIVE_API_KEY) {
    console.warn('Perspective API key not configured, skipping toxicity check');
    return { isValid: true, reason: null };
  }

  try {
    // Check toxicity
    const response = await fetch(PERSPECTIVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment: { text },
        requestedAttributes: {
          TOXICITY: {},
          SPAM: {},
          PROFANITY: {},
        },
        languages: ['en'],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Perspective API error:', data.error.message);
      return { isValid: true, reason: null };
    }

    const toxicityScore = data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    const spamScore = data.attributeScores?.SPAM?.summaryScore?.value || 0;
    const profanityScore = data.attributeScores?.PROFANITY?.summaryScore?.value || 0;

    // Check if toxic/spam/profane
    if (toxicityScore > 0.7 || spamScore > 0.8 || profanityScore > 0.7) {
      return { 
        isValid: false, 
        reason: 'Skill contains inappropriate content. Please use a different skill name.',
      };
    }

    // Relevance checks - pattern matching for common irrelevant phrases
    const lowerText = text.toLowerCase().trim();
    
    const irrelevantPatterns = [
      /^i\s+/,  // "i had", "i like", "i went"
      /^today/i,
      /^yesterday/i,
      /^tomorrow/i,
      /^yesterday\s+i/i,
      /^this\s+(morning|afternoon|evening|week|month)/i,
      /^last\s+(night|week|month)/i,
      /\d{1,2}[:.]?\d{2}\s*(am|pm|a\.m|p\.m)/i,  // Times like "3:30 pm"
      /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*,?/i,  // Days
      /^at\s+\d/,  // "at 3", "at 5 pm"
      /^(was|were|had|have|has|do|did|does)\s+/i,  // Verbs in past tense (story telling)
      /^the\s+(weather|food|coffee|lunch|breakfast|dinner|movie|show|game)/i,
      /^(so|and|but|or|because)\s+/i,  // Starting with conjunctions
      /(\s+today|\s+yesterday|\s+tomorrow)$/i,  // Ending with time references
      /\s+(in\s+the\s+(morning|afternoon|evening)|last\s+night)$/i,
    ];

    const isIrrelevant = irrelevantPatterns.some(pattern => pattern.test(lowerText));

    if (isIrrelevant) {
      return { 
        isValid: false, 
        reason: 'This appears to be a sentence or event, not a skill. Please enter an actual skill (e.g., "Web Design", "Python", "Guitar").',
      };
    }

    // Check if it's too sentence-like (has common sentence patterns)
    const wordCount = lowerText.split(/\s+/).length;
    if (wordCount > 8) {
      return { 
        isValid: false, 
        reason: 'Skill name is too long. Keep it to a few words (e.g., "Graphic Design", "Data Analysis").',
      };
    }

    return { isValid: true, reason: null };
  } catch (error) {
    console.error('Skill validity check error:', error);
    return { isValid: true, reason: null };
  }
};

/**
 * Validate skill name
 */
const validateSkillName = (skillName) => {
  if (!skillName || typeof skillName !== 'string') {
    return { valid: false, error: 'Skill name must be a string' };
  }

  const trimmed = skillName.trim();

  // Check length (2-50 characters)
  if (trimmed.length < 2) {
    return { valid: false, error: 'Skill must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Skill must be less than 50 characters' };
  }

  // Check for repeated characters (aaaaaaa, 12121212, etc)
  if (/(.)\1{5,}/.test(trimmed)) {
    return { valid: false, error: 'Skill contains too many repeated characters' };
  }

  // Check for excessive numbers
  if (/\d{10,}/.test(trimmed)) {
    return { valid: false, error: 'Skill contains too many numbers' };
  }

  // Allow letters, numbers, spaces, hyphens, ampersands, slashes, plus signs
  if (!/^[a-zA-Z0-9\s\-&+/]+$/.test(trimmed)) {
    return { valid: false, error: 'Skill can only contain letters, numbers, spaces, and basic symbols (&, +, /)' };
  }

  return { valid: true };
};

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
 * Get user profile by ID (works for any user)
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
 * Save or update user profile
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
   SEARCH & DISCOVERY ENDPOINTS
===================================================== */

/**
 * Search for users by name or skills
 */
app.post('/api/search-users', async (req, res) => {
  const { query, excludeUserId } = req.body;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  try {
    const searchTerm = `%${query}%`;
    
    let dbQuery = supabase
      .from('profiles')
      .select('id, full_name, bio, avatar_url, skills_teaching, skills_learning, neighborhood_name, reputation_score, city, hourly_rate')
      .or(`full_name.ilike.${searchTerm},bio.ilike.${searchTerm}`);

    if (excludeUserId) {
      dbQuery = dbQuery.neq('id', excludeUserId);
    }

    const { data, error } = await dbQuery.limit(20);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

/* =====================================================
   SKILLS ENDPOINTS
===================================================== */

/**
 * Validate and add skill to user
 */
app.post('/api/add-skill', async (req, res) => {
  const { userId, skillName, skillType } = req.body;

  if (!userId || !skillName || !skillType) {
    return res.status(400).json({ error: 'User ID, skill name, and skill type required' });
  }

  if (!['teaching', 'learning'].includes(skillType)) {
    return res.status(400).json({ error: 'Skill type must be "teaching" or "learning"' });
  }

  // Validate skill name format
  const validation = validateSkillName(skillName);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    // Check validity with Perspective API and relevance checks
    const validityCheck = await checkSkillValidity(skillName);

    if (!validityCheck.isValid) {
      return res.status(400).json({ error: validityCheck.reason });
    }

    const cleanSkillName = skillName.trim().toLowerCase();

    // Get current skills array
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(skillType === 'teaching' ? 'skills_teaching' : 'skills_learning')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const skillsArray = skillType === 'teaching' ? (profile?.skills_teaching || []) : (profile?.skills_learning || []);

    // Check if skill already exists
    if (skillsArray.some(s => s.toLowerCase() === cleanSkillName)) {
      return res.status(409).json({ error: 'User already has this skill' });
    }

    // Add skill to array
    const updatedSkills = [...skillsArray, cleanSkillName];

    const updateData = skillType === 'teaching' 
      ? { skills_teaching: updatedSkills }
      : { skills_learning: updatedSkills };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ 
      success: true, 
      skill: cleanSkillName,
      skillType,
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ error: 'Failed to add skill' });
  }
});

/**
 * Remove skill from user
 */
app.post('/api/remove-skill', async (req, res) => {
  const { userId, skillName, skillType } = req.body;

  if (!userId || !skillName || !skillType) {
    return res.status(400).json({ error: 'User ID, skill name, and skill type required' });
  }

  try {
    const cleanSkillName = skillName.trim().toLowerCase();

    const updateData = skillType === 'teaching' 
      ? { skills_teaching: null }
      : { skills_learning: null };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(skillType === 'teaching' ? 'skills_teaching' : 'skills_learning')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const skillsArray = skillType === 'teaching' ? (profile?.skills_teaching || []) : (profile?.skills_learning || []);
    const updatedSkills = skillsArray.filter(s => s.toLowerCase() !== cleanSkillName);

    const finalUpdateData = skillType === 'teaching' 
      ? { skills_teaching: updatedSkills }
      : { skills_learning: updatedSkills };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(finalUpdateData)
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({ error: 'Failed to remove skill' });
  }
});

/**
 * Find users by skill
 */
app.post('/api/find-users-by-skill', async (req, res) => {
  const { skillName, skillType, excludeUserId } = req.body;

  if (!skillName) {
    return res.status(400).json({ error: 'Skill name required' });
  }

  try {
    const cleanSkillName = skillName.trim().toLowerCase();
    let query = supabase
      .from('profiles')
      .select('id, full_name, bio, neighborhood_name, avatar_url, reputation_score, skills_teaching, skills_learning, city');

    const { data, error } = await query;

    if (error) throw error;

    // Filter on backend for skill matching
    let filteredUsers = data.filter(user => {
      const teachingSkills = (user.skills_teaching || []).map(s => s.toLowerCase());
      const learningSkills = (user.skills_learning || []).map(s => s.toLowerCase());

      if (skillType === 'teaching') {
        return teachingSkills.includes(cleanSkillName);
      } else if (skillType === 'learning') {
        return learningSkills.includes(cleanSkillName);
      }

      return teachingSkills.includes(cleanSkillName) || learningSkills.includes(cleanSkillName);
    });

    if (excludeUserId) {
      filteredUsers = filteredUsers.filter(u => u.id !== excludeUserId);
    }

    res.json(filteredUsers);
  } catch (error) {
    console.error('Find users by skill error:', error);
    res.status(500).json({ error: 'Failed to find users' });
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