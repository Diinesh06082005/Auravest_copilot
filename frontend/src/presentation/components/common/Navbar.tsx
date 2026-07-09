import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Sun, Moon, Bell, Search, Loader2, Sparkles, X, 
  CornerDownLeft, Compass, Settings, LayoutDashboard, 
  BarChart3, FileText, Brain, History
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuthStore } from '../../../business/store/auth.store';
import { useResearchStore } from '../../../business/store/research.store';
import { useNavigate } from 'react-router-dom';
import { useResearchReportsQuery } from '../../../business/hooks/useResearch';

interface NavbarProps {
  onMenuOpen: () => void;
}

export function Navbar({ onMenuOpen }: NavbarProps) {
  console.log("=== Navbar rendering component ===");
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'DK';
  
  const { startResearch, loading } = useResearchStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved reports for autocomplete
  const { data: reports = [] } = useResearchReportsQuery();

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('copilot_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (err) {}
    }
  }, [isCommandPaletteOpen]);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim().toUpperCase();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('copilot_recent_searches', JSON.stringify(updated));
  };

  // Keyboard listeners for command palette toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [commandQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => {
        commandInputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCommandQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCommandPaletteOpen]);

  // Build items list
  const getPaletteItems = () => {
    const q = commandQuery.trim().toLowerCase();
    
    // 1. Navigation items
    const navItems = [
      { id: 'nav-dashboard', label: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => { navigate('/'); setIsCommandPaletteOpen(false); } },
      { id: 'nav-research', label: 'Go to Research Company', category: 'Navigation', icon: Compass, action: () => { navigate('/research'); setIsCommandPaletteOpen(false); } },
      { id: 'nav-portfolio', label: 'Go to Portfolio Simulator', category: 'Navigation', icon: BarChart3, action: () => { navigate('/portfolio'); setIsCommandPaletteOpen(false); } },
      { id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', icon: Settings, action: () => { navigate('/settings'); setIsCommandPaletteOpen(false); } },
    ];

    // 2. Preferences
    const prefItems = [
      { id: 'theme-light', label: 'Switch to Light Theme', category: 'Preferences', icon: Sun, action: () => { setTheme('light'); setIsCommandPaletteOpen(false); } },
      { id: 'theme-dark', label: 'Switch to Dark Theme', category: 'Preferences', icon: Moon, action: () => { setTheme('dark'); setIsCommandPaletteOpen(false); } },
      { id: 'theme-glass', label: 'Switch to Glass Theme (Glassmorphism)', category: 'Preferences', icon: Sparkles, action: () => { setTheme('glass'); setIsCommandPaletteOpen(false); } },
    ];

    // 3. Saved Reports matching query
    const reportItems = reports.map(r => ({
      id: `report-${r.ticker}`,
      label: `Open Saved Report for ${r.ticker} (${r.title})`,
      category: 'Saved Reports',
      icon: FileText,
      action: () => {
        useResearchStore.getState().openHistoricalReport(r.ticker);
        navigate('/');
        setIsCommandPaletteOpen(false);
      }
    }));

    const allStatic = [...navItems, ...prefItems, ...reportItems];

    if (!q) {
      // If query is empty, return recent searches + navigation + preferences + top saved reports
      const recentItems = recentSearches.map(s => ({
        id: `recent-${s}`,
        label: `Research "${s}"`,
        category: 'Recent Searches',
        icon: History,
        action: () => {
          startResearch(s);
          saveRecentSearch(s);
          navigate('/');
          setIsCommandPaletteOpen(false);
        }
      }));

      return [
        ...recentItems,
        ...navItems,
        ...prefItems,
        ...reportItems.slice(0, 3)
      ];
    }

    // If query is present, filter static items + show dynamic research option
    const filteredStatic = allStatic.filter(item => 
      item.label.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q)
    );

    // Add "Run workflow" dynamic option if it looks like a ticker
    const isTickerLike = /^[A-Za-z0-9.]{1,6}$/.test(q);
    const workflowItem = isTickerLike ? [{
      id: 'run-workflow-dynamic',
      label: `Run AI Research Workflow for "${q.toUpperCase()}"`,
      category: 'AI Workflows',
      icon: Brain,
      action: () => {
        startResearch(q.toUpperCase());
        saveRecentSearch(q.toUpperCase());
        navigate('/');
        setIsCommandPaletteOpen(false);
      }
    }] : [];

    return [
      ...workflowItem,
      ...filteredStatic
    ];
  };

  const paletteItems = getPaletteItems();

  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % paletteItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + paletteItems.length) % paletteItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (paletteItems[selectedIndex]) {
        paletteItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/40 text-slate-900 dark:text-white transition-all duration-300">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={onMenuOpen}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search Trigger for Mobile */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden border border-slate-205 dark:border-slate-800"
            aria-label="Search everything"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Global Search Bar (Trigger) */}
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="relative w-full hidden md:block cursor-pointer group"
          >
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-4 text-xs font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition duration-200 flex items-center">
              Search everything (e.g. Apple, TSLA, settings, theme)...
            </div>
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 group-hover:text-slate-350 transition duration-200" />
            <div className="absolute right-3 top-1.5 hidden items-center gap-0.5 rounded border border-slate-200 bg-white px-1 text-[9px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-950 md:flex">
              <span>⌘</span><span>K</span>
            </div>
          </div>
        </div>

      <div className="flex items-center gap-6">
        {/* AI Agent Status Badge */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-900/30 bg-emerald-950/20 px-3.5 py-1 text-[10px] font-black text-emerald-500 dark:border-emerald-800/40 lg:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          AI Agent Online <span className="text-slate-400 font-semibold">| All systems operational</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-600"></span>
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl glass-card p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                    <span className="text-xs font-black text-slate-905 dark:text-white">Notifications</span>
                    <span className="text-[9px] font-bold text-blue-500 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="mt-2.5 space-y-3 max-h-60 overflow-y-auto">
                    <div className="flex gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10.5px] font-bold text-slate-850 dark:text-slate-200">GOOGL report compiled successfully</p>
                        <span className="text-[8.5px] text-slate-400 block mt-0.5">5 mins ago</span>
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10.5px] font-bold text-slate-850 dark:text-slate-200">AAPL target price updated to $210</p>
                        <span className="text-[8.5px] text-slate-400 block mt-0.5">1 hour ago</span>
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <div className="h-2 w-2 rounded-full bg-slate-450 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10.5px] font-semibold text-slate-550 dark:text-slate-400">Market Alert: TSLA down 2.2% today</p>
                        <span className="text-[8.5px] text-slate-450 block mt-0.5">4 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggler */}
          <button
            onClick={() => {
              if (theme === 'light') setTheme('dark');
              else if (theme === 'dark') setTheme('glass');
              else setTheme('light');
            }}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:bg-slate-800 relative group"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4 text-indigo-400" />
            ) : theme === 'glass' ? (
              <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
            
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-slate-905 px-2 py-1 text-[9px] font-bold text-white group-hover:scale-100 transition-all duration-200 uppercase z-50 whitespace-nowrap shadow-md">
              {theme} Mode
            </span>
          </button>
        </div>

        {/* User Profile Info */}
        <div className="relative flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-850">
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-black text-slate-850 dark:text-white leading-none">
                {user?.name || 'Dinesh'}
              </span>
              <span className="text-[9px] text-slate-400 font-bold dark:text-blue-400 mt-1 uppercase">
                Premium Account
              </span>
            </div>

            <div className="relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-8.5 w-8.5 rounded-full border border-slate-200 dark:border-slate-800" />
              ) : (
                <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-650 flex items-center justify-center font-black text-xs text-white uppercase shadow-sm">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 rounded-full bg-blue-600 px-1 text-[7px] font-black text-white uppercase border border-white dark:border-slate-900">
                Pro
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-36 w-48 rounded-2xl glass-card p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-200/60 dark:border-slate-800/60">
                  <p className="text-xs font-black text-slate-950 dark:text-white truncate">{user?.name || 'Dinesh'}</p>
                  <p className="text-[9.5px] text-slate-400 font-semibold truncate mt-0.5">{user?.email || 'test@example.com'}</p>
                </div>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left rounded-xl px-3.5 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200 transition-colors"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/research');
                    }}
                    className="w-full text-left rounded-xl px-3.5 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200 transition-colors"
                  >
                    Saved Reports
                  </button>
                  <div className="border-t border-slate-100 my-1 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full text-left rounded-xl px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 dark:hover:text-rose-455 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    {/* Search Everything Command Palette Modal */}
    {isCommandPaletteOpen && (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
        {/* Backdrop blur overlay */}
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setIsCommandPaletteOpen(false)}
        />

        {/* Dialog Panel */}
        <div className="relative w-full max-w-xl rounded-2xl border border-slate-200/50 bg-white/90 p-0 shadow-2xl backdrop-blur-xl dark:border-slate-800/40 dark:bg-[#0B0F19]/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[60vh] z-50">
          
          {/* Input Row */}
          <div className="flex items-center gap-3 border-b border-slate-200/60 px-4 py-3.5 dark:border-slate-800/50">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              ref={commandInputRef}
              type="text"
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              onKeyDown={handlePaletteKeyDown}
              placeholder="Search ticker, page, command or settings..."
              className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-sm font-semibold"
            />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 border border-slate-200/80 dark:border-slate-800 rounded px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900">
                ESC
              </span>
            </div>
            <button 
              onClick={() => setIsCommandPaletteOpen(false)}
              className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Scrollable Results Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {paletteItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <p className="text-xs font-bold">No results found for "{commandQuery}"</p>
                <p className="text-[10px] mt-1">Try another ticker symbol or navigation keyword.</p>
              </div>
            ) : (
              paletteItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                // Render category header if it's the first item of that category
                const showHeader = idx === 0 || paletteItems[idx - 1].category !== item.category;

                return (
                  <div key={item.id}>
                    {showHeader && (
                      <div className="px-3.5 py-1.5 text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                        {item.category}
                      </div>
                    )}
                    <button
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-left transition duration-150 ${
                        isSelected 
                          ? 'bg-blue-50/80 text-blue-600 dark:bg-blue-955/40 dark:text-blue-400 border border-blue-105/30' 
                          : 'text-slate-655 dark:text-slate-350 hover:bg-slate-50/40 dark:hover:bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-blue-505' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1 text-[9px] font-semibold text-blue-500 dark:text-blue-400 bg-blue-100/30 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-500/20">
                          <span>Select</span>
                          <CornerDownLeft className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Command Palette Footer */}
          <div className="border-t border-slate-205/60 dark:border-slate-805/50 px-4 py-2 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
            </div>
            <div>
              <span>Press <kbd className="font-bold">⌘K</kbd> to toggle</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
