import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StarRating } from '../StarRating';
import { StatusBadge } from '../StatusBadge';
import { 
  BookOpen, 
  Calendar, 
  Trash2, 
  Clock, 
  MessageSquare, 
  Plus, 
  Search,
  Gamepad2
} from 'lucide-react';

export const ViewLogs: React.FC = () => {
  const { logs, getGameById, deleteGameLog, openGameModal, setActiveView } = useStore();
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(log => {
    if (!search.trim()) return true;
    const game = getGameById(log.gameId);
    if (!game) return false;
    const q = search.toLowerCase();
    return (
      game.title.toLowerCase().includes(q) ||
      (log.review && log.review.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
              Diário de Jogatina (Logs)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro cronológico das suas sessões de jogo, resenhas e conclusões de campanhas.
          </p>
        </div>

        <button
          onClick={() => setActiveView('catalog')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Criar Novo Registro</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar nos seus registros e resenhas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#141824] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Timeline of Logs */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map(log => {
            const game = getGameById(log.gameId);
            if (!game) return null;

            return (
              <div
                key={log.id}
                className="p-5 rounded-2xl bg-[#131722] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row gap-5"
              >
                {/* Poster Cover */}
                <div 
                  onClick={() => openGameModal(game.id)}
                  className="w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 shadow-md cursor-pointer group"
                >
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Log Details */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 
                        onClick={() => openGameModal(game.id)}
                        className="text-base font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {game.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono tabular-nums">{game.releaseYear}</span>
                        <span>·</span>
                        <span>{game.developer}</span>
                      </div>
                    </div>

                    {/* Date and Delete action */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{log.date}</span>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('Deseja excluir esta entrada de log?')) {
                            deleteGameLog(log.id);
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                        title="Excluir log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status, Rating, Hours */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <StatusBadge status={log.status} size="sm" />
                    
                    {log.rating ? (
                      <StarRating rating={log.rating} size="sm" showNumeric={true} />
                    ) : null}

                    {log.hoursSpent ? (
                      <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{log.hoursSpent}h jogadas nesta sessão</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Review / Note Text */}
                  {log.review ? (
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-200 leading-relaxed italic">
                      "{log.review}"
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Nenhuma anotação adicional registrada nesta sessão.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-[#141824]/40 rounded-2xl border border-white/5">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Nenhum registro encontrado no Diário
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Ao jogar ou terminar um game, adicione uma entrada com notas e pensamentos para construir sua linha do tempo gamer!
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm cursor-pointer"
          >
            Escolher um Jogo para Registrar
          </button>
        </div>
      )}

    </div>
  );
};
