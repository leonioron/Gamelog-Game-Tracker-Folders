import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Gamepad2, 
  Play, 
  Bookmark, 
  CheckCircle2, 
  Heart, 
  Star, 
  BookOpen, 
  MapPin, 
  Edit3, 
  FolderTree,
  Share2
} from 'lucide-react';

export const ProfileHeader: React.FC = () => {
  const { 
    userProfile, 
    userStatuses, 
    logs, 
    setActiveView, 
    activeView, 
    folders, 
    lists, 
    setIsEditProfileModalOpen 
  } = useStore();

  const statusesList = Object.values(userStatuses);

  const totalLoggedGames = statusesList.length;
  const playingCount = statusesList.filter(s => s.status === 'playing').length;
  const backlogCount = statusesList.filter(s => s.status === 'backlog').length;
  const completedCount = statusesList.filter(s => s.status === 'completed').length;
  const wishlistCount = statusesList.filter(s => s.status === 'wishlist').length;
  
  // Rating calculation
  const ratedGames = statusesList.filter(s => s.rating > 0);
  const avgRating = ratedGames.length > 0 
    ? (ratedGames.reduce((acc, curr) => acc + curr.rating, 0) / ratedGames.length).toFixed(1)
    : '0.0';

  const statItems = [
    { label: 'Jogos Registrados', count: totalLoggedGames, icon: Gamepad2, color: 'text-indigo-400', view: 'overview' as const },
    { label: 'Jogando', count: playingCount, icon: Play, color: 'text-sky-400', view: 'playing' as const },
    { label: 'Backlog', count: backlogCount, icon: Bookmark, color: 'text-amber-400', view: 'backlog' as const },
    { label: 'Zerados', count: completedCount, icon: CheckCircle2, color: 'text-emerald-400', view: 'completed' as const },
    { label: 'Desejos', count: wishlistCount, icon: Heart, color: 'text-pink-400', view: 'wishlist' as const },
    { label: 'Pastas & Listas', count: lists.length, icon: FolderTree, color: 'text-violet-400', view: 'folders' as const },
    { label: 'Diário de Logs', count: logs.length, icon: BookOpen, color: 'text-slate-300', view: 'logs' as const },
  ];

  return (
    <div className="relative mb-8 bg-[#10141e] border-b border-white/5 pb-6">
    
    </div>
  );
};
