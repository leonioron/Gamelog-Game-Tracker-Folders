import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Folder as FolderIcon, X, Check, Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const FolderModal: React.FC = () => {
  const { folderModalData, closeFolderModal, createFolder, updateFolder, deleteFolder, setSelectedFolderId } = useStore();
  const { isOpen, folder } = folderModalData;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
    if (folder) {
      setName(folder.name);
      setDescription(folder.description || '');
      setColor(folder.color || '#6366f1');
    } else {
      setName('');
      setDescription('');
      setColor('#6366f1');
    }
  }, [folder, isOpen]);

  if (!isOpen) return null;

  const presetColors = [
    { label: 'Índigo', hex: '#6366f1' },
    { label: 'Violeta', hex: '#8b5cf6' },
    { label: 'Azul', hex: '#38bdf8' },
    { label: 'Esmeralda', hex: '#34d399' },
    { label: 'Âmbar', hex: '#fbbf24' },
    { label: 'Rosa', hex: '#f472b6' },
    { label: 'Coral', hex: '#f87171' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (folder) {
      updateFolder(folder.id, { name: name.trim(), description: description.trim(), color });
    } else {
      const created = createFolder(name.trim(), description.trim(), color);
      setSelectedFolderId(created.id);
    }
    closeFolderModal();
  };

  const handleConfirmDelete = () => {
    if (folder) {
      deleteFolder(folder.id);
      setIsConfirmingDelete(false);
      closeFolderModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-safe-top bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={closeFolderModal}
    >
      <div
        className="relative w-full max-w-md min-w-0 bg-[#121824] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#090D14]">
          <div className="flex items-center gap-2 min-w-0">
            <FolderIcon className="w-4 h-4 text-indigo-400 shrink-0" />
            <h2 className="text-sm font-semibold text-white truncate">
              {folder ? 'Editar Pasta de Listas' : 'Criar Nova Pasta'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeFolderModal}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 min-w-0">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Nome da Pasta *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Franquias Favoritas, Metas de 2026..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px] w-full bg-[#090D14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Descrição (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Breve descrição sobre o tema desta pasta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090D14] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Cor de Identificação
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {presetColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`min-h-[44px] min-w-[44px] rounded-xl transition-transform cursor-pointer flex items-center justify-center ${
                    color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121824] scale-105' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                  aria-label={`Cor ${c.label}`}
                >
                  {color === c.hex && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/5">
            {folder ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>Excluir Pasta</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={closeFolderModal}
                className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
              >
                {folder ? 'Salvar Alterações' : 'Criar Pasta'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmingDelete}
        title="Excluir Pasta"
        message={`Deseja realmente excluir a pasta "${folder?.name}"? As listas vinculadas não serão apagadas, apenas movidas para a raiz (sem pasta).`}
        confirmLabel="Excluir Pasta"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
};
