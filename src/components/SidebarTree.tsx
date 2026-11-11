import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Folder as FolderIcon, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Layers, 
  MoreVertical, 
  Edit2, 
  Trash2,
  FolderPlus,
  ListPlus,
  Award
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
    getUncategorizedLists
  } = useStore();

  // Collapsed state for each folder
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'folder' | 'list'; id: string; name: string } | null>(null);

  const toggleFolderCollapse = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    // Auto uncollapse if selecting
    setCollapsedFolders(prev => ({ ...prev, [folderId]: false }));
  };

  const handleSelectList = (listId: string, folderId?: string | null) => {
    setSelectedListId(listId);
    if (folderId) setSelectedFolderId(folderId);
    if (onSelectList) onSelectList();
  };

  const uncategorized = getUncategorizedLists();

  return (
    <aside className="w-full md:w-72 lg:w-80 shrink-0 bg-[#0f131d] border-r border-white/5 flex flex-col h-full select-none">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
            Hierarquia
          </span>
          <h2 className="text-sm font-semibold text-white">
            Pastas & Listas
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => openFolderModal()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Nova Pasta"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => openListModal(undefined, selectedFolderId || undefined)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title="Nova Lista"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explorer Tree Content */}
      <div className="p-3 overflow-y-auto flex-1 space-y-1.5 text-xs">
        
        {/* All Lists / Root view item */}
        <button
          onClick={() => {
            setSelectedFolderId(null);
            setSelectedListId(null);
            if (onSelectList) onSelectList();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedFolderId === null && selectedListId === null
              ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Todas as Pastas & Listas</span>
          </div>
          <span className="font-mono tabular-nums text-[11px] text-slate-500">
            {lists.length}
          </span>
        </button>

        <div className="pt-2 pb-1 px-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Pastas (Folders)
          </span>
        </div>

        {/* Folders List */}
        {folders.map(folder => {
          const folderLists = getListsByFolder(folder.id);
          const isCollapsed = !!collapsedFolders[folder.id];
          const isFolderSelected = selectedFolderId === folder.id && selectedListId === null;

          return (
            <div key={folder.id} className="space-y-0.5">
              {/* Folder Row */}
              <div 
                onClick={() => handleSelectFolder(folder.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  isFolderSelected
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button 
                    onClick={(e) => toggleFolderCollapse(folder.id, e)}
                    className="p-0.5 hover:text-white text-slate-400 cursor-pointer"
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

                  <span className="truncate font-medium text-slate-200">
                    {folder.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-mono tabular-nums text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-white/5">
                    {folderLists.length}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFolderModal(folder);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                    title="Editar pasta"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openListModal(undefined, folder.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                    title="Criar lista dentro desta pasta"
                  >
                    <Plus className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm({ type: 'folder', id: folder.id, name: folder.name });
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
                    title="Excluir pasta"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Nested Lists inside Folder */}
              {!isCollapsed && (
                <div className="pl-6 pr-1 space-y-0.5 border-l border-white/5 ml-4 my-1">
                  {folderLists.length === 0 ? (
                    <div className="py-1 px-2 text-[11px] text-slate-500 italic flex items-center justify-between">
                      <span>Nenhuma lista</span>
                      <button
                        onClick={() => openListModal(undefined, folder.id)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        + Criar lista
                      </button>
                    </div>
                  ) : (
                    folderLists.map(list => {
                      const isListSelected = selectedListId === list.id;

                      return (
                        <div
                          key={list.id}
                          onClick={() => handleSelectList(list.id, folder.id)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                            isListSelected
                              ? 'bg-indigo-600/30 text-indigo-200 font-semibold border border-indigo-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {list.isRanked ? (
                              <Award className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <span className="text-slate-600 font-mono text-[10px]">├</span>
                            )}
                            <span className="truncate">{list.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono tabular-nums text-[10px] text-slate-500">
                              {list.items.length}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openListModal(list);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-opacity cursor-pointer"
                              title="Editar lista"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm({ type: 'list', id: list.id, name: list.title });
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
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

        {/* Uncategorized lists (without folder) */}
        {uncategorized.length > 0 && (
          <div className="pt-3 space-y-0.5">
            <div className="px-2 py-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Listas Avulsas (Sem Pasta)
              </span>
            </div>

            {uncategorized.map(list => {
              const isListSelected = selectedListId === list.id;

              return (
                <div
                  key={list.id}
                  onClick={() => handleSelectList(list.id, null)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isListSelected
                      ? 'bg-indigo-600/30 text-indigo-200 font-semibold border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {list.isRanked ? (
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{list.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-mono tabular-nums text-[10px] text-slate-500">
                      {list.items.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openListModal(list);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-slate-500 hover:text-white transition-opacity cursor-pointer"
                      title="Editar lista"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ type: 'list', id: list.id, name: list.title });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-opacity cursor-pointer"
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

      {/* Sidebar Footer Buttons */}
      <div className="p-3 border-t border-white/5 bg-[#0b0e14] space-y-2">
        <button
          onClick={() => openFolderModal()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
          <span>+ Nova Pasta</span>
        </button>

        <button
          onClick={() => openListModal(undefined, selectedFolderId || undefined)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
        >
          <ListPlus className="w-3.5 h-3.5" />
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
