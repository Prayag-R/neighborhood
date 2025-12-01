// src/pages/Landing.jsx
import { useState, useEffect } from 'react';
import { Users, ArrowRight, Moon, Sun, Zap, Award, Network, ChevronsDown, Search, Compass, Lightbulb, TrendingUp, BookOpen, Target, Link2, Trophy, Map, Heart } from 'lucide-react';
import SignInOverlay from './SignInOverlay';

const iconMap = { Zap, Award, Users, Search, Compass, Lightbulb, TrendingUp, BookOpen, Target, Link2, Trophy, Map, Network, Heart };

const ORBITAL_NODES_DATA = [
  { id: 1, icon: 'Search', color: 'from-blue-500 to-blue-600', size: 24, orbit: 100, speed: 20, info: 'Search for skills available now.', initialDelayPercent: Math.random() * 100 },
  { id: 2, icon: 'Users', color: 'from-purple-500 to-purple-600', size: 24, orbit: 130, speed: 20, info: 'Connect with neighbors.', initialDelayPercent: Math.random() * 100 },
  { id: 3, icon: 'Heart', color: 'from-red-500 to-red-600', size: 24, orbit: 160, speed: 20, info: 'Share what you love.', initialDelayPercent: Math.random() * 100 },
  { id: 4, icon: 'Lightbulb', color: 'from-amber-500 to-amber-600', size: 24, orbit: 190, speed: 20, info: 'Discover opportunities.', initialDelayPercent: Math.random() * 100 },
  { id: 5, icon: 'Compass', color: 'from-cyan-500 to-cyan-600', size: 24, orbit: 220, speed: 20, info: 'Navigate your path.', initialDelayPercent: Math.random() * 100 },
];

export default function Landing({ darkMode, setDarkMode, onSignInSuccess }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers for the Sign In Overlay
  const handleGetStarted = () => {
    setShowSignIn(true);
  };

  const handleBack = () => setShowSignIn(false);

  const handleSignInSuccess = (userData) => {
    setShowSignIn(false);
    // Save user ID to localStorage for persistence
    localStorage.setItem('skillshare_user_id', userData.id);
    // Pass the user data back to App.js
    if (onSignInSuccess) {
      onSignInSuccess(userData);
    }
  };

  const isDark = darkMode;
  const colors = isDark
    ? { bg: 'from-gray-950 via-green-950 to-gray-950', navBg: 'bg-gray-900/80', border: 'border-green-800/50', text: 'text-white', textMuted: 'text-gray-400', primary: 'from-green-500 to-emerald-500', accent: 'text-green-400', cardBg: 'bg-gray-800/60', shadow: 'shadow-2xl shadow-green-900/40' }
    : { bg: 'from-white via-green-50 to-emerald-50', navBg: 'bg-white/80', border: 'border-green-200', text: 'text-green-950', textMuted: 'text-green-700', primary: 'from-green-600 to-emerald-600', accent: 'text-green-600', cardBg: 'bg-white/90', shadow: 'shadow-xl shadow-green-100/50' };

  const handleSignup = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colors.bg} overflow-x-hidden ${colors.text} font-sans`}>
      <style jsx>{`
        @keyframes pulse-gentle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4); } 50% { box-shadow: 0 0 50px rgba(16, 185, 129, 1), 0 0 80px rgba(16, 185, 129, 0.6); } }
        .network-center-pulse { animation: glow-pulse 2.5s ease-in-out infinite; }
        .orbital-node { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        ${ORBITAL_NODES_DATA.map(node => `
          @keyframes orbit-${node.id} {
            0% { transform: rotate(0deg) translateX(${node.orbit}px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(${node.orbit}px) rotate(-360deg); }
          }
          .node-${node.id} { animation: orbit-${node.id} ${node.speed}s linear infinite; animation-delay: -${(node.initialDelayPercent / 100) * node.speed}s; }
          .node-${node.id}.paused { animation-play-state: paused; }
        `).join('')}
      `}</style>

      {/* Navigation */}
      <nav className={`border-b ${colors.border} sticky top-0 ${colors.navBg} backdrop-blur-md z-50 transition-shadow ${scrollY > 50 ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 bg-gradient-to-br ${colors.primary} rounded-full flex items-center justify-center ${colors.shadow}`}>
              <Network size={18} className="text-white" />
            </div>
            <span className={`font-extrabold text-2xl ${colors.text}`}>SkillShare</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className={`hidden md:inline ${colors.textMuted} font-medium hover:${colors.accent} transition`}>Features</a>
            <a href="#network" className={`hidden md:inline ${colors.textMuted} font-medium hover:${colors.accent} transition`}>Network</a>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition ${isDark ? 'bg-gray-700' : 'bg-green-100'}`}>
              {isDark ? <Sun size={20} className={colors.accent} /> : <Moon size={20} className={colors.accent} />}
            </button>
            <button onClick={handleGetStarted} className={`bg-gradient-to-r ${colors.primary} text-white px-6 py-2 rounded-full font-semibold ${colors.shadow} hover:scale-105 transition`}>Join Now</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-16 md:pt-12 md:pb-24 grid md:grid-cols-2 gap-12 items-center overflow-hidden relative z-10">
        <div className="text-center md:text-left">
          <span className={`text-xl font-bold ${colors.accent} tracking-wider`}>GIVE WHAT YOU CAN</span>
          <h1 className={`text-5xl md:text-7xl font-extrabold ${colors.text} mb-2 leading-tight`}>
            Neighbors helping neighbors, <span className={`bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent`}>grow your skills</span>
          </h1>
          <span className={`text-xl font-bold ${colors.accent} tracking-wider`}>GET WHAT YOU NEED</span>
          
          <p className={`text-xl ${colors.textMuted} max-w-xl my-10`}>
            Discover skill chains, complete quests, and unlock a vibrant community of learners right around you.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-3 max-w-lg p-2 rounded-full ${colors.cardBg} border border-green-500/30`}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSignup(e)}
              className={`flex-1 px-4 py-3 rounded-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-green-950'} focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <button onClick={handleGetStarted} className={`bg-gradient-to-r ${colors.primary} text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 hover:shadow-xl transition`}>
              Join Now <ArrowRight size={18} />
            </button>
          </div>
          {submitted && <p className="text-green-500 font-medium mt-3">Success! Check your email.</p>}
        </div>

        {/* Network Visual */}
        <div className="relative h-[450px] w-full max-w-[450px] mx-auto flex items-center justify-center">
          <svg className="absolute w-full h-full" viewBox="0 0 450 450">
            {ORBITAL_NODES_DATA.map((node, i) => (
              <circle key={`orbit-${i}`} cx="225" cy="225" r={node.orbit} fill="none" stroke={isDark ? '#10b98130' : '#05966930'} strokeWidth="1" strokeDasharray={node.orbit > 150 ? '4 4' : '2 2'} />
            ))}
          </svg>

          <div className="absolute w-[450px] h-[450px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg network-center-pulse`}>
                <Network size={40} className="text-white" />
              </div>
            </div>

            {/* Orbiting Nodes */}
            {ORBITAL_NODES_DATA.map((node) => {
              const IconComponent = iconMap[node.icon];
              return (
                <div
                  key={node.id}
                  className={`orbital-node node-${node.id} ${hoveredNodeId === node.id ? 'paused' : ''}`}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${node.color} flex items-center justify-center shadow-lg hover:scale-125 cursor-pointer transition`}>
                      <IconComponent size={20} className="text-white" />
                    </div>
                    {hoveredNodeId === node.id && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 text-xs whitespace-nowrap rounded-lg bg-green-700 text-white font-semibold shadow-xl z-50">
                        {node.info}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-50 animate-pulse"><ChevronsDown size={30} className={colors.accent} /></div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: TrendingUp, title: 'Skill Chains', desc: 'Discover the shortest path to any skill through your network.' },
            { icon: Award, title: 'Reputation System', desc: 'Earn verified credit by teaching and learning.' },
            { icon: Zap, title: 'Live Skill Map', desc: 'Instantly see learning opportunities in your neighborhood.' }
          ].map((item, i) => (
            <div key={i} className={`p-8 ${colors.cardBg} rounded-3xl border border-green-500/20 hover:scale-105 transition ${colors.shadow} hover:shadow-xl cursor-pointer group`}>
              <item.icon className={`${colors.accent} mb-5 group-hover:scale-110 transition`} size={40} />
              <h3 className={`font-bold text-xl ${colors.text} mb-2`}>{item.title}</h3>
              <p className={`${colors.textMuted}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Features */}
      <section id="features" className={`py-32 relative z-10 ${isDark ? 'bg-gray-900/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-5xl font-extrabold mb-4 text-center ${colors.text}`}>What Makes SkillShare Different</h2>
          <p className={`text-xl ${colors.textMuted} max-w-3xl mx-auto mb-20 text-center`}>Building social capital in your local community.</p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { icon: Link2, title: 'Intelligent Skill Chains', desc: 'Find the optimal path: Start with JavaScript from Mike → Python from Sarah. See how many degrees away you are from any skill.' },
              { icon: Trophy, title: 'Reputation Multiplier', desc: 'Earn verified points for teaching AND learning. Unlock exclusive badges and community status.' },
              { icon: Map, title: 'Dynamic Live Skill Map', desc: 'See immediate opportunities. Sarah teaching Spanish in 10 min, or 5 people wanting to learn guitar.' },
              { icon: Target, title: 'Neighborhood Quests', desc: 'Monthly challenges like "Learn 3 new skills". Gamify your development and unlock recognition.' },
              { icon: BookOpen, title: 'The Skill Commons', desc: 'Crowdsourced knowledge built by your community. Repair guides, recipes, workout spots.' },
              { icon: Network, title: 'Built for Community', desc: 'Unlike marketplaces, SkillShare is a genuine social network. Build real relationships.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 p-4 rounded-xl hover:bg-gradient-to-br hover:from-green-500/10 hover:to-emerald-500/10 group cursor-pointer transition">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.primary} flex items-center justify-center flex-shrink-0 ${colors.shadow} group-hover:scale-105 transition`}>
                  <item.icon size={28} className="text-white" />
                </div>
                <div>
                  <h3 className={`font-bold text-xl ${colors.text} mb-2`}>{item.title}</h3>
                  <p className={`${colors.textMuted}`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Section */}
      <section id="network" className={`py-32 relative z-10 border-t ${colors.border}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-5xl font-extrabold mb-4 text-center ${colors.text}`}>Your Local Skill Ecosystem</h2>
          <p className={`text-xl ${colors.textMuted} max-w-2xl mx-auto mb-16 text-center`}>A living map of hyperlocal knowledge and potential.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Compass, title: 'Navigate Skill Paths', desc: 'Find the quickest route to acquire a new ability, guided by peer reputation.' },
              { icon: Users, title: 'Hyper-local Focus', desc: 'Meet real neighbors with complementary skills, not anonymous profiles.' },
              { icon: Zap, title: 'Instant Connections', desc: 'Get matched with people actively looking to learn or teach what you need.' }
            ].map((item, i) => (
              <div key={i} className={`text-center p-8 rounded-2xl ${colors.cardBg} border border-green-500/20 hover:shadow-xl hover:scale-105 transition group`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${colors.primary} rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl group-hover:scale-105 transition`}>
                  <item.icon size={30} />
                </div>
                <h3 className={`font-bold text-xl ${colors.text} mb-3`}>{item.title}</h3>
                <p className={colors.textMuted}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`py-32 relative z-10 ${isDark ? 'bg-gray-900' : 'bg-green-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <h2 className={`text-5xl font-extrabold mb-16 text-center ${colors.text}`}>A Simple Path to Connection</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Curate Profile', desc: 'List your skills (Teach) and desired skills (Learn).' },
              { step: '2', title: 'Explore the Map', desc: 'Visualize the Skill Chain and see how to get there.' },
              { step: '3', title: 'Engage & Earn', desc: 'Send requests, complete Quests, build Reputation.' },
              { step: '4', title: 'Sustain Growth', desc: 'Turn new knowledge into teaching opportunities.' }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${colors.primary} rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-2xl group-hover:scale-105 group-hover:ring-4 ring-green-500/50 transition`}>{item.step}</div>
                <h3 className={`font-bold text-xl ${colors.text} mb-3`}>{item.title}</h3>
                <p className={colors.textMuted}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`bg-gradient-to-r ${colors.primary} py-20 px-6 relative z-10`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold mb-8 text-white">Ready to Unlock Your Neighborhood's Potential?</h2>
          <button onClick={handleGetStarted} className="bg-white text-green-700 hover:bg-gray-50 px-10 py-4 rounded-full font-extrabold text-lg transition hover:scale-105 shadow-2xl">
            Start Your Journey Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-gray-950' : 'bg-green-50'} border-t ${colors.border} py-16 px-6 relative z-10`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-8 h-8 bg-gradient-to-br ${colors.primary} rounded-lg flex items-center justify-center`}>
              <Network size={18} className="text-white" />
            </div>
            <span className={`font-extrabold text-xl ${colors.text}`}>SkillShare</span>
          </div>
          <p className={colors.textMuted}>Building hyperlocal communities through shared skills and genuine connections.</p>
          <div className={`text-sm ${colors.textMuted} mt-6 flex justify-center gap-6`}>
            <span>&copy; 2025 SkillShare. All rights reserved.</span>
            <a href="/privacy" className={`hover:${colors.accent} transition`}>Privacy</a>
            <a href="/terms" className={`hover:${colors.accent} transition`}>Terms</a>
          </div>
        </div>
      </footer>

      {/* Sign In Overlay */}
      {showSignIn && (
        <SignInOverlay
          onSignInSuccess={handleSignInSuccess}
          onBack={handleBack}
          isDark={isDark}
        />
      )}
    </div>
  );
}