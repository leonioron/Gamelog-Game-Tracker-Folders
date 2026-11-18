import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { StarRating } from '../StarRating';
import { StatusBadge } from '../StatusBadge';
import { ConfirmModal } from '../modals/ConfirmModal';
import { Pagination } from '../Pagination';
import { formatLocalDateDisplay } from '../../utils/date';
import {
  BookOpen,
  Calendar,
  Trash2,
  Clock,
  Plus,
  Search,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const ViewLogs: React.FC = () => {
  const { logs, getGameById, deleteGameLog, openGameModal, setActiveView } = useStore();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const game = getGameById(log.gameId);
    if (!game) return false;
    const q = search.toLowerCase();
    return (
      game.title.toLowerCase().includes(q) ||
      (log.review && log.review.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLogs = filteredLogs.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6 pb-8 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-5 border-b border-white/5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight truncate">
              Diário de Jogatina
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro cronológico das suas sessões de jogo, resenhas e conclusões.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('catalog')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
          title="Novo Registro"
          aria-label="Novo Registro"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar nos seus registros e resenhas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[44px] w-full bg-[#121824] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Timeline */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedLogs.map((log) => {
              const game = getGameById(log.gameId);
              if (!game) return null;

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#121824] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 min-w-0"
                >
                  <div
                    onClick={() => openGameModal(game.id)}
                    className="w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-[#090D14] border border-white/10 shrink-0 shadow-md cursor-pointer group"
                  >
                    <img
                      src={game.coverUrl}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <h3
                          onClick={() => openGameModal(game.id)}
                          className="text-base font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer truncate"
                        >
                          {game.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono tabular-nums">{game.releaseYear}</span>
                          <span>·</span>
                          <span className="truncate">{game.developer}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-300 bg-[#090D14] border border-white/5 px-2.5 py-1.5 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{formatLocalDateDisplay(log.date)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setLogToDelete(log.id)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Excluir log"
                          aria-label="Excluir registro de log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <StatusBadge status={log.status} size="sm" />

                      {log.rating ? (
                        <StarRating rating={log.rating} size="sm" showNumeric={true} />
                      ) : null}

                      {log.hoursSpent ? (
                        <span className="flex items-center gap-1 text-xs font-mono tabular-nums text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{log.hoursSpent}h jogadas</span>
                        </span>
                      ) : null}
                    </div>

                    {log.review ? (
                      <div className="p-3 rounded-xl bg-[#090D14] border border-white/5 text-xs text-slate-200 leading-relaxed italic break-words">
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

          <Pagination
            currentPage={safePage}
            totalItems={filteredLogs.length}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[#121824] rounded-2xl border border-white/5">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">
            Nenhum registro encontrado no Diário
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Adicione entradas nos detalhes de qualquer jogo para construir sua linha do tempo.
          </p>
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm cursor-pointer"
          >
            Escolher um Jogo
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={logToDelete !== null}
        title="Excluir Registro do Diário"
        message="Deseja realmente excluir esta entrada do seu diário de jogatina?"
        confirmLabel="Excluir Registro"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (logToDelete) deleteGameLog(logToDelete);
          setLogToDelete(null);
        }}
        onCancel={() => setLogToDelete(null)}
      />
    </div>
  );
};
