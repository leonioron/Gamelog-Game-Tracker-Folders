import React from 'react';
import { useStore } from '../context/StoreContext';
import { ActiveView } from '../types';
import packageJson from '../../package.json';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSelectedFolderId,
    setSelectedListId,
  } = useStore();

  const navLinks: { view: ActiveView; label: string }[] = [
    { view: 'overview', label: 'Início' },
    { view: 'folders', label: 'Pastas' },
    { view: 'playing', label: 'Jogando' },
    { view: 'backlog', label: 'Backlog' },
    { view: 'completed', label: 'Zerados' },
    { view: 'wishlist', label: 'Desejo' },
    { view: 'favorites', label: 'Favoritos' },
    { view: 'logs', label: 'Diário' },
    { view: 'catalog', label: 'Catálogo' },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (view !== 'folders') {
      setSelectedFolderId(null);
      setSelectedListId(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 pt-safe-top bg-[#090D14]/95 backdrop-blur-md border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-4 min-w-0">
        {/* Brand wordmark + app version from package.json */}
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className="min-h-[44px] flex items-center gap-2.5 group cursor-pointer focus:outline-none whitespace-nowrap shrink-0 pr-2"
        >
          <img
            src="/assets/app-icon.svg"
            alt="Gamelog"
            className="w-7 h-7 rounded-lg shrink-0"
          />
          <span className="text-lg md:text-xl font-display font-extrabold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            Gamelog
          </span>
          <span className="text-[11px] font-mono tabular-nums text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">
            v{packageJson.version}
          </span>
        </button>

        {/* Desktop single-line navigation links */}
        <nav className="hidden md:flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-none">
          {navLinks.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNavClick(item.view)}
                className={`min-h-[44px] px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 rounded-lg cursor-pointer ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
