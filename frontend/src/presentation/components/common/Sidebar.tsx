import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Compass, GitCompare, BarChart3, Star, FileText, 
  Newspaper, BrainCircuit, LineChart, History, Download, User, 
  Settings, LogOut, X, ShieldAlert 
} from 'lucide-react';
import { useAuthStore } from '../../../business/store/auth.store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/research', label: 'Research Company', icon: Compass },
    { to: '/#compare', label: 'Compare Companies', icon: GitCompare },
    { to: '/portfolio', label: 'Portfolio Simulator', icon: BarChart3 },
    { to: '/#watchlist', label: 'Watchlist', icon: Star },
    { to: '/research', label: 'Saved Reports', icon: FileText },
    { to: '/#news', label: 'Market News', icon: Newspaper },
    { to: '/#ai-insights', label: 'AI Insights', icon: BrainCircuit },
    { to: '/#analytics', label: 'Analytics', icon: LineChart },
    { to: '/history', label: 'Search History', icon: History },
    { to: '/export', label: 'Export Reports', icon: Download },
    { to: '/settings', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const isLinkActive = (to: string, isActive: boolean) => {
    if (to.includes('#')) {
      const [path, hash] = to.split('#');
      return location.pathname === path && location.hash === `#${hash}`;
    }
    return isActive && !location.hash;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white/80 backdrop-blur-md transition-transform duration-300 dark:border-slate-800/40 dark:bg-[#0B0F19]/80 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/85 dark:border-slate-800/45">
          <div className="flex items-center gap-2.5">
            {/* Hexagonal AI Icon */}
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              AV
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xs tracking-wider text-blue-600 dark:text-blue-400 uppercase leading-none" style={{ textShadow: '0 0 10px rgba(59,130,246,0.6)' }}>AuraVest</span>
              <span className="text-[9px] text-slate-400 font-bold dark:text-blue-500/80 mt-0.5 uppercase tracking-widest">Research Copilot</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-850 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links (Scrollable area) */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3.5 py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isLinkActive(to, isActive)
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.55)] dark:bg-blue-600 dark:text-white dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-850 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {label}
            </NavLink>
          ))}
          
          {/* Logout button in standard nav list for symmetry */}
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide text-slate-550 hover:bg-slate-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-455 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            Logout
          </button>
        </nav>

        {/* Pro Banner Promo Box */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/40">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#1e293b] p-4 border border-slate-800 shadow-xl relative overflow-hidden group">
            {/* Background glowing mesh */}
            <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-600/10 blur-xl group-hover:bg-blue-600/20 transition-all duration-500" />
            <span className="text-[10px] font-black text-blue-455 tracking-widest uppercase">Upgrade to Pro</span>
            <ul className="mt-2 space-y-1 text-[9px] text-slate-350 font-medium">
              <li>• Unlimited Deep Research</li>
              <li>• PDF & Excel Export</li>
              <li>• Portfolio Backtesting</li>
              <li>• Priority AI Access</li>
            </ul>
            <button className="mt-3 w-full rounded-xl bg-blue-650 py-2 text-[10px] font-black text-white hover:bg-blue-600 transition-colors shadow-md active:scale-98">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
