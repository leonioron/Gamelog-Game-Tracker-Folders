import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { GameCard } from '../GameCard';
import { ConfirmModal } from '../modals/ConfirmModal';
import { Search, Plus, Filter, Gamepad2, Sparkles, CheckSquare, Trash2, Check } from 'lucide-react';

export const ViewCatalog: React.FC = () => {
  const { games, setIsCustomGameModalOpen, deleteGames } = useStore();

  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
    'Indie'
  ];

  const platformsList = [
    'all',
    'PC',
    'PlayStation 5',
    'Nintendo Switch',
    'PS4',
    'Xbox Series X/S'
  ];

  const filteredGames = useMemo(() => {
    return games.filter(g => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesDev = g.developer.toLowerCase().includes(q);
        const matchesGenre = g.genres.some(gen => gen.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDev && !matchesGenre) return false;
      }

      // Genre filter
      if (selectedGenre !== 'all') {
        if (!g.genres.some(gen => gen.toLowerCase().includes(selectedGenre.toLowerCase()))) {
          return false;
        }
      }

      // Platform filter
      if (selectedPlatform !== 'all') {
        if (!g.platforms.some(plat => plat.toLowerCase().includes(selectedPlatform.toLowerCase()))) {
          return false;
        }
      }

      return true;
    });
  }, [games, search, selectedGenre, selectedPlatform]);

  const toggleSelect = (gameId: string) => {
    setSelectedIds(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGames.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGames.map(g => g.id));
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
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
              Catálogo de Jogos
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore mais de 60 obras aclamadas ou cadastre qualquer jogo para adicionar ao seu backlog e listas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filteredGames.length > 0 && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
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
            onClick={() => setIsCustomGameModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Cadastrar Jogo Personalizado</span>
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
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-rose-950/50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir Selecionados ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3 p-4 rounded-2xl bg-[#141824] border border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, desenvolvedora ou palavras-chave (ex: Elden Ring, Capcom, FromSoftware)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0d1017] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Genre Pill-free Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-[11px] font-mono text-slate-500 mr-1 shrink-0">Gênero:</span>
          {genresList.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedGenre === g
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {g === 'all' ? 'Todos os Gêneros' : g}
            </button>
          ))}
        </div>

        {/* Platform Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none pt-1 border-t border-white/5">
          <span className="text-[11px] font-mono text-slate-500 mr-1 shrink-0">Plataforma:</span>
          {platformsList.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {p === 'all' ? 'Todas as Plataformas' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
        <span className="tabular-nums">Mostrando {filteredGames.length} de {games.length} jogos</span>
        {(search || selectedGenre !== 'all' || selectedPlatform !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedGenre('all');
              setSelectedPlatform('all');
            }}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(game.id)}
              onToggleSelect={() => toggleSelect(game.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-[#141824]/40 rounded-2xl border border-white/5">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Nenhum jogo encontrado com estes filtros
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Você pode cadastrar esse jogo agora mesmo com arte, ano e desenvolvedor!
          </p>
          <button
            onClick={() => setIsCustomGameModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm cursor-pointer"
          >
            + Cadastrar Jogo Personalizado
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
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
