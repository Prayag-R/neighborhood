import React, { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { PaperTrader } from './pages/PaperTrader';


const Nav = ({ currentPage, setCurrentPage }) => {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <nav className="w-full backdrop-blur-md bg-slate-900/70 border-b border-white/10 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          {/* Logo stays on the left */}
          <button
            onClick={() => setCurrentPage('home')}
            className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 cursor-pointer"
          >
            StuStocks
          </button>

          {/* Everything else pushed to the right */}
          <div className="flex gap-8 items-center ml-auto">
            <button
              onClick={() => setCurrentPage('learn')}
              className={`text-gray-300 hover:text-white font-medium transition ${
                currentPage === 'learn' ? 'text-white' : ''
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => setCurrentPage('paper')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:scale-105 transition transform shadow-lg"
            >
              Paper Trading
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  <User className="w-5 h-5 text-gray-300" />
                  <span className="text-gray-300 font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-md rounded-lg shadow-xl border border-white/10 py-2">
                    <button
                      onClick={async () => {
                        await signOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2.5 border-2 border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/20 font-medium transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {}}
      />
    </>
  );
};


function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen flex flex-col">
      <Nav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1">
        {currentPage === 'home' && <Home />}
        {currentPage === 'learn' && <Learn />}
        {currentPage === 'paper' && <PaperTrader />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}