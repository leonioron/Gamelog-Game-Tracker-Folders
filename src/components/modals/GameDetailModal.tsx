import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { GameStatus } from '../../types';
import { StarRating } from '../StarRating';
import { STATUS_CONFIG, StatusBadge } from '../StatusBadge';
import { UpdateCoverModal } from './UpdateCoverModal';
import { formatLocalDateDisplay } from '../../utils/date';
import {
  X,
  Heart,
  Plus,
  Minus,
  Check,
  Calendar,
  BookOpen,
  Layers,
  MessageSquare,
  Trash2,
  Gamepad2,
  Image as ImageIcon,
} from 'lucide-react';

export const GameDetailModal: React.FC = () => {
  const {
    activeGameModalId,
    closeGameModal,
    getGameById,
    getGameStatus,
    updateGameStatus,
    toggleFavoriteGame,
    createGameLog,
    logs,
    lists,
    addGameToList,
    deleteGameLog,
    showToast,
  } = useStore();

  const game = activeGameModalId ? getGameById(activeGameModalId) : null;
  const status = activeGameModalId ? getGameStatus(activeGameModalId) : undefined;

  const [selectedStatus, setSelectedStatus] = useState<GameStatus>('backlog');
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [hours, setHours] = useState<number | ''>('');
  const [selectedListToAdd, setSelectedListToAdd] = useState<string>('');
  const [listAddNote, setListAddNote] = useState<string>('');
  const [imgError, setImgError] = useState(false);
  const [isUpdateCoverOpen, setIsUpdateCoverOpen] = useState(false);

  useEffect(() => {
    if (status) {
      setSelectedStatus(status.status);
      setRating(status.rating || 0);
      setReview(status.review || '');
      setHours(status.hoursPlayed || '');
    } else {
      setSelectedStatus('backlog');
      setRating(0);
      setReview('');
      setHours('');
    }
    setImgError(false);
  }, [status, activeGameModalId]);

  if (!game || !activeGameModalId) return null;

  const gameLogs = logs.filter((l) => l.gameId === game.id);

  const handleSaveStatus = () => {
    updateGameStatus(
      game.id,
      selectedStatus,
      rating,
      review,
      hours === '' ? 0 : Number(hours),
      status?.isFavorite
    );
    showToast(`Status de "${game.title}" salvo!`);
  };

  const handleAddLogEntry = () => {
    createGameLog(
      game.id,
      selectedStatus,
      rating,
      review,
      hours === '' ? undefined : Number(hours)
    );
  };

  const handleAddToList = () => {
    if (!selectedListToAdd) return;
    addGameToList(selectedListToAdd, game.id, listAddNote);
    setSelectedListToAdd('');
    setListAddNote('');
  };

  const stepHours = (delta: number) => {
    const current = hours === '' ? 0 : Number(hours);
    const next = Math.max(0, Math.round((current + delta) * 10) / 10);
    setHours(next);
  };

  const allStatuses: GameStatus[] = ['playing', 'completed', 'backlog', 'wishlist', 'paused', 'dropped'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 pt-safe-top bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={closeGameModal}
    >
      <div
        className="relative w-full max-w-4xl min-w-0 bg-[#121824] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#090D14] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold truncate">
              Detalhes do Jogo
            </span>
            <span aria-hidden="true" className="text-slate-600 shrink-0">·</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums shrink-0">{game.releaseYear}</span>
          </div>
          <button
            type="button"
            onClick={closeGameModal}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar detalhes do jogo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 min-w-0">
          {/* Hero Cover & Info */}
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6 min-w-0">
            <div className="w-36 sm:w-44 shrink-0 mx-auto md:mx-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#090D14] relative">
                {!imgError ? (
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#090D14] text-slate-400">
                    <Gamepad2 className="w-10 h-10 text-indigo-400/60 mb-2" />
                    <span className="text-xs font-semibold text-slate-200">{game.title}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleFavoriteGame(game.id)}
                  className={`absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
                    status?.isFavorite
                      ? 'bg-pink-600 text-white'
                      : 'bg-black/65 text-slate-300 hover:text-pink-400 hover:bg-black/85'
                  }`}
                  title={status?.isFavorite ? 'Remover dos favoritos' : 'Favoritar jogo'}
                  aria-label="Favoritar jogo"
                >
                  <Heart className={`w-4 h-4 ${status?.isFavorite ? 'fill-white' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsUpdateCoverOpen(true)}
                className="min-h-[44px] w-full mt-2.5 py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-[#090D14] hover:bg-white/10 border border-white/10 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Atualizar Imagem</span>
              </button>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white tracking-tight break-words">
                  {game.title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-2">
                  <span className="font-semibold text-slate-300">{game.developer}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono tabular-nums">{game.releaseYear}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{game.genres.join(', ')}</span>
                </div>

                <div className="mt-2.5 text-[11px] font-mono text-slate-400 break-words">
                  Plataformas: {game.platforms.join(' · ')}
                </div>

                {game.summary && (
                  <p className="text-sm text-slate-300 mt-4 leading-relaxed line-clamp-4">
                    {game.summary}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Status atual:</span>
                  {status ? (
                    <StatusBadge status={status.status} />
                  ) : (
                    <span className="text-xs text-slate-500 italic">Não registrado</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sua nota:</span>
                  <StarRating
                    rating={rating}
                    interactive={true}
                    onChange={(newRating) => {
                      setRating(newRating);
                      updateGameStatus(
                        game.id,
                        selectedStatus,
                        newRating,
                        review,
                        hours === '' ? 0 : Number(hours),
                        status?.isFavorite
                      );
                    }}
                    showNumeric={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Log & Tracker Form */}
          <div className="bg-[#090D14] p-4 sm:p-5 rounded-xl border border-white/5 space-y-4 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Registrar Status & Progresso</span>
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Selecione o Status:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {allStatuses.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  const isSelected = selectedStatus === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedStatus(s)}
                      className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? `${cfg.bgSubtle} ring-2 ring-indigo-500/50 font-semibold shadow-sm`
                          : 'bg-[#121824] hover:bg-white/10 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.color}`} />
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours Stepper (- / +) and Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
              <div className="min-w-0">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Horas Jogadas:
                </label>
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => stepHours(-1)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#121824] hover:bg-white/10 border border-white/10 text-slate-300 shrink-0 cursor-pointer"
                    aria-label="Diminuir horas"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="flex-1 min-w-0 w-0 min-h-[44px] bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs text-center text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => stepHours(1)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#121824] hover:bg-white/10 border border-white/10 text-slate-300 shrink-0 cursor-pointer"
                    aria-label="Aumentar horas"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 min-w-0">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Avaliação (1 a 5 estrelas):
                </label>
                <div className="min-h-[44px] flex items-center justify-between gap-2 px-3.5 bg-[#121824] border border-white/10 rounded-xl">
                  <StarRating
                    rating={rating}
                    interactive={true}
                    onChange={setRating}
                    showNumeric={true}
                    size="md"
                  />
                  <span className="text-[11px] text-slate-500 hidden sm:inline">Toque para avaliar</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Sua Resenha / Comentário:
              </label>
              <textarea
                rows={3}
                placeholder="O que achou da jogabilidade, narrativa, gráficos e ritmo?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAddLogEntry}
                className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-200 bg-[#121824] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>+ Nova Entrada no Diário</span>
              </button>

              <button
                type="button"
                onClick={handleSaveStatus}
                className="min-h-[44px] px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Salvar Status Principal</span>
              </button>
            </div>
          </div>

          {/* Add to List section */}
          <div className="bg-[#090D14] p-4 sm:p-5 rounded-xl border border-white/5 space-y-3 min-w-0">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Adicionar a uma Lista</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 min-w-0">
              <div className="sm:col-span-2 min-w-0">
                <select
                  value={selectedListToAdd}
                  onChange={(e) => setSelectedListToAdd(e.target.value)}
                  className="min-h-[44px] w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecione uma lista de jogos...</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.items.length} jogos)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={!selectedListToAdd}
                onClick={handleAddToList}
                className="min-h-[44px] w-full px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Adicionar à Lista</span>
              </button>
            </div>

            {selectedListToAdd && (
              <input
                type="text"
                placeholder="Anotação para esta lista (opcional)"
                value={listAddNote}
                onChange={(e) => setListAddNote(e.target.value)}
                className="min-h-[44px] w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Past Logs for this game */}
          {gameLogs.length > 0 && (
            <div className="space-y-3 min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Histórico de Logs ({gameLogs.length})</span>
              </h3>

              <div className="space-y-2">
                {gameLogs.map((l) => (
                  <div
                    key={l.id}
                    className="p-3.5 rounded-xl bg-[#090D14] border border-white/5 flex items-start justify-between gap-3 text-xs min-w-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                          {formatLocalDateDisplay(l.date)}
                        </span>
                        <StatusBadge status={l.status} size="sm" />
                        {l.rating ? (
                          <span className="text-amber-400 font-mono tabular-nums text-[11px] font-semibold">
                            ★ {l.rating.toFixed(1)}
                          </span>
                        ) : null}
                        {l.hoursSpent ? (
                          <span className="text-slate-500 text-[11px] font-mono tabular-nums">
                            {l.hoursSpent}h
                          </span>
                        ) : null}
                      </div>
                      {l.review && (
                        <p className="text-slate-300 leading-relaxed pt-0.5 break-words">
                          "{l.review}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteGameLog(l.id)}
                      className="min-h-[44px] min-w-[44px] -my-1 -mr-1 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                      title="Excluir entrada de log"
                      aria-label="Excluir log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <UpdateCoverModal
        gameId={isUpdateCoverOpen ? game.id : null}
        onClose={() => setIsUpdateCoverOpen(false)}
      />
    </div>
  );
};
