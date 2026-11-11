import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { ViewOverview } from './components/views/ViewOverview';
import { ViewFolders } from './components/views/ViewFolders';
import { ViewStatusGrid } from './components/views/ViewStatusGrid';
import { ViewLogs } from './components/views/ViewLogs';
import { ViewCatalog } from './components/views/ViewCatalog';

// Modals
import { GameDetailModal } from './components/modals/GameDetailModal';
import { AddGameToListModal } from './components/modals/AddGameToListModal';
import { FolderModal } from './components/modals/FolderModal';
import { ListModal } from './components/modals/ListModal';
import { CustomGameModal } from './components/modals/CustomGameModal';
import { BackupModal } from './components/modals/BackupModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { ImportBackloggdModal } from './components/modals/ImportBackloggdModal';

const MainApp: React.FC = () => {
  const { activeView } = useStore();

  return (
    <div className="min-h-screen bg-[#0c0f17] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar />

      {/* Profile Header (displayed across profile overview and top navigation) */}

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'overview' && <ViewOverview />}
        {activeView === 'folders' && <ViewFolders />}
        {activeView === 'playing' && <ViewStatusGrid status="playing" />}
        {activeView === 'backlog' && <ViewStatusGrid status="backlog" />}
        {activeView === 'completed' && <ViewStatusGrid status="completed" />}
        {activeView === 'wishlist' && <ViewStatusGrid status="wishlist" />}
        {activeView === 'logs' && <ViewLogs />}
        {activeView === 'catalog' && <ViewCatalog />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#0a0d14] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">Gamelog</span>
            <span aria-hidden="true">·</span>
            <span>Perfil de Leonio Ranulfo</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Organizador de backlog de jogos: Pastas → Listas de Jogos → Jogos. Inspirado na estética da comunidade gamer.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <GameDetailModal />
      <AddGameToListModal />
      <FolderModal />
      <ListModal />
      <CustomGameModal />
      <BackupModal />
      <EditProfileModal />
      <ImportBackloggdModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
