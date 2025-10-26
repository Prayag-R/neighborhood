import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const Learn = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const recommendations = [
    'What is the P/E ratio?',
    'How does diversification work?',
    'Explain stock splits.',
    'What is a dividend?',
  ];

  useEffect(() => {
    if (user) {
      loadChatsFromDB();
    } else {
      loadChatsFromLocalStorage();
    }
  }, [user]);

  const loadChatsFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('learnChats');
      const savedChats = saved ? JSON.parse(saved) : [];
      setChats(savedChats);

      const savedChatId = localStorage.getItem('currentChatId');
      setCurrentChatId(savedChatId || null);
    } catch {
      setChats([]);
    }
  };

  const loadChatsFromDB = async () => {
    if (!user) return;

    const { data: dbChats } = await supabase
      .from('user_chats')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbChats) {
      const chatsWithMessages = await Promise.all(
        dbChats.map(async (chat) => {
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false });

          return {
            id: chat.id,
            title: chat.title,
            history: messages
              ? messages.map((m) => ({ role: m.role, text: m.content }))
              : [],
            createdAt: new Date(chat.created_at).toLocaleString(),
          };
        })
      );

      setChats(chatsWithMessages);
      if (chatsWithMessages.length > 0 && !currentChatId) {
        setCurrentChatId(chatsWithMessages[0].id);
      }
    }
  };

  const saveChatsToLocalStorage = (updatedChats) => {
    try {
      localStorage.setItem('learnChats', JSON.stringify(updatedChats));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  };

  const saveChatToDB = async (chat) => {
    if (!user) return;

    const { data: existingChat } = await supabase
      .from('user_chats')
      .select('id')
      .eq('id', chat.id)
      .maybeSingle();

    if (!existingChat) {
      await supabase.from('user_chats').insert({
        id: chat.id,
        user_id: user.id,
        title: chat.title,
      });
    } else {
      await supabase
        .from('user_chats')
        .update({ title: chat.title })
        .eq('id', chat.id);
    }
  };

  const saveMessageToDB = async (chatId, role, content) => {
    if (!user) return;

    await supabase.from('chat_messages').insert({
      chat_id: chatId,
      user_id: user.id,
      role,
      content,
    });
  };

  const cleanText = (text) => {
    return text
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
      .replace(/\\\\/g, ' ')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\\([a-zA-Z]+)\s/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, (match) => match.replace(/\$/g, '').trim() || '')
      .replace(/\$([^\$]+)\$/g, (match, content) => content.trim());
  };

  const createNewChat = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    const newChatId = crypto.randomUUID();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      history: [],
      createdAt: new Date().toLocaleString(),
    };

    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChatId(newChatId);

    if (user) {
      await saveChatToDB(newChat);
    } else {
      saveChatsToLocalStorage(updatedChats);
    }
  };

  const currentChat = chats.find((c) => c.id === currentChatId);

  const deleteChat = async (chatId) => {
    if (user) {
      await supabase.from('user_chats').delete().eq('id', chatId);
    }

    const updatedChats = chats.filter((c) => c.id !== chatId);
    setChats(updatedChats);

    if (currentChatId === chatId) {
      setCurrentChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }

    if (!user) {
      saveChatsToLocalStorage(updatedChats);
    }
  };

  const sendPrompt = async (text) => {
    if (!text.trim() || !currentChat) return;
    setLoading(true);

    const updatedChats = chats.map((c) => {
      if (c.id === currentChatId) {
        return {
          ...c,
          history: [{ role: 'user', text }, ...c.history],
          title: c.history.length === 0 ? text.substring(0, 30) : c.title,
        };
      }
      return c;
    });
    setChats(updatedChats);
    setPrompt('');

    if (user) {
      const updatedChat = updatedChats.find((c) => c.id === currentChatId);
      if (updatedChat) {
        await saveChatToDB(updatedChat);
        await saveMessageToDB(currentChatId, 'user', text);
      }
    } else {
      saveChatsToLocalStorage(updatedChats);
    }

    try {
      const chatToUpdate = updatedChats.find((c) => c.id === currentChatId);
      const res = await fetch('http://localhost:5000/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: chatToUpdate.history.slice(1),
        }),
      });
      const data = await res.json();
      let reply = data.reply || 'No response from API.';
      reply = cleanText(reply);

      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === currentChatId) {
            return {
              ...c,
              history: [{ role: 'assistant', text: reply }, ...c.history],
            };
          }
          return c;
        })
      );

      if (user) {
        await saveMessageToDB(currentChatId, 'assistant', reply);
      }
    } catch (err) {
      console.error('Backend error:', err);
      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c.id === currentChatId) {
            return {
              ...c,
              history: [
                { role: 'assistant', text: 'Error: Could not reach backend. Make sure localhost:5000 is running.' },
                ...c.history,
              ],
            };
          }
          return c;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(prompt);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] bg-slate-900 text-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-3 bg-slate-800/60 backdrop-blur-sm border-b border-white/10 flex-shrink-0 shadow-md">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Financial Learning Assistant
        </h2>
        <p className="text-sm text-gray-400">Ask questions about stocks, investing, and financial concepts</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 backdrop-blur-md border-r border-white/10 flex flex-col flex-shrink-0">
          <div className="p-4 flex-shrink-0">
            <button
              onClick={createNewChat}
              className="w-full mb-4 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 font-medium transition shadow-md"
            >
              + New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition border-l-4 ${
                  currentChatId === chat.id
                    ? 'bg-slate-700/60 border-blue-500'
                    : 'bg-slate-800/30 border-transparent hover:bg-slate-700/40'
                }`}
              >
                <div onClick={() => setCurrentChatId(chat.id)}>
                  <p className="font-semibold text-sm text-gray-100 truncate">{chat.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{chat.createdAt}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="mt-3 w-full text-red-400 hover:text-red-300 text-xs font-medium py-1 rounded transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {currentChat ? (
            <>
              <div className="flex-1 flex flex-col-reverse overflow-y-auto p-4 space-y-4 space-y-reverse">
                {currentChat.history.length === 0 && (
                  <div className="flex flex-col gap-3 justify-end items-end">
                    {recommendations.map((r) => (
                      <button
                        key={r}
                        onClick={() => setPrompt(r)}
                        className="px-4 py-3 bg-slate-700/60 text-blue-300 rounded-lg text-sm hover:bg-slate-700/80 transition font-medium"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                {currentChat.history.map((h, i) => (
                  <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
                        h.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none'
                          : 'bg-slate-800/70 text-gray-100 rounded-bl-none border border-white/10'
                      }`}
                    >
                      {h.role === 'assistant' ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: marked(h.text) }}
                          className="[&>*]:my-2 [&>p]:my-2 [&>strong]:font-semibold"
                        />
                      ) : (
                        <span>{h.text}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex-shrink-0 bg-slate-800/60 border-t border-white/10 p-4 backdrop-blur-md">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about finance, stocks, or investing..."
                    className="flex-1 h-12 p-3 bg-slate-900/60 text-gray-100 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm placeholder-gray-400"
                  />
                  <button
                    disabled={loading || !prompt.trim()}
                    onClick={() => sendPrompt(prompt)}
                    className="flex-shrink-0 p-2 text-blue-400 disabled:text-gray-600 hover:text-blue-300 transition"
                  >
                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={createNewChat}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 text-lg font-semibold shadow-lg transition"
              >
                Create Your First Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Prompt */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 text-gray-100 rounded-2xl p-8 max-w-md border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Sign in to save your chats</h3>
            <p className="text-gray-400 mb-6">Create an account to save your learning progress across devices.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="flex-1 px-4 py-2 border border-white/20 rounded-lg hover:bg-slate-700 transition"
              >
                Continue as Guest
              </button>
              <button
                onClick={() => {
                  setShowAuthPrompt(false);
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};