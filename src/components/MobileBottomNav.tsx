import React from 'react';
import { useStore } from '../context/StoreContext';
import { ActiveView } from '../types';
import { Home, FolderTree, Layers, Gamepad2 } from 'lucide-react';

const ACERVO_VIEWS: ActiveView[] = ['playing', 'backlog', 'completed', 'wishlist', 'favorites', 'logs'];

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, setSelectedFolderId, setSelectedListId } = useStore();

  const isAcervoActive = ACERVO_VIEWS.includes(activeView);

  const tabs: {
    id: string;
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onSelect: () => void;
  }[] = [
    {
      id: 'overview',
      label: 'Início',
      icon: Home,
      isActive: activeView === 'overview',
      onSelect: () => {
        setActiveView('overview');
        setSelectedFolderId(null);
        setSelectedListId(null);
      },
    },
    {
      id: 'folders',
      label: 'Pastas',
      icon: FolderTree,
      isActive: activeView === 'folders',
      onSelect: () => {
        setActiveView('folders');
      },
    },
    {
      id: 'acervo',
      label: 'Acervo',
      icon: Layers,
      isActive: isAcervoActive,
      onSelect: () => {
        if (!isAcervoActive) {
          setActiveView('playing');
        }
        setSelectedFolderId(null);
        setSelectedListId(null);
      },
    },
    {
      id: 'catalog',
      label: 'Catálogo',
      icon: Gamepad2,
      isActive: activeView === 'catalog',
      onSelect: () => {
        setActiveView('catalog');
        setSelectedFolderId(null);
        setSelectedListId(null);
      },
    },
  ];

  return (
    <nav
      aria-label="Navegação principal mobile"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#090D14]/95 backdrop-blur-md border-t border-white/10 pb-safe-bottom"
    >
      <div className="grid grid-cols-4 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onSelect}
              className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 rounded-xl transition-colors cursor-pointer ${
                tab.isActive
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`px-3 py-1 rounded-full transition-colors ${
                  tab.isActive ? 'bg-indigo-500/15' : 'bg-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
