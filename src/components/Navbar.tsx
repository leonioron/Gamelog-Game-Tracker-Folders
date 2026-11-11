import React from 'react';
import { useStore } from '../context/StoreContext';
import { ActiveView } from '../types';
import { Plus, Database, Sparkles, FolderTree, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    setIsBackupModalOpen,
    setIsCustomGameModalOpen,
    setIsImportBackloggdModalOpen,
    setSelectedFolderId,
    setSelectedListId,
    openListModal,
    openFolderModal
  } = useStore();

  const navLinks: { view: ActiveView; label: string }[] = [
    { view: 'overview', label: 'Perfil' },
    { view: 'folders', label: 'Pastas & Listas' },
    { view: 'playing', label: 'Jogando' },
    { view: 'backlog', label: 'Backlog' },
    { view: 'completed', label: 'Zerados' },
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
    <header className="sticky top-0 z-40 bg-[#0c0f17]/90 backdrop-blur-md border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none whitespace-nowrap shrink-0"
        >
          <span className="text-xl font-display font-extrabold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            Gamelog
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 rounded-lg ${
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

        {/* Zone 3: 1 primary action button + Import / Backup helpers */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsImportBackloggdModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
            title="Importar Pastas e Listas do Backloggd via URL ou HTML"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Importar Backloggd</span>
          </button>

          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 text-xs cursor-pointer"
            title="Backup e Dados JSON (pasta /backup)"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-mono text-[11px]">Backup</span>
          </button>

          <button
            onClick={() => {
              setActiveView('catalog');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm hover:shadow-indigo-500/25 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Jogo</span>
          </button>
        </div>

      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-white/5 scrollbar-none">
        {navLinks.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`px-3 py-1 text-xs font-medium whitespace-nowrap shrink-0 rounded-md transition-colors ${
                isActive
                  ? 'text-white bg-indigo-600/40 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
