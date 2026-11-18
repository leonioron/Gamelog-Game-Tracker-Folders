import React from 'react';
import { useStore } from '../context/StoreContext';
import { ActiveView } from '../types';
import { Play, Bookmark, CheckCircle2, Sparkles, Heart, BookOpen } from 'lucide-react';

const SUB_TABS: { view: ActiveView; label: string; icon: React.ElementType }[] = [
  { view: 'playing', label: 'Jogando', icon: Play },
  { view: 'backlog', label: 'Backlog', icon: Bookmark },
  { view: 'completed', label: 'Zerados', icon: CheckCircle2 },
  { view: 'wishlist', label: 'Desejo', icon: Sparkles },
  { view: 'favorites', label: 'Favoritos', icon: Heart },
  { view: 'logs', label: 'Diário', icon: BookOpen },
];

export const AcervoSubNav: React.FC = () => {
  const { activeView, setActiveView } = useStore();

  const isVisible = SUB_TABS.some((t) => t.view === activeView);
  if (!isVisible) return null;

  return (
    <div className="md:hidden border-b border-white/5 bg-[#0e131e]">
      <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 scrollbar-none">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.view;
          return (
            <button
              key={tab.view}
              type="button"
              onClick={() => setActiveView(tab.view)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#121824] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
