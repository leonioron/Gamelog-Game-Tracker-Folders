import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Gamepad2, X, Plus, Image } from 'lucide-react';

export const CustomGameModal: React.FC = () => {
  const { isCustomGameModalOpen, setIsCustomGameModalOpen, createCustomGame, openGameModal } = useStore();

  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [developer, setDeveloper] = useState('');
  const [genres, setGenres] = useState('RPG, Ação');
  const [platforms, setPlatforms] = useState('PC, PlayStation 5');
  const [coverUrl, setCoverUrl] = useState('');
  const [summary, setSummary] = useState('');

  if (!isCustomGameModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newGame = createCustomGame({
      title: title.trim(),
      releaseYear: Number(releaseYear) || new Date().getFullYear(),
      developer: developer.trim() || 'Estúdio Independente',
      genres: genres.split(',').map(s => s.trim()).filter(Boolean),
      platforms: platforms.split(',').map(s => s.trim()).filter(Boolean),
      coverUrl: coverUrl.trim(),
      summary: summary.trim(),
    });

    setIsCustomGameModalOpen(false);
    openGameModal(newGame.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Cadastrar Jogo Personalizado
            </h2>
          </div>
          <button
            onClick={() => setIsCustomGameModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Título do Jogo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Silent Hill, Final Fantasy Tactics, Metroid Dread..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Ano de Lançamento
              </label>
              <input
                type="number"
                min="1970"
                max="2035"
                value={releaseYear}
                onChange={e => setReleaseYear(Number(e.target.value))}
                className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Estúdio / Desenvolvedora
              </label>
              <input
                type="text"
                placeholder="Ex: Konami, Nintendo, FromSoftware"
                value={developer}
                onChange={e => setDeveloper(e.target.value)}
                className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              URL da Capa / Poster (opcional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://... (deixe em branco para usar arte padrão)"
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                className="w-full bg-[#0d1017] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Gêneros (separados por vírgula)
            </label>
            <input
              type="text"
              placeholder="Ex: JRPG, Survival Horror, Aventura"
              value={genres}
              onChange={e => setGenres(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Plataformas (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder="Ex: PC, PS5, Switch, PS1, SNES"
              value={platforms}
              onChange={e => setPlatforms(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Sinopse / Descrição
            </label>
            <textarea
              rows={2}
              placeholder="Breve resumo da trama ou proposta do jogo..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsCustomGameModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar e Abrir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
