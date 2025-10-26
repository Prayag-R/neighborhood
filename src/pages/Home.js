import React, { useState } from 'react';
import { TrendingUp, BookOpen, Target, Zap } from 'lucide-react';

export const Home = ({ setCurrentPage, setShowAuthModal }) => {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [hoverCount, setHoverCount] = useState(0);
  const [canClick, setCanClick] = useState(false);

  const moveButton = () => {
    const randomX = (Math.random() - 0.5) * 400;
    const randomY = (Math.random() - 0.5) * 300;
    setButtonPosition({ x: randomX, y: randomY });
    
    setHoverCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setCanClick(true);
      }
      return newCount;
    });
  };

  const handleButtonHover = () => {
    if (!canClick) {
      moveButton();
    }
  };

  const handleButtonClick = () => {
    if (canClick) {
      setButtonPosition({ x: 0, y: 0 });
      setTimeout(() => {
        setShowAuthModal?.(true);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden -mt-20 pt-20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-slate-900/40" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(79, 172, 254, .05) 25%, rgba(79, 172, 254, .05) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, .05) 75%, rgba(79, 172, 254, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(79, 172, 254, .05) 25%, rgba(79, 172, 254, .05) 26%, transparent 27%, transparent 74%, rgba(79, 172, 254, .05) 75%, rgba(79, 172, 254, .05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* Top gradient glow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-600/30 to-transparent blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-5 pt-0 pb-5 min-h-screen flex flex-col justify-center">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-black text-white leading-tight">
                  Master Your{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    Financial Future
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                  Whether you're just curious or ready to invest, StuStocks is built for high school students who want to understand stocks, investing, and the principles that drive wealth creation.
                </p>
              </div>

              {/* Button with moving animation */}
              <div className="pt-8 relative h-24 flex items-center">
                <button
                  onClick={handleButtonClick}
                  onMouseEnter={handleButtonHover}
                  className={`px-10 py-4 rounded-lg font-bold text-lg shadow-2xl transition-all duration-300 relative ${
                    canClick
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white scale-105 shadow-blue-500/50 cursor-pointer hover:scale-110'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-default'
                  }`}
                  style={{
                    transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
                    transition: !canClick ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'all 0.3s ease',
                  }}
                >
                  {canClick ? 'Get Started Now' : 'Get Started Now'}
                </button>
              </div>
            </div>

            {/* Right side - Animated cards */}
            <div className="space-y-6 hidden md:block">
              {/* Animated stats cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/30 text-center animate-slide-up">
                  <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">1000+</div>
                  <div className="text-xs text-gray-400 mt-1">Students Trading</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-400/30 text-center animate-slide-up animation-delay-1000">
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">$500M+</div>
                  <div className="text-xs text-gray-400 mt-1">Virtual Trades</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-400/30 text-center animate-slide-up animation-delay-2000">
                  <div className="text-3xl font-black bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">100%</div>
                  <div className="text-xs text-gray-400 mt-1">Free Forever</div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Card 1 */}
                <div className="group p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/15 animate-slide-up">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-all">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2">Learn at Your Pace</h3>
                      <p className="text-gray-300 text-sm">Interactive lessons on stocks, ETFs, diversification, and investment strategies tailored for your level.</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="group p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/15 animate-slide-up animation-delay-1000">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-all">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2">Practice Risk-Free</h3>
                      <p className="text-gray-300 text-sm">Trade with virtual money across 5 major stocks with real-time data. No real money, real learning.</p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="group p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-pink-400/50 transition-all duration-300 hover:bg-white/15 animate-slide-up animation-delay-2000">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-pink-500/20 group-hover:bg-pink-500/30 transition-all">
                      <Target className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2">Build Real Skills</h3>
                      <p className="text-gray-300 text-sm">Develop financial literacy that lasts. Understand P/E ratios, portfolio diversification, and investment principles.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="text-center mb-16 space-y-4 animate-fade-in animation-delay-1000">
            <h2 className="text-4xl md:text-5xl font-black text-white">Why Choose StuStocks?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto"></p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Real-time data and instant trade execution' },
              { icon: BookOpen, title: 'AI Tutor', desc: 'Ask anything about finance, investing, and stocks' },
              { icon: Target, title: 'Multiple Modes', desc: 'Easy, Medium, or Hard difficulty levels' },
              { icon: TrendingUp, title: 'Track Progress', desc: 'Save your portfolio and learning across sessions' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-300 group hover:scale-105"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${0.1 * idx}s both`,
                  }}
                >
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 w-fit mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-6xl mx-auto px-8 py-20 text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/20 animate-fade-in animation-delay-2000">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Start Your Financial Journey?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of high school students learning to invest smarter, trade better, and build wealth from today.</p>
            <button
              onClick={handleButtonClick}
              onMouseEnter={handleButtonHover}
              className={`px-12 py-4 rounded-lg font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-all duration-300 shadow-2xl relative ${
                canClick ? 'hover:scale-110 cursor-pointer' : 'cursor-default hover:scale-100'
              }`}
              style={{
                transform: `translate(${buttonPosition.x * 0.3}px, ${buttonPosition.y * 0.3}px)`,
                transition: !canClick ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'all 0.3s ease',
              }}
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};