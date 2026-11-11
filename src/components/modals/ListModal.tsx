import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Layers, X, Trash2, Award } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ListModal: React.FC = () => {
  const { 
    listModalData, 
    closeListModal, 
    folders, 
    createList, 
    updateList, 
    deleteList,
    setSelectedListId,
    setActiveView 
  } = useStore();
  const { isOpen, list, defaultFolderId } = listModalData;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [isRanked, setIsRanked] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
    if (list) {
      setTitle(list.title);
      setDescription(list.description || '');
      setFolderId(list.folderId || '');
      setIsRanked(list.isRanked || false);
    } else {
      setTitle('');
      setDescription('');
      setFolderId(defaultFolderId || '');
      setIsRanked(false);
    }
  }, [list, defaultFolderId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (list) {
      updateList(list.id, {
        title: title.trim(),
        description: description.trim(),
        folderId: folderId || null,
        isRanked,
      });
    } else {
      const created = createList(
        title.trim(),
        description.trim(),
        folderId || null,
        isRanked
      );
      setSelectedListId(created.id);
      setActiveView('folders');
    }
    closeListModal();
  };

  const handleConfirmDelete = () => {
    if (list) {
      deleteList(list.id);
      setIsConfirmingDelete(false);
      closeListModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">
              {list ? 'Editar Lista de Jogos' : 'Criar Nova Lista de Jogos'}
            </h2>
          </div>
          <button
            onClick={closeListModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Título da Lista *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Saga Resident Evil, GOTY por Ano, Jogos Zerados..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Pasta Pertencente (Hierarquia Pasta → Lista)
            </label>
            <select
              value={folderId}
              onChange={e => setFolderId(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Sem Pasta (Lista Avulsa / Raiz)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Descrição da Lista (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Minha ordem de preferência dos jogos, metas de gameplay..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Ranked Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-xs font-semibold text-slate-200">
                  Lista Ranqueada / Ordenada
                </span>
                <span className="block text-[11px] text-slate-400">
                  Exibe numeração (#1, #2, #3...) e permite ordenar os jogos por posição.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isRanked}
              onChange={e => setIsRanked(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-white/20 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {list ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Lista</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeListModal}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
              >
                {list ? 'Salvar Alterações' : 'Criar Lista'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmingDelete}
        title="Excluir Lista"
        message={`Deseja realmente excluir a lista "${list?.title}"? Esta ação removerá a lista e sua ordenação de jogos.`}
        confirmLabel="Excluir Lista"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
};
