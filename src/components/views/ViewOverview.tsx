import React from 'react';
import { useStore } from '../../context/StoreContext';
import { GameCard } from '../GameCard';
import { StarRating } from '../StarRating';
import { StatusBadge } from '../StatusBadge';
import { 
  Play, 
  Heart, 
  Layers, 
  BookOpen, 
  ChevronRight, 
  Plus, 
  Sparkles,
  Gamepad2,
  FolderTree
} from 'lucide-react';

export const ViewOverview: React.FC = () => {
  const { 
    userStatuses, 
    games, 
    logs, 
    lists, 
    folders, 
    setActiveView, 
    setSelectedListId, 
    getGameById, 
    openGameModal,
    openAddGameToListModal,
    userProfile
  } = useStore();

  // Currently playing games
  const playingGameIds = Object.entries(userStatuses)
    .filter(([_, st]) => st.status === 'playing')
    .map(([id]) => id);
  const playingGames = playingGameIds.map(id => getGameById(id)).filter(Boolean);

  // Favorite games
  const favoriteGameIds = Object.entries(userStatuses)
    .filter(([_, st]) => st.isFavorite)
    .map(([id]) => id);
  const favoriteGames = favoriteGameIds.map(id => getGameById(id)).filter(Boolean);

  // Recent logs
  const recentLogs = logs.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-16">
      
      {/* 1. Currently Playing Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Play className="w-4 h-4 fill-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white tracking-tight">
                Atualmente Jogando
              </h2>
              <p className="text-xs text-slate-400">
                Acompanhe o progresso das suas campanhas em andamento
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('playing')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todos ({playingGames.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {playingGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {playingGames.slice(0, 5).map(game => (
              <GameCard key={game!.id} game={game!} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#141824]/60 border border-white/5 text-center">
            <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              Você não possui nenhum jogo marcado como "Jogando" no momento.
            </p>
            <button
              onClick={() => setActiveView('catalog')}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
            >
              Explorar Catálogo de Jogos
            </button>
          </div>
        )}
      </section>

      {/* 2. Featured Folders & Lists Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white tracking-tight">
                Pastas & Listas de Jogos
              </h2>
              <p className="text-xs text-slate-400">
                Sua curadoria organizada em pastas temáticas e rankings
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('folders')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Explorar Pastas ({lists.length} listas)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lists.slice(0, 3).map(list => {
            const folder = folders.find(f => f.id === list.folderId);
            const previewGames = list.items.slice(0, 3).map(i => getGameById(i.gameId)).filter(Boolean);

            return (
              <div
                key={list.id}
                onClick={() => {
                  setSelectedListId(list.id);
                  setActiveView('folders');
                }}
                className="p-5 rounded-2xl bg-[#131722] hover:bg-[#181d2a] border border-white/5 hover:border-white/15 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono text-[11px] truncate max-w-[160px]">
                      {folder ? `📁 ${folder.name}` : '📋 Lista Avulsa'}
                    </span>
                    <span className="tabular-nums font-mono text-slate-500">
                      {list.items.length} jogos
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {list.title}
                  </h3>

                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Recent Logs Diary Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white tracking-tight">
                Últimos Registros no Diário (Logs)
              </h2>
              <p className="text-xs text-slate-400">
                Histórico recente de impressões e conclusões de jogos
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('logs')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Diário Completo ({logs.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentLogs.map(log => {
            const game = getGameById(log.gameId);
            if (!game) return null;

            return (
              <div
                key={log.id}
                onClick={() => openGameModal(game.id)}
                className="p-4 rounded-xl bg-[#141824] hover:bg-[#181d2c] border border-white/5 hover:border-white/15 transition-all flex gap-4 cursor-pointer group"
              >
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {game.title}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      {log.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={log.status} size="sm" />
                    {log.rating ? (
                      <StarRating rating={log.rating} size="sm" showNumeric={true} />
                    ) : null}
                    {log.hoursSpent ? (
                      <span className="text-[11px] font-mono text-slate-500">
                        · {log.hoursSpent}h
                      </span>
                    ) : null}
                  </div>

                  {log.review ? (
                    <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed pt-1">
                      "{log.review}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Registro de atividade registrado.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Leonio's Favorite Games Section */}
      {favoriteGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                <Heart className="w-4 h-4 fill-pink-400" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-white tracking-tight">
                  Favoritos de Leonio Ranulfo
                </h2>
                <p className="text-xs text-slate-400">
                  Títulos aclamados com nota máxima e lugar especial no coração
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {favoriteGames.slice(0, 5).map(game => (
              <GameCard key={game!.id} game={game!} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
