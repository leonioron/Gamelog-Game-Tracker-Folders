import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Layers,
  Edit2,
  Trash2,
  FolderPlus,
  ListPlus,
  Award,
} from 'lucide-react';
import { ConfirmModal } from './modals/ConfirmModal';

interface SidebarTreeProps {
  onSelectList?: () => void;
}

export const SidebarTree: React.FC<SidebarTreeProps> = ({ onSelectList }) => {
  const {
    folders,
    lists,
    selectedFolderId,
    setSelectedFolderId,
    selectedListId,
    setSelectedListId,
    openFolderModal,
    openListModal,
    deleteFolder,
    deleteList,
    getListsByFolder,
    getUncategorizedLists,
  } = useStore();

  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'folder' | 'list'; id: string; name: string } | null>(null);

  const toggleFolderCollapse = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedListId(null);
    setCollapsedFolders((prev) => ({ ...prev, [folderId]: false }));
    if (onSelectList) onSelectList();
  };

  const handleSelectList = (listId: string, folderId?: string | null) => {
    setSelectedListId(listId);
    if (folderId) setSelectedFolderId(folderId);
    if (onSelectList) onSelectList();
  };

  const uncategorized = getUncategorizedLists();

  return (
    <aside className="w-full md:w-72 lg:w-80 shrink-0 bg-[#0d121c] border-r border-white/5 flex flex-col h-full select-none min-w-0">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
            Hierarquia
          </span>
          <h2 className="text-sm font-semibold text-white truncate">
            Pastas & Listas
          </h2>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openFolderModal()}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Nova Pasta"
            aria-label="Nova Pasta"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openListModal(undefined, selectedFolderId || undefined)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Nova Lista"
            aria-label="Nova Lista"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-3 overflow-y-auto flex-1 space-y-1.5 text-xs min-w-0">
        <button
          type="button"
          onClick={() => {
            setSelectedFolderId(null);
            setSelectedListId(null);
            if (onSelectList) onSelectList();
          }}
          className={`min-h-[44px] w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
            selectedFolderId === null && selectedListId === null
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">Todas as Pastas & Listas</span>
          </div>
          <span className="font-mono tabular-nums text-[11px] text-slate-500 shrink-0">
            {lists.length}
          </span>
        </button>

        <div className="pt-2 pb-1 px-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Pastas (Folders)
          </span>
        </div>

        {folders.map((folder) => {
          const folderLists = getListsByFolder(folder.id);
          const isCollapsed = !!collapsedFolders[folder.id];
          const isFolderSelected = selectedFolderId === folder.id && selectedListId === null;

          return (
            <div key={folder.id} className="space-y-0.5 min-w-0">
              <div
                onClick={() => handleSelectFolder(folder.id)}
                className={`min-h-[44px] group flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer min-w-0 ${
                  isFolderSelected
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => toggleFolderCollapse(folder.id, e)}
                    className="min-h-[36px] min-w-[32px] flex items-center justify-center hover:text-white text-slate-400 cursor-pointer shrink-0"
                    aria-label={isCollapsed ? 'Expandir pasta' : 'Recolher pasta'}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: folder.color || '#6366f1' }}
                  />

                  <span className="truncate font-medium text-slate-200">{folder.name}</span>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="font-mono tabular-nums text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/5 mr-0.5">
                    {folderLists.length}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openFolderModal(folder);
                    }}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                    title="Editar pasta"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openListModal(undefined, folder.id);
                    }}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                    title="Criar lista nesta pasta"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ type: 'folder', id: folder.id, name: folder.name });
                    }}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer"
                    title="Excluir pasta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div className="pl-5 pr-1 space-y-0.5 border-l border-white/5 ml-4 my-1">
                  {folderLists.length === 0 ? (
                    <div className="py-1.5 px-2 text-[11px] text-slate-500 italic flex items-center justify-between">
                      <span>Nenhuma lista</span>
                      <button
                        type="button"
                        onClick={() => openListModal(undefined, folder.id)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                      >
                        + Criar lista
                      </button>
                    </div>
                  ) : (
                    folderLists.map((list) => {
                      const isListSelected = selectedListId === list.id;

                      return (
                        <div
                          key={list.id}
                          onClick={() => handleSelectList(list.id, folder.id)}
                          className={`min-h-[40px] group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
                            isListSelected
                              ? 'bg-indigo-600/30 text-indigo-200 font-semibold border border-indigo-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {list.isRanked ? (
                              <Award className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <span className="text-slate-600 font-mono text-[10px] shrink-0">├</span>
                            )}
                            <span className="truncate">{list.title}</span>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <span className="font-mono tabular-nums text-[10px] text-slate-500 mr-0.5">
                              {list.items.length}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openListModal(list);
                              }}
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                              title="Editar lista"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ type: 'list', id: list.id, name: list.title });
                              }}
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer"
                              title="Excluir lista"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {uncategorized.length > 0 && (
          <div className="pt-3 space-y-0.5 min-w-0">
            <div className="px-2 py-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Listas Avulsas
              </span>
            </div>

            {uncategorized.map((list) => {
              const isListSelected = selectedListId === list.id;

              return (
                <div
                  key={list.id}
                  onClick={() => handleSelectList(list.id, null)}
                  className={`min-h-[40px] group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer min-w-0 ${
                    isListSelected
                      ? 'bg-indigo-600/30 text-indigo-200 font-semibold border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {list.isRanked ? (
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{list.title}</span>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className="font-mono tabular-nums text-[10px] text-slate-500 mr-0.5">
                      {list.items.length}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openListModal(list);
                      }}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                      title="Editar lista"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ type: 'list', id: list.id, name: list.title });
                      }}
                      className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Excluir lista"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="p-3 border-t border-white/5 bg-[#090D14] space-y-2">
        <button
          type="button"
          onClick={() => openFolderModal()}
          className="min-h-[44px] w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-200 bg-[#121824] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
        >
          <FolderPlus className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>+ Nova Pasta</span>
        </button>

        <button
          type="button"
          onClick={() => openListModal(undefined, selectedFolderId || undefined)}
          className="min-h-[44px] w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
        >
          <ListPlus className="w-4 h-4 shrink-0" />
          <span>+ Nova Lista de Jogos</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title={deleteConfirm?.type === 'folder' ? 'Excluir Pasta' : 'Excluir Lista'}
        message={
          deleteConfirm?.type === 'folder'
            ? `Deseja realmente excluir a pasta "${deleteConfirm.name}"? As listas vinculadas não serão apagadas, apenas movidas para a raiz.`
            : `Deseja realmente excluir a lista "${deleteConfirm?.name}"?`
        }
        confirmLabel={deleteConfirm?.type === 'folder' ? 'Excluir Pasta' : 'Excluir Lista'}
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (!deleteConfirm) return;
          if (deleteConfirm.type === 'folder') {
            deleteFolder(deleteConfirm.id);
          } else {
            deleteList(deleteConfirm.id);
          }
          setDeleteConfirm(null);
        }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </aside>
  );
};
