import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { GameStatus } from '../../types';
import { GameCard } from '../GameCard';
import { STATUS_CONFIG } from '../StatusBadge';
import { ConfirmModal } from '../modals/ConfirmModal';
import { Search, ArrowUpDown, Plus, Gamepad2, CheckSquare, Trash2, Check } from 'lucide-react';

interface ViewStatusGridProps {
  status: GameStatus;
}

export const ViewStatusGrid: React.FC<ViewStatusGridProps> = ({ status }) => {
  const { userStatuses, getGameById, setActiveView, removeGamesStatus } = useStore();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'year_desc' | 'year_asc' | 'title_asc'>('rating_desc');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const config = STATUS_CONFIG[status];

  // Filter game IDs with this status
  const filteredGames = useMemo(() => {
    const ids = Object.entries(userStatuses)
      .filter(([_, st]) => st.status === status)
      .map(([id]) => id);

    let gamesList = ids.map(id => getGameById(id)).filter(Boolean);

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      gamesList = gamesList.filter(g => 
        g!.title.toLowerCase().includes(q) ||
        g!.developer.toLowerCase().includes(q) ||
        g!.genres.some(genre => genre.toLowerCase().includes(q))
      );
    }

    // Sort
    return gamesList.sort((a, b) => {
      const stA = userStatuses[a!.id];
      const stB = userStatuses[b!.id];

      if (sortBy === 'rating_desc') {
        const ratingA = stA?.rating || 0;
        const ratingB = stB?.rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return b!.releaseYear - a!.releaseYear;
      }
      if (sortBy === 'year_desc') {
        return b!.releaseYear - a!.releaseYear;
      }
      if (sortBy === 'year_asc') {
        return a!.releaseYear - b!.releaseYear;
      }
      if (sortBy === 'title_asc') {
        return a!.title.localeCompare(b!.title);
      }
      return 0;
    });
  }, [userStatuses, status, search, sortBy, getGameById]);

  const toggleSelect = (gameId: string) => {
    setSelectedIds(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGames.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGames.map(g => g!.id));
    }
  };

  const handleBulkRemove = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: `Remover de ${config.label}`,
      message: `Deseja realmente remover ${selectedIds.length} ${selectedIds.length === 1 ? 'jogo' : 'jogos'} de "${config.label}"? Os jogos continuarão disponíveis no catálogo geral.`,
      confirmLabel: 'Remover',
      onConfirm: () => {
        removeGamesStatus(selectedIds);
        setSelectedIds([]);
        setIsSelectionMode(false);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-16">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${config.bgSubtle}`}>
            <config.icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
              {config.label}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              <span className="tabular-nums font-bold text-slate-300">{filteredGames.length}</span> jogos registrados com este status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filteredGames.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isSelectionMode 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isSelectionMode ? 'Cancelar Seleção' : 'Selecionar Vários'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('catalog')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Adicionar ao {config.label}</span>
          </button>
        </div>
      </div>

      {/* Multi-select Action Bar */}
      {isSelectionMode && filteredGames.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-medium cursor-pointer"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                selectedIds.length === filteredGames.length
                  ? 'bg-indigo-600 border-indigo-400 text-white'
                  : 'border-white/30 bg-black/40'
              }`}>
                {selectedIds.length === filteredGames.length && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>
                {selectedIds.length === filteredGames.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </span>
            </button>

            <span className="text-slate-400 font-mono">
              | <strong className="text-white">{selectedIds.length}</strong> de {filteredGames.length} selecionados
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIds([]);
              }}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleBulkRemove}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-rose-950/50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover Selecionados ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#141824] border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Filtrar jogos em ${config.label.toLowerCase()} por título, estúdio ou gênero...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0d1017] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#0d1017] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="rating_desc">Maior Nota ★</option>
            <option value="year_desc">Ano Mais Recente</option>
            <option value="year_asc">Ano Mais Antigo</option>
            <option value="title_asc">Título (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map(game => (
            <GameCard 
              key={game!.id} 
              game={game!} 
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(game!.id)}
              onToggleSelect={() => toggleSelect(game!.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-[#141824]/40 rounded-2xl border border-white/5">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Nenhum jogo encontrado em "{config.label}"
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {search.trim() ? 'Tente ajustar os termos da busca.' : 'Explore o catálogo para registrar novos títulos com esse status.'}
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm cursor-pointer"
          >
            Navegar no Catálogo
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel || 'Remover'}
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

    </div>
  );
};
