import React from 'react';
import { GameStatus } from '../types';
import { Play, CheckCircle2, Bookmark, Heart, XCircle, PauseCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: GameStatus;
  size?: 'sm' | 'md';
  variant?: 'subtle' | 'minimal';
}

export const STATUS_CONFIG: Record<GameStatus, {
  label: string;
  color: string;
  bgSubtle: string;
  icon: React.ElementType;
}> = {
  playing: {
    label: 'Jogando',
    color: 'text-sky-400',
    bgSubtle: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    icon: Play,
  },
  completed: {
    label: 'Zerado',
    color: 'text-emerald-400',
    bgSubtle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    icon: CheckCircle2,
  },
  backlog: {
    label: 'Backlog',
    color: 'text-amber-400',
    bgSubtle: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    icon: Bookmark,
  },
  wishlist: {
    label: 'Desejo',
    color: 'text-pink-400',
    bgSubtle: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    icon: Heart,
  },
  paused: {
    label: 'Pausado',
    color: 'text-violet-400',
    bgSubtle: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    icon: PauseCircle,
  },
  dropped: {
    label: 'Abandonado',
    color: 'text-rose-400',
    bgSubtle: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    icon: XCircle,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  variant = 'subtle',
}) => {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;

  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium ${config.color} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${config.bgSubtle} ${size === 'sm' ? 'text-xs' : 'text-xs font-medium'}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
