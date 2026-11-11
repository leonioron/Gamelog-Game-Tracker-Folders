import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Image, X, Check, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface UpdateCoverModalProps {
  gameId: string | null;
  onClose: () => void;
}

export const UpdateCoverModal: React.FC<UpdateCoverModalProps> = ({ gameId, onClose }) => {
  const { getGameById, updateGameCover } = useStore();
  const game = gameId ? getGameById(gameId) : null;

  const [newUrl, setNewUrl] = useState('');
  const [testImgError, setTestImgError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1200);
  };

  const currentPreviewUrl = newUrl.trim() || game.coverUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Atualizar Imagem da Capa
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Jogo:</span>
            <h3 className="text-base font-bold text-white font-display">
              {game.title}
            </h3>
          </div>

          {/* Cover Preview */}
          <div className="flex justify-center py-2">
            <div className="w-32 aspect-[3/4] rounded-xl overflow-hidden shadow-xl border border-white/10 bg-slate-900 relative">
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
              URL da Nova Capa (formato 3:4 pôster recomendado) *
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                placeholder="https://... Cole aqui o link direto da imagem"
                value={newUrl}
                onChange={e => {
                  setNewUrl(e.target.value);
                  setTestImgError(false);
                }}
                className="w-full bg-[#0d1017] border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Você pode usar links do Steam CDN, IGDB, MobyGames ou qualquer link direto de imagem (.jpg, .png, .webp).
            </p>
          </div>

          {showSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
              ✓ Imagem atualizada com sucesso!
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newUrl.trim() || newUrl.trim() === game.coverUrl}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Nova Capa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
