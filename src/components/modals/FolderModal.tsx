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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              {folder ? 'Editar Pasta de Listas' : 'Criar Nova Pasta'}
            </h2>
          </div>
          <button
            onClick={closeFolderModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Nome da Pasta *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Franquias Favoritas, Metas de 2026..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
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
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0d1017] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Cor de Identificação
            </label>
            <div className="flex items-center gap-2">
              {presetColors.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === c.hex ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-[#121622]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                >
                  {color === c.hex && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {folder ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Pasta</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeFolderModal}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
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
