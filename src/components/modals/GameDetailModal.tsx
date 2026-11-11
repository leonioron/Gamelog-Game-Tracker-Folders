import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { GameStatus } from '../../types';
import { StarRating } from '../StarRating';
import { STATUS_CONFIG, StatusBadge } from '../StatusBadge';
import { UpdateCoverModal } from './UpdateCoverModal';
import { 
  X, 
  Heart, 
  Clock, 
  Plus, 
  Check, 
  Calendar, 
  BookOpen, 
  Layers, 
  MessageSquare, 
  Trash2,
  Gamepad2,
  Image as ImageIcon
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
    deleteGameLog
  } = useStore();

  const game = activeGameModalId ? getGameById(activeGameModalId) : null;
  const status = activeGameModalId ? getGameStatus(activeGameModalId) : undefined;

  // Local state for editing status & log
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>('backlog');
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [hours, setHours] = useState<number | ''>('');
  const [selectedListToAdd, setSelectedListToAdd] = useState<string>('');
  const [listAddNote, setListAddNote] = useState<string>('');
  const [showLogSavedToast, setShowLogSavedToast] = useState(false);
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

  const gameLogs = logs.filter(l => l.gameId === game.id);

  const handleSaveStatus = () => {
    updateGameStatus(
      game.id,
      selectedStatus,
      rating,
      review,
      hours === '' ? 0 : Number(hours),
      status?.isFavorite
    );
    setShowLogSavedToast(true);
    setTimeout(() => setShowLogSavedToast(false), 2500);
  };

  const handleAddLogEntry = () => {
    createGameLog(
      game.id,
      selectedStatus,
      rating,
      review,
      hours === '' ? undefined : Number(hours)
    );
    setShowLogSavedToast(true);
    setTimeout(() => setShowLogSavedToast(false), 2500);
  };

  const handleAddToList = () => {
    if (!selectedListToAdd) return;
    addGameToList(selectedListToAdd, game.id, listAddNote);
    setSelectedListToAdd('');
    setListAddNote('');
    setShowLogSavedToast(true);
    setTimeout(() => setShowLogSavedToast(false), 2500);
  };

  const allStatuses: GameStatus[] = ['playing', 'completed', 'backlog', 'wishlist', 'paused', 'dropped'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
              Detalhes do Jogo
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{game.releaseYear}</span>
          </div>
          <button
            onClick={closeGameModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Hero Banner & Cover */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover art (3:4 ratio) */}
            <div className="w-40 sm:w-48 shrink-0 mx-auto md:mx-0">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 relative">
                {!imgError ? (
                  <img
                    src={game.coverUrl}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-800 text-slate-400">
                    <Gamepad2 className="w-12 h-12 text-indigo-400/60 mb-2" />
                    <span className="text-xs font-semibold text-slate-200">{game.title}</span>
                  </div>
                )}
                
                {/* Favorite button overlay */}
                <button
                  onClick={() => toggleFavoriteGame(game.id)}
                  className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                    status?.isFavorite
                      ? 'bg-pink-600 text-white'
                      : 'bg-black/60 text-slate-400 hover:text-pink-400 hover:bg-black/80'
                  }`}
                  title={status?.isFavorite ? 'Remover dos favoritos' : 'Favoritar jogo'}
                >
                  <Heart className={`w-4 h-4 ${status?.isFavorite ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Button to update game image */}
              <button
                type="button"
                onClick={() => setIsUpdateCoverOpen(true)}
                className="w-full mt-2.5 py-1.5 px-2 text-[11px] font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Trocar a imagem da capa deste jogo"
              >
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Atualizar Imagem</span>
              </button>
            </div>

            {/* Game Info & Synopsis */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                    {game.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-2">
                  <span className="font-semibold text-slate-300">{game.developer}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono tabular-nums">{game.releaseYear}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{game.genres.join(', ')}</span>
                </div>

                {/* Platforms */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {game.platforms.map((p, i) => (
                    <span 
                      key={i} 
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Summary */}
                {game.summary && (
                  <p className="text-sm text-slate-300 mt-4 leading-relaxed line-clamp-4">
                    {game.summary}
                  </p>
                )}
              </div>

              {/* Quick Status Bar */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
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
                    onChange={newRating => {
                      setRating(newRating);
                      updateGameStatus(game.id, selectedStatus, newRating, review, hours === '' ? 0 : Number(hours), status?.isFavorite);
                    }} 
                    showNumeric={true}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Log & Tracker Form */}
          <div className="bg-[#171c2b] p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Registrar no Backloggd / Atualizar Status</span>
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Selecione o Status:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {allStatuses.map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  const isSelected = selectedStatus === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedStatus(s)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? `${cfg.bgSubtle} ring-2 ring-indigo-500/50 font-semibold shadow-sm`
                          : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours and Review row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Horas Jogadas:
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Ex: 45"
                    value={hours}
                    onChange={e => setHours(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#11141e] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Avaliação (0.5 a 5 estrelas):
                </label>
                <div className="h-9 flex items-center px-3 bg-[#11141e] border border-white/10 rounded-lg">
                  <StarRating 
                    rating={rating} 
                    interactive={true} 
                    onChange={setRating} 
                    showNumeric={true}
                    size="md"
                  />
                  <span className="text-[11px] text-slate-500 ml-auto">Clique para definir nota</span>
                </div>
              </div>
            </div>

            {/* Review / Impressions */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Sua Resenha / Comentário sobre o Jogo:
              </label>
              <textarea
                rows={3}
                placeholder="O que achou da jogabilidade, narrativa, gráficos e ritmo?"
                value={review}
                onChange={e => setReview(e.target.value)}
                className="w-full bg-[#11141e] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddLogEntry}
                className="px-4 py-2 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="Salva uma nova entrada no histórico cronológico do seu Diário"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ Adicionar Entrada no Diário (Log)</span>
              </button>

              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Status Principal</span>
              </button>
            </div>

            {showLogSavedToast && (
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium transition-all">
                ✓ Registro atualizado com sucesso no seu perfil!
              </div>
            )}
          </div>

          {/* Add to List section */}
          <div className="bg-[#171c2b] p-5 rounded-xl border border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Adicionar este Jogo a uma das suas Listas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <select
                  value={selectedListToAdd}
                  onChange={e => setSelectedListToAdd(e.target.value)}
                  className="w-full bg-[#11141e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecione uma lista de jogos...</option>
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.items.length} jogos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  disabled={!selectedListToAdd}
                  onClick={handleAddToList}
                  className="w-full px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar à Lista</span>
                </button>
              </div>
            </div>

            {selectedListToAdd && (
              <div>
                <input
                  type="text"
                  placeholder="Anotação para esta lista (opcional, ex: 'Posição no ranking' ou 'Zerar primeiro')"
                  value={listAddNote}
                  onChange={e => setListAddNote(e.target.value)}
                  className="w-full bg-[#11141e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Past Logs for this game */}
          {gameLogs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>Histórico de Logs Registrados ({gameLogs.length})</span>
              </h3>

              <div className="space-y-2">
                {gameLogs.map(l => (
                  <div 
                    key={l.id} 
                    className="p-3 rounded-lg bg-[#141824] border border-white/5 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[11px]">{l.date}</span>
                        <StatusBadge status={l.status} size="sm" />
                        {l.rating ? (
                          <span className="text-amber-400 font-mono text-[11px] font-semibold">
                            ★ {l.rating.toFixed(1)}
                          </span>
                        ) : null}
                        {l.hoursSpent ? (
                          <span className="text-slate-500 text-[11px] font-mono">
                            {l.hoursSpent}h jogadas
                          </span>
                        ) : null}
                      </div>
                      {l.review && (
                        <p className="text-slate-300 leading-relaxed pt-0.5">
                          "{l.review}"
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteGameLog(l.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded transition-colors"
                      title="Excluir entrada de log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Update cover modal */}
      <UpdateCoverModal
        gameId={isUpdateCoverOpen ? game.id : null}
        onClose={() => setIsUpdateCoverOpen(false)}
      />
    </div>
  );
};
