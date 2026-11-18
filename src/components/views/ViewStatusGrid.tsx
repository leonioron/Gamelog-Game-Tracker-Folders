import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { GameStatus } from '../../types';
import { GameCard } from '../GameCard';
import { STATUS_CONFIG } from '../StatusBadge';
import { ConfirmModal } from '../modals/ConfirmModal';
import { Pagination } from '../Pagination';
import { Search, ArrowUpDown, Plus, Gamepad2, CheckSquare, Trash2, Check, Heart } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface ViewStatusGridProps {
  status: GameStatus | 'favorites';
}

export const ViewStatusGrid: React.FC<ViewStatusGridProps> = ({ status }) => {
  const { userStatuses, getGameById, setActiveView, removeGamesStatus, unfavoriteGames } = useStore();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'year_desc' | 'year_asc' | 'title_asc'>('rating_desc');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const isFavoritesView = status === 'favorites';

  const config = isFavoritesView
    ? {
        label: 'Favoritos',
        bgSubtle: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        icon: Heart,
      }
    : STATUS_CONFIG[status];

  const filteredGames = useMemo(() => {
    const ids = Object.entries(userStatuses)
      .filter(([_, st]) => (isFavoritesView ? st.isFavorite : st.status === status))
      .map(([id]) => id);

    let gamesList = ids.map((id) => getGameById(id)).filter(Boolean);

    if (search.trim()) {
      const q = search.toLowerCase();
      gamesList = gamesList.filter(
        (g) =>
          g!.title.toLowerCase().includes(q) ||
          g!.developer.toLowerCase().includes(q) ||
          g!.genres.some((genre) => genre.toLowerCase().includes(q))
      );
    }

    return gamesList.sort((a, b) => {
      const stA = userStatuses[a!.id];
      const stB = userStatuses[b!.id];

      if (sortBy === 'rating_desc') {
        const ratingA = stA?.rating || 0;
        const ratingB = stB?.rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return b!.releaseYear - a!.releaseYear;
      }
      if (sortBy === 'year_desc') return b!.releaseYear - a!.releaseYear;
      if (sortBy === 'year_asc') return a!.releaseYear - b!.releaseYear;
      if (sortBy === 'title_asc') return a!.title.localeCompare(b!.title);
      return 0;
    });
  }, [userStatuses, status, isFavoritesView, search, sortBy, getGameById]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, [status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedGames = filteredGames.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const toggleSelect = (gameId: string) => {
    setSelectedIds((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGames.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGames.map((g) => g!.id));
    }
  };

  const handleBulkRemove = () => {
    if (selectedIds.length === 0) return;
    if (isFavoritesView) {
      setConfirmModal({
        isOpen: true,
        title: 'Remover dos Favoritos',
        message: `Deseja remover ${selectedIds.length} ${selectedIds.length === 1 ? 'jogo' : 'jogos'} dos seus favoritos?`,
        confirmLabel: 'Remover dos Favoritos',
        onConfirm: () => {
          unfavoriteGames(selectedIds);
          setSelectedIds([]);
          setIsSelectionMode(false);
        },
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: `Remover de ${config.label}`,
        message: `Deseja realmente remover ${selectedIds.length} ${selectedIds.length === 1 ? 'jogo' : 'jogos'} de "${config.label}"? Os jogos continuarão disponíveis no catálogo geral.`,
        confirmLabel: 'Remover',
        onConfirm: () => {
          removeGamesStatus(selectedIds);
          setSelectedIds([]);
          setIsSelectionMode(false);
        },
      });
    }
  };

  const HeaderIcon = config.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6 pb-8 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/5 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl shrink-0 ${config.bgSubtle}`}>
            <HeaderIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight truncate">
              {config.label}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
              <strong className="text-slate-200">{filteredGames.length}</strong>{' '}
              {filteredGames.length === 1 ? 'jogo registrado' : 'jogos registrados'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {filteredGames.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                isSelectionMode
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#121824] text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
              title={isSelectionMode ? 'Cancelar seleção' : 'Selecionar vários'}
              aria-label={isSelectionMode ? 'Cancelar seleção' : 'Selecionar vários'}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all cursor-pointer"
            title="Adicionar Jogo"
            aria-label="Adicionar Jogo"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-select Action Bar */}
      {isSelectionMode && filteredGames.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs min-w-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="min-h-[44px] flex items-center gap-2 text-indigo-300 hover:text-white font-medium cursor-pointer"
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  selectedIds.length === filteredGames.length
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'border-white/30 bg-black/40'
                }`}
              >
                {selectedIds.length === filteredGames.length && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span>
                {selectedIds.length === filteredGames.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </span>
            </button>

            <span className="text-slate-400 font-mono tabular-nums">
              <strong className="text-white">{selectedIds.length}</strong>/{filteredGames.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIds([]);
              }}
              className="min-h-[44px] px-3 py-2 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleBulkRemove}
              disabled={selectedIds.length === 0}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="tabular-nums">Remover ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#121824] border border-white/5 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Filtrar em ${config.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="min-h-[44px] flex-1 sm:flex-initial bg-[#090D14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="rating_desc">Maior Nota ★</option>
            <option value="year_desc">Ano Mais Recente</option>
            <option value="year_asc">Ano Mais Antigo</option>
            <option value="title_asc">Título (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredGames.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {paginatedGames.map((game) => (
              <GameCard
                key={game!.id}
                game={game!}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.includes(game!.id)}
                onToggleSelect={() => toggleSelect(game!.id)}
              />
            ))}
          </div>

          <Pagination
            currentPage={safePage}
            totalItems={filteredGames.length}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[#121824] rounded-2xl border border-white/5">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Nenhum jogo encontrado em "{config.label}"
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {search.trim()
              ? 'Tente ajustar os termos da busca.'
              : isFavoritesView
              ? 'Marque o coração nos detalhes de qualquer jogo para adicioná-lo aos Favoritos.'
              : 'Explore o catálogo para registrar novos títulos com esse status.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm cursor-pointer"
          >
            Navegar no Catálogo
          </button>
        </div>
      )}

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
