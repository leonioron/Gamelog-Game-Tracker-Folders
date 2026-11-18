import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, X, Check } from 'lucide-react';

export const EditProfileModal: React.FC = () => {
  const { isEditProfileModalOpen, setIsEditProfileModalOpen, userProfile, updateUserProfile } = useStore();

  const [displayName, setDisplayName] = useState(userProfile.displayName);
  const [username, setUsername] = useState(userProfile.username);
  const [bio, setBio] = useState(userProfile.bio);
  const [location, setLocation] = useState(userProfile.location);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(userProfile.bannerUrl);

  useEffect(() => {
    if (isEditProfileModalOpen) {
      setDisplayName(userProfile.displayName);
      setUsername(userProfile.username);
      setBio(userProfile.bio);
      setLocation(userProfile.location);
      setAvatarUrl(userProfile.avatarUrl);
      setBannerUrl(userProfile.bannerUrl);
    }
  }, [isEditProfileModalOpen, userProfile]);

  if (!isEditProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: displayName.trim() || 'Leonio Ranulfo',
      username: username.trim() || 'Leonio_Ranulfo',
      bio: bio.trim(),
      location: location.trim() || 'Brasil',
      avatarUrl: avatarUrl.trim() || '/assets/default-avatar.svg',
      bannerUrl: bannerUrl.trim() || '/assets/default-banner.svg',
    });
    setIsEditProfileModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-safe-top bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={() => setIsEditProfileModalOpen(false)}
    >
      <div
        className="relative w-full max-w-md min-w-0 bg-[#121824] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#090D14] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <User className="w-4 h-4 text-indigo-400 shrink-0" />
            <h2 className="text-sm font-semibold text-white truncate">
              Editar Perfil do Gamelog
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsEditProfileModalOpen(false)}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto min-w-0">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Nome de Exibição
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Nome de Usuário (Handle)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Localização
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Biografia
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#090D14] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              URL da Foto de Avatar (ou /assets/default-avatar.svg)
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              URL do Banner (ou /assets/default-banner.svg)
            </label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(false)}
              className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 shrink-0" />
              <span>Salvar Perfil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
