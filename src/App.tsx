import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AcervoSubNav } from './components/AcervoSubNav';
import { ToastContainer } from './components/ToastContainer';
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
  const { activeView, userProfile } = useStore();

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white overflow-x-clip">
      {/* Top Bar Navigation (includes safe-top padding directly) */}
      <Navbar />

      {/* Mobile Segmented Sub-navigation when inside Acervo views */}
      <AcervoSubNav />

      {/* Main View Router */}
      <main className="flex-1 min-w-0 pb-24 md:pb-8">
        {activeView === 'overview' && <ViewOverview />}
        {activeView === 'folders' && <ViewFolders />}
        {activeView === 'playing' && <ViewStatusGrid status="playing" />}
        {activeView === 'backlog' && <ViewStatusGrid status="backlog" />}
        {activeView === 'completed' && <ViewStatusGrid status="completed" />}
        {activeView === 'wishlist' && <ViewStatusGrid status="wishlist" />}
        {activeView === 'favorites' && <ViewStatusGrid status="favorites" />}
        {activeView === 'logs' && <ViewLogs />}
        {activeView === 'catalog' && <ViewCatalog />}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block mt-auto border-t border-white/5 bg-[#090D14] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">Gamelog</span>
            <span aria-hidden="true">·</span>
            <span>{userProfile.displayName}</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Organizador offline-first de backlog: Pastas → Listas de Jogos → Jogos.
          </p>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation (4 main tabs) */}
      <MobileBottomNav />

      {/* Toast Feedback */}
      <ToastContainer />

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
