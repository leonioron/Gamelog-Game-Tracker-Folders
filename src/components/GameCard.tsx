import React, { useState } from 'react';
import { Game } from '../types';
import { useStore } from '../context/StoreContext';
import { STATUS_CONFIG } from './StatusBadge';
import { Gamepad2, Heart, Check } from 'lucide-react';

interface GameCardProps {
  game: Game;
  rankIndex?: number;
  listNotes?: string;
  showActions?: boolean;
  variant?: 'default' | 'folder';
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  rankIndex,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const { openGameModal, getGameStatus } = useStore();
  const [imgError, setImgError] = useState(false);
  const status = getGameStatus(game.id);

  const statusConfig = status?.status ? STATUS_CONFIG[status.status] : null;

  const handleClick = () => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect();
    } else {
      openGameModal(game.id);
    }
  };

  return (
    <div
      className={`group relative flex flex-col min-w-0 bg-[#121824] rounded-xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-indigo-500/20'
          : 'border-white/5 hover:border-indigo-500/40'
      }`}
      onClick={handleClick}
    >
      {/* Poster Image Container (3:4 ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#090D14]">
        {!imgError ? (
          <img
            src={game.coverUrl}
            alt={game.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#090D14] text-slate-400">
            <Gamepad2 className="w-9 h-9 text-indigo-400/60 mb-2" />
            <span className="text-xs font-semibold text-slate-200 line-clamp-3">{game.title}</span>
            <span className="text-[10px] text-slate-500 mt-1 font-mono tabular-nums">{game.releaseYear}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-transparent to-black/35 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Multi-select checkbox */}
        {isSelectionMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleSelect) onToggleSelect();
            }}
            className="absolute top-1 left-1 z-20 min-h-[44px] min-w-[44px] flex items-start justify-start p-1.5 cursor-pointer"
            aria-label={isSelected ? `Desmarcar ${game.title}` : `Selecionar ${game.title}`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center border shadow-xl transition-all ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-400 text-white scale-105'
                  : 'bg-black/80 border-white/40 text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>
        )}

        {/* Rank Badge */}
        {rankIndex !== undefined && !isSelectionMode && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-amber-400 font-mono tabular-nums text-xs font-bold shadow-md">
            #{rankIndex}
          </div>
        )}

        {/* Favorite Heart */}
        {status?.isFavorite && (
          <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/70 backdrop-blur-md text-pink-400 shadow-md">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
          </div>
        )}

        {/* Current Status */}
        {statusConfig && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-md border border-white/10 text-[11px] font-medium shadow-md">
            <statusConfig.icon className={`w-3 h-3 shrink-0 ${statusConfig.color}`} />
            <span className={statusConfig.color}>{statusConfig.label}</span>
          </div>
        )}
      </div>

      {/* Card Info Section: Title and Year */}
      <div className="p-2.5 flex flex-col justify-center bg-[#121824] min-w-0">
        <h3
          className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1"
          title={game.title}
        >
          {game.title}
        </h3>
        <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
          {game.releaseYear}
        </div>
      </div>
    </div>
  );
};
