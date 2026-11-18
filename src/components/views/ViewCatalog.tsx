import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { GameCard } from '../GameCard';
import { ConfirmModal } from '../modals/ConfirmModal';
import { Pagination } from '../Pagination';
import { Search, Plus, Gamepad2, CheckSquare, Trash2, Check, Database } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const ViewCatalog: React.FC = () => {
  const { games, setIsCustomGameModalOpen, setIsBackupModalOpen, deleteGames } = useStore();

  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
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

  const genresList = [
    'all',
    'RPG',
    'Survival Horror',
    'Action',
    'Metroidvania',
    'Roguelike',
    'JRPG',
    'Open World',
    'Souls-like',
    'Platformer',
    'Indie',
  ];

  const platformsList = ['all', 'PC', 'PlayStation 5', 'Nintendo Switch', 'PS4', 'Xbox Series X/S'];

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesDev = g.developer.toLowerCase().includes(q);
        const matchesGenre = g.genres.some((gen) => gen.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDev && !matchesGenre) return false;
      }

      if (selectedGenre !== 'all') {
        if (!g.genres.some((gen) => gen.toLowerCase().includes(selectedGenre.toLowerCase()))) {
          return false;
        }
      }

      if (selectedPlatform !== 'all') {
        if (!g.platforms.some((plat) => plat.toLowerCase().includes(selectedPlatform.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [games, search, selectedGenre, selectedPlatform]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGenre, selectedPlatform]);

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
      setSelectedIds(filteredGames.map((g) => g.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Jogos do Catálogo',
      message: `Deseja realmente excluir ${selectedIds.length} ${selectedIds.length === 1 ? 'jogo' : 'jogos'} do catálogo? Eles serão removidos de todas as listas e diários.`,
      confirmLabel: 'Excluir Jogos',
      onConfirm: () => {
        deleteGames(selectedIds);
        setSelectedIds([]);
        setIsSelectionMode(false);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6 pb-8 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight truncate">
              Catálogo de Jogos
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore títulos aclamados ou cadastre qualquer jogo manualmente.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white bg-[#121824] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
            title="Backup, Exportar JSON/CSV e Dados"
            aria-label="Backup e Dados"
          >
            <Database className="w-4 h-4 text-indigo-400" />
          </button>

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
            onClick={() => setIsCustomGameModalOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all cursor-pointer"
            title="Cadastrar Jogo"
            aria-label="Cadastrar Jogo"
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
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span className="tabular-nums">Excluir ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-3 p-4 rounded-2xl bg-[#121824] border border-white/5 min-w-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar título, estúdio ou gênero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-mono text-slate-500 mr-1 shrink-0">Gênero:</span>
          {genresList.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setSelectedGenre(g)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedGenre === g
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-[#090D14] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {g === 'all' ? 'Todos' : g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none pt-2 border-t border-white/5">
          <span className="text-[11px] font-mono text-slate-500 mr-1 shrink-0">Plataforma:</span>
          {platformsList.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPlatform(p)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'bg-[#090D14] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {p === 'all' ? 'Todas' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
        <span className="tabular-nums">
          Mostrando {filteredGames.length} de {games.length} jogos
        </span>
        {(search || selectedGenre !== 'all' || selectedPlatform !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedGenre('all');
              setSelectedPlatform('all');
            }}
            className="min-h-[44px] px-2 text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredGames.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {paginatedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.includes(game.id)}
                onToggleSelect={() => toggleSelect(game.id)}
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
            Nenhum jogo encontrado com estes filtros
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Você pode cadastrar esse jogo agora mesmo com arte, ano e desenvolvedor!
          </p>
          <button
            type="button"
            onClick={() => setIsCustomGameModalOpen(true)}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm cursor-pointer"
          >
            + Cadastrar Jogo Personalizado
          </button>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel || 'Excluir'}
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};
