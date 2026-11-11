import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, Plus, Check, Gamepad2 } from 'lucide-react';

export const AddGameToListModal: React.FC = () => {
  const { 
    addGameToListModalListId, 
    closeAddGameToListModal, 
    getListById, 
    games, 
    addGameToList,
    setIsCustomGameModalOpen
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const targetList = addGameToListModalListId ? getListById(addGameToListModalListId) : null;

  const filteredGames = useMemo(() => {
    if (!search.trim()) return games.slice(0, 16);
    const q = search.toLowerCase();
    return games.filter(g => 
      g.title.toLowerCase().includes(q) ||
      g.developer.toLowerCase().includes(q) ||
      g.genres.some(genre => genre.toLowerCase().includes(q))
    ).slice(0, 24);
  }, [games, search]);

  if (!addGameToListModalListId || !targetList) return null;

  const existingGameIds = new Set(targetList.items.map(i => i.gameId));

  const handleAddGame = (gameId: string) => {
    addGameToList(targetList.id, gameId, note);
    setSelectedGameId(null);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div>
            <h2 className="text-base font-display font-bold text-white">
              Adicionar Jogos à Lista
            </h2>
            <p className="text-xs text-indigo-400 font-medium truncate max-w-md">
              Lista: {targetList.title}
            </p>
          </div>
          <button
            onClick={closeAddGameToListModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input bar */}
        <div className="p-4 border-b border-white/5 bg-[#151a26]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, estúdio ou gênero (ex: Resident Evil, RPG, Zelda)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>{filteredGames.length} jogos encontrados</span>
            <button
              onClick={() => {
                closeAddGameToListModal();
                setIsCustomGameModalOpen(true);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 cursor-pointer"
            >
              Não achou? Cadastrar jogo personalizado
            </button>
          </div>
        </div>

        {/* Note input if a game is selected */}
        {selectedGameId && (
          <div className="p-3 bg-indigo-950/30 border-b border-indigo-500/20 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Anotação na lista (ex: 'Melhor jogo da franquia', 'Prioridade de compra')..."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="flex-1 w-full bg-[#0d1017] border border-indigo-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleAddGame(selectedGameId)}
                className="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                Confirmar Adição
              </button>
              <button
                onClick={() => setSelectedGameId(null)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredGames.map(game => {
            const isAlreadyInList = existingGameIds.has(game.id);

            return (
              <div
                key={game.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isAlreadyInList
                    ? 'bg-white/[0.02] border-white/5 opacity-60'
                    : 'bg-[#151924] hover:bg-[#191f2e] border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {game.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono tabular-nums">{game.releaseYear}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="truncate">{game.developer}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isAlreadyInList ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium px-2 py-1 rounded bg-white/5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Na lista</span>
                    </span>
                  ) : selectedGameId === game.id ? (
                    <span className="text-xs font-semibold text-indigo-400">
                      Digitando nota acima...
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedGameId(game.id)}
                        className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="Adicionar com anotação"
                      >
                        Com nota
                      </button>
                      <button
                        onClick={() => handleAddGame(game.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0f131d] flex justify-end">
          <button
            onClick={closeAddGameToListModal}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
