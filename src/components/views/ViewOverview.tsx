import React from 'react';
import { useStore } from '../../context/StoreContext';
import { StarRating } from '../StarRating';
import { StatusBadge } from '../StatusBadge';
import { formatLocalDateDisplay } from '../../utils/date';
import {
  Play,
  Heart,
  BookOpen,
  ChevronRight,
  FolderTree,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

export const ViewOverview: React.FC = () => {
  const {
    userStatuses,
    logs,
    lists,
    folders,
    setActiveView,
    setSelectedFolderId,
    setSelectedListId,
    getGameById,
    openGameModal,
  } = useStore();

  const statusesList = Object.values(userStatuses);
  const playingCount = statusesList.filter((s) => s.status === 'playing').length;
  const completedCount = statusesList.filter((s) => s.status === 'completed').length;
  const backlogCount = statusesList.filter((s) => s.status === 'backlog').length;
  const favoritesCount = statusesList.filter((s) => s.isFavorite).length;

  const recentLists = lists.slice(0, 2);
  const recentLogs = logs.slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8 space-y-7 min-w-0">
      {/* Quick KPI Summary Cards: Jogando, Zerados, Backlog, Favoritos */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setActiveView('playing')}
          className="min-h-[44px] p-3.5 rounded-2xl bg-[#121824] border border-white/5 hover:border-sky-500/30 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Jogando</span>
            <Play className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-xl font-bold font-mono tabular-nums text-white mt-1 block">
            {playingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('completed')}
          className="min-h-[44px] p-3.5 rounded-2xl bg-[#121824] border border-white/5 hover:border-emerald-500/30 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Zerados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-bold font-mono tabular-nums text-white mt-1 block">
            {completedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('backlog')}
          className="min-h-[44px] p-3.5 rounded-2xl bg-[#121824] border border-white/5 hover:border-amber-500/30 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Backlog</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl font-bold font-mono tabular-nums text-white mt-1 block">
            {backlogCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('favorites')}
          className="min-h-[44px] p-3.5 rounded-2xl bg-[#121824] border border-white/5 hover:border-pink-500/30 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Favoritos</span>
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <span className="text-xl font-bold font-mono tabular-nums text-white mt-1 block">
            {favoritesCount}
          </span>
        </button>
      </section>

      {/* Pastas & Listas (últimos 2) */}
      <section className="space-y-4 min-w-0">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 shrink-0">
              <FolderTree className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-display font-bold text-white tracking-tight truncate">
                Pastas & Listas
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Coleções temáticas e rankings recentes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedFolderId(null);
              setSelectedListId(null);
              setActiveView('folders');
            }}
            className="min-h-[44px] px-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span className="tabular-nums">Explorar ({lists.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {recentLists.map((list) => {
              const folder = folders.find((f) => f.id === list.folderId);
              return (
                <div
                  key={list.id}
                  onClick={() => {
                    setSelectedListId(list.id);
                    setActiveView('folders');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-[#121824] hover:bg-[#171f2e] border border-white/5 hover:border-white/15 transition-all cursor-pointer group flex flex-col justify-between min-w-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2">
                      <span className="font-mono text-[11px] truncate">
                        {folder ? `📁 ${folder.name}` : '📋 Lista Avulsa'}
                      </span>
                      <span className="tabular-nums font-mono text-slate-500 shrink-0">
                        {list.items.length} {list.items.length === 1 ? 'jogo' : 'jogos'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {list.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#121824] border border-white/5 text-center text-xs text-slate-400">
            Nenhuma lista criada ainda.
          </div>
        )}
      </section>

      {/* Últimos Registros no Diário (últimos 2) */}
      <section className="space-y-4 min-w-0">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-display font-bold text-white tracking-tight truncate">
                Últimos Registros no Diário
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Histórico recente de jogatina
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('logs')}
            className="min-h-[44px] px-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span className="tabular-nums">Diário ({logs.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentLogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {recentLogs.map((log) => {
              const game = getGameById(log.gameId);
              if (!game) return null;

              return (
                <div
                  key={log.id}
                  onClick={() => openGameModal(game.id)}
                  className="p-4 rounded-xl bg-[#121824] hover:bg-[#171f2e] border border-white/5 hover:border-white/15 transition-all flex gap-3.5 cursor-pointer group min-w-0"
                >
                  <div className="w-16 h-24 rounded-lg overflow-hidden bg-[#090D14] border border-white/10 shrink-0">
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
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                        {formatLocalDateDisplay(log.date)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={log.status} size="sm" />
                      {log.rating ? (
                        <StarRating rating={log.rating} size="sm" showNumeric={true} />
                      ) : null}
                      {log.hoursSpent ? (
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          · {log.hoursSpent}h
                        </span>
                      ) : null}
                    </div>

                    {log.review ? (
                      <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed pt-0.5">
                        "{log.review}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Registro de atividade.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#121824] border border-white/5 text-center text-xs text-slate-400">
            Nenhum registro recente no diário.
          </div>
        )}
      </section>
    </div>
  );
};
