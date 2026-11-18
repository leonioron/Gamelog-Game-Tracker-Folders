import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Image, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface UpdateCoverModalProps {
  gameId: string | null;
  onClose: () => void;
}

export const UpdateCoverModal: React.FC<UpdateCoverModalProps> = ({ gameId, onClose }) => {
  const { getGameById, updateGameCover } = useStore();
  const game = gameId ? getGameById(gameId) : null;

  const [newUrl, setNewUrl] = useState('');
  const [testImgError, setTestImgError] = useState(false);

  useEffect(() => {
    if (game) {
      setNewUrl(game.coverUrl);
      setTestImgError(false);
    }
  }, [game, gameId]);

  if (!gameId || !game) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    updateGameCover(game.id, newUrl.trim());
    onClose();
  };

  const currentPreviewUrl = newUrl.trim() || game.coverUrl;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-4 pt-safe-top bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md min-w-0 bg-[#121824] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#090D14]">
          <div className="flex items-center gap-2 min-w-0">
            <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
            <h2 className="text-sm font-semibold text-white truncate">
              Atualizar Imagem da Capa
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 min-w-0">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Jogo:</span>
            <h3 className="text-base font-bold text-white font-display truncate">
              {game.title}
            </h3>
          </div>

          <div className="flex justify-center py-2">
            <div className="w-32 aspect-[3/4] rounded-xl overflow-hidden shadow-xl border border-white/10 bg-[#090D14] relative">
              <img
                src={currentPreviewUrl}
                alt="Prévia da capa"
                referrerPolicy="no-referrer"
                onError={() => setTestImgError(true)}
                onLoad={() => setTestImgError(false)}
                className="w-full h-full object-cover"
              />
              {testImgError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-2 text-center text-[10px] text-rose-400">
                  <AlertCircle className="w-5 h-5 mb-1" />
                  <span>Erro ao carregar imagem</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              URL da Nova Capa *
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="https://... ou /assets/default-cover.svg"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setTestImgError(false);
                }}
                className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newUrl.trim() || newUrl.trim() === game.coverUrl}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>Salvar Nova Capa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
