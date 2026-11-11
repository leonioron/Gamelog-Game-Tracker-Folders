import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SidebarTree } from '../SidebarTree';
import { GameCard } from '../GameCard';
import { StarRating } from '../StarRating';
import { StatusBadge } from '../StatusBadge';
import { ConfirmModal } from '../modals/ConfirmModal';
import { 
  Folder as FolderIcon, 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  LayoutGrid, 
  List as ListIcon, 
  Award, 
  Calendar,
  Gamepad2,
  FolderPlus,
  Globe,
  CheckSquare,
  Square,
  Check,
  X
} from 'lucide-react';

export const ViewFolders: React.FC = () => {
  const { 
    folders, 
    lists, 
    selectedFolderId, 
    setSelectedFolderId, 
    selectedListId, 
    setSelectedListId, 
    getListById, 
    getFolderById, 
    getGameById, 
    getGameStatus,
    openAddGameToListModal, 
    openListModal, 
    openFolderModal, 
    removeGameFromList, 
    removeGamesFromList,
    deleteFolder,
    deleteFolders,
    deleteList,
    deleteLists,
    reorderListGames,
    openGameModal,
    setIsImportBackloggdModalOpen
  } = useStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Bulk selection states
  const [isSelectingGames, setIsSelectingGames] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);

  const [isSelectingFolders, setIsSelectingFolders] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  const [isSelectingLists, setIsSelectingLists] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const selectedList = selectedListId ? getListById(selectedListId) : null;
  const parentFolder = selectedList?.folderId 
    ? getFolderById(selectedList.folderId) 
    : (selectedFolderId ? getFolderById(selectedFolderId) : null);

  // Game selection handlers
  const toggleGameSelection = (gameId: string) => {
    setSelectedGameIds(prev => 
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const toggleSelectAllGames = () => {
    if (!selectedList) return;
    if (selectedGameIds.length === selectedList.items.length) {
      setSelectedGameIds([]);
    } else {
      setSelectedGameIds(selectedList.items.map(i => i.gameId));
    }
  };

  const handleBulkRemoveGames = () => {
    if (!selectedList || selectedGameIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Remover Jogos da Lista',
      message: `Deseja realmente remover ${selectedGameIds.length} ${selectedGameIds.length === 1 ? 'jogo' : 'jogos'} desta lista? Os jogos continuarão no seu catálogo geral.`,
      confirmLabel: 'Remover da Lista',
      onConfirm: () => {
        removeGamesFromList(selectedList.id, selectedGameIds);
        setSelectedGameIds([]);
        setIsSelectingGames(false);
      }
    });
  };

  const handleDeleteCurrentList = () => {
    if (!selectedList) return;
    setConfirmState({
      isOpen: true,
      title: 'Excluir Lista',
      message: `Deseja realmente excluir a lista "${selectedList.title}"?`,
      confirmLabel: 'Excluir Lista',
      onConfirm: () => {
        deleteList(selectedList.id);
      }
    });
  };

  // Folder selection handlers
  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolderIds(prev => 
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  const toggleSelectAllFolders = () => {
    if (selectedFolderIds.length === folders.length) {
      setSelectedFolderIds([]);
    } else {
      setSelectedFolderIds(folders.map(f => f.id));
    }
  };

  const handleBulkDeleteFolders = () => {
    if (selectedFolderIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Excluir Pastas Selecionadas',
      message: `Deseja realmente excluir ${selectedFolderIds.length} ${selectedFolderIds.length === 1 ? 'pasta' : 'pastas'}? As listas contidas não serão excluídas, apenas desvinculadas.`,
      confirmLabel: 'Excluir Pastas',
      onConfirm: () => {
        deleteFolders(selectedFolderIds);
        setSelectedFolderIds([]);
        setIsSelectingFolders(false);
      }
    });
  };

  // List selection handlers
  const currentDisplayedLists = parentFolder 
    ? lists.filter(l => l.folderId === parentFolder.id) 
    : lists;

  const toggleListSelection = (listId: string) => {
    setSelectedListIds(prev => 
      prev.includes(listId) ? prev.filter(id => id !== listId) : [...prev, listId]
    );
  };

  const toggleSelectAllLists = () => {
    if (selectedListIds.length === currentDisplayedLists.length) {
      setSelectedListIds([]);
    } else {
      setSelectedListIds(currentDisplayedLists.map(l => l.id));
    }
  };

  const handleBulkDeleteLists = () => {
    if (selectedListIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Excluir Listas Selecionadas',
      message: `Deseja realmente excluir ${selectedListIds.length} ${selectedListIds.length === 1 ? 'lista' : 'listas'} de jogos?`,
      confirmLabel: 'Excluir Listas',
      onConfirm: () => {
        deleteLists(selectedListIds);
        setSelectedListIds([]);
        setIsSelectingLists(false);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      
      {/* Mobile toggle for sidebar explorer */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-xs font-semibold text-white"
        >
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-indigo-400" />
            <span>Explorar Pastas e Listas ({folders.length} pastas · {lists.length} listas)</span>
          </div>
          <span className="text-slate-400 font-mono">{mobileSidebarOpen ? 'Fechar ▲' : 'Abrir ▼'}</span>
        </button>

        {mobileSidebarOpen && (
          <div className="mt-2 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <SidebarTree onSelectList={() => setMobileSidebarOpen(false)} />
          </div>
        )}
      </div>

      {/* Desktop Workspace: Sidebar Tree (280px) + Main Content Viewport */}
      <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden border border-white/5 bg-[#10141e] min-h-[700px]">
        
        {/* Left Sidebar Tree */}
        <div className="hidden md:block">
          <SidebarTree />
        </div>

        {/* Right Main Viewport */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
          {selectedList ? (
            /* Selected Game List View */
            <div className="space-y-6">
              
              {/* Breadcrumb & Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/5">
                <div>
                  <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
                    <button
                      onClick={() => {
                        setSelectedFolderId(null);
                        setSelectedListId(null);
                        setIsSelectingGames(false);
                      }}
                      className="hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      Pastas
                    </button>
                    {parentFolder && (
                      <>
                        <span aria-hidden="true">/</span>
                        <button
                          onClick={() => {
                            setSelectedFolderId(parentFolder.id);
                            setSelectedListId(null);
                            setIsSelectingGames(false);
                          }}
                          className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span 
                            className="w-2 h-2 rounded-full inline-block" 
                            style={{ backgroundColor: parentFolder.color || '#6366f1' }}
                          />
                          <span>{parentFolder.name}</span>
                        </button>
                      </>
                    )}
                    <span aria-hidden="true">/</span>
                    <span className="text-indigo-400 font-semibold">{selectedList.title}</span>
                  </nav>

                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                      {selectedList.title}
                    </h2>
                    {selectedList.isRanked && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Award className="w-3.5 h-3.5" />
                        <span>Ranqueada</span>
                      </span>
                    )}
                  </div>

                  {selectedList.description && (
                    <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
                      {selectedList.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
                    <span className="tabular-nums">{selectedList.items.length} jogos nesta lista</span>
                    <span aria-hidden="true">·</span>
                    <span>Atualizada em {selectedList.updatedAt}</span>
                  </div>
                </div>

                {/* List Action Toolbar */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Grid vs Table Switcher */}
                  <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Visualização em Pôsteres"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Visualização em Tabela / Ranking"
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Multi-Select Toggle Button */}
                  {selectedList.items.length > 0 && (
                    <button
                      onClick={() => {
                        setIsSelectingGames(!isSelectingGames);
                        setSelectedGameIds([]);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isSelectingGames 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                      }`}
                      title="Selecionar múltiplos jogos para remover"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{isSelectingGames ? 'Cancelar Seleção' : 'Selecionar Vários'}</span>
                    </button>
                  )}

                  {/* Edit list */}
                  <button
                    onClick={() => openListModal(selectedList)}
                    className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Editar detalhes da lista"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete list */}
                  <button
                    onClick={handleDeleteCurrentList}
                    className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                    title="Excluir esta lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Add Game */}
                  <button
                    onClick={() => openAddGameToListModal(selectedList.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Jogo</span>
                  </button>
                </div>
              </div>

              {/* Multi-select Action Bar (when isSelectingGames is active) */}
              {isSelectingGames && selectedList.items.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleSelectAllGames}
                      className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-medium cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedGameIds.length === selectedList.items.length
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'border-white/30 bg-black/40'
                      }`}>
                        {selectedGameIds.length === selectedList.items.length && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>
                        {selectedGameIds.length === selectedList.items.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                      </span>
                    </button>

                    <span className="text-slate-400 font-mono">
                      | <strong className="text-white">{selectedGameIds.length}</strong> de {selectedList.items.length} selecionados
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsSelectingGames(false);
                        setSelectedGameIds([]);
                      }}
                      className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleBulkRemoveGames}
                      disabled={selectedGameIds.length === 0}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-rose-950/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover Selecionados ({selectedGameIds.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Games in List */}
              {selectedList.items.length === 0 ? (
                <div className="text-center py-16 px-4 bg-[#141824]/50 rounded-2xl border border-white/5">
                  <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-200">
                    Esta lista ainda não possui jogos
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                    Pesquise em nosso catálogo de mais de 60 jogos clássicos e modernos ou cadastre um jogo personalizado.
                  </p>
                  <button
                    onClick={() => openAddGameToListModal(selectedList.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Primeiro Jogo</span>
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                /* Poster Grid View */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {selectedList.items.map((item, idx) => {
                    const game = getGameById(item.gameId);
                    if (!game) return null;
                    const isSelected = selectedGameIds.includes(item.gameId);

                    return (
                      <div key={item.gameId} className="relative group/item">
                        <GameCard
                          game={game}
                          rankIndex={selectedList.isRanked ? idx + 1 : undefined}
                          listNotes={item.notes}
                          variant="folder"
                          isSelectionMode={isSelectingGames}
                          isSelected={isSelected}
                          onToggleSelect={() => toggleGameSelection(item.gameId)}
                        />

                        {/* Quick action overlay buttons for list order & removal (hidden in multi-select mode) */}
                        {!isSelectingGames && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col gap-1 z-20">
                            {selectedList.isRanked && idx > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderListGames(selectedList.id, idx, idx - 1);
                                }}
                                className="p-1 rounded bg-black/80 hover:bg-indigo-600 text-white shadow-md cursor-pointer"
                                title="Subir no ranking"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {selectedList.isRanked && idx < selectedList.items.length - 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderListGames(selectedList.id, idx, idx + 1);
                                }}
                                className="p-1 rounded bg-black/80 hover:bg-indigo-600 text-white shadow-md cursor-pointer"
                                title="Descer no ranking"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setConfirmState({
                                  isOpen: true,
                                  title: 'Remover Jogo da Lista',
                                  message: `Deseja remover "${game.title}" desta lista? O jogo continuará no seu catálogo.`,
                                  confirmLabel: 'Remover',
                                  onConfirm: () => removeGameFromList(selectedList.id, game.id)
                                });
                              }}
                              className="p-1.5 rounded-md bg-black/90 hover:bg-rose-600 text-white shadow-lg transition-colors cursor-pointer"
                              title="Remover da lista"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* High-Density Table View */
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#141824]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-mono uppercase text-[10px]">
                        {isSelectingGames && (
                          <th className="py-3 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={selectedGameIds.length === selectedList.items.length && selectedList.items.length > 0}
                              onChange={toggleSelectAllGames}
                              className="rounded border-white/20 bg-black/40 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </th>
                        )}
                        <th className="py-3 px-3 w-12 text-center">#</th>
                        <th className="py-3 px-3 w-14">Capa</th>
                        <th className="py-3 px-4 font-sans">Jogo & Estúdio</th>
                        <th className="py-3 px-4">Gênero / Plataformas</th>
                        <th className="py-3 px-4">Status & Avaliação</th>
                        <th className="py-3 px-4">Anotação na Lista</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedList.items.map((item, idx) => {
                        const game = getGameById(item.gameId);
                        if (!game) return null;
                        const status = getGameStatus(game.id);
                        const isSelected = selectedGameIds.includes(item.gameId);

                        return (
                          <tr 
                            key={item.gameId} 
                            onClick={() => {
                              if (isSelectingGames) {
                                toggleGameSelection(game.id);
                              } else {
                                openGameModal(game.id);
                              }
                            }}
                            className={`transition-colors cursor-pointer group ${
                              isSelected ? 'bg-indigo-950/30' : 'hover:bg-white/[0.04]'
                            }`}
                          >
                            {isSelectingGames && (
                              <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleGameSelection(game.id)}
                                  className="rounded border-white/20 bg-black/40 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              </td>
                            )}

                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                              {selectedList.isRanked ? (
                                <span className="text-amber-400">#{idx + 1}</span>
                              ) : (
                                <span className="text-slate-600">{idx + 1}</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="w-10 h-14 rounded overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                                <img
                                  src={game.coverUrl}
                                  alt={game.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>

                            <td className="py-2.5 px-4">
                              <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors block">
                                {game.title}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                <span className="font-mono tabular-nums">{game.releaseYear}</span>
                                <span>·</span>
                                <span className="truncate max-w-[140px]">{game.developer}</span>
                              </div>
                            </td>

                            <td className="py-2.5 px-4 text-slate-400">
                              <span className="block truncate max-w-[180px]">{game.genres.slice(0, 2).join(', ')}</span>
                              <span className="text-[10px] text-slate-500 font-mono block truncate max-w-[180px]">
                                {game.platforms.slice(0, 2).join(', ')}
                              </span>
                            </td>

                            <td className="py-2.5 px-4">
                              <div className="space-y-1">
                                {status ? (
                                  <StatusBadge status={status.status} size="sm" />
                                ) : (
                                  <span className="text-slate-600 italic text-[11px]">Não registrado</span>
                                )}
                                {status?.rating ? (
                                  <StarRating rating={status.rating} size="sm" showNumeric={true} />
                                ) : null}
                              </div>
                            </td>

                            <td className="py-2.5 px-4">
                              {item.notes ? (
                                <span className="text-slate-300 italic text-[11px] bg-slate-950/60 p-1.5 rounded block max-w-xs truncate">
                                  "{item.notes}"
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                {selectedList.isRanked && idx > 0 && (
                                  <button
                                    onClick={() => reorderListGames(selectedList.id, idx, idx - 1)}
                                    className="p-1 hover:text-white text-slate-400 hover:bg-white/10 rounded"
                                    title="Mover para cima"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {selectedList.isRanked && idx < selectedList.items.length - 1 && (
                                  <button
                                    onClick={() => reorderListGames(selectedList.id, idx, idx + 1)}
                                    className="p-1 hover:text-white text-slate-400 hover:bg-white/10 rounded"
                                    title="Mover para baixo"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setConfirmState({
                                      isOpen: true,
                                      title: 'Remover Jogo da Lista',
                                      message: `Deseja remover "${game.title}" desta lista? O jogo continuará no seu catálogo.`,
                                      confirmLabel: 'Remover',
                                      onConfirm: () => removeGameFromList(selectedList.id, game.id)
                                    });
                                  }}
                                  className="p-1 hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 rounded ml-1 transition-colors"
                                  title="Remover da lista"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Folder Overview / Root View */
            <div className="space-y-8">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
                    {parentFolder ? `Pasta: ${parentFolder.name}` : 'Todas as Pastas & Listas'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {parentFolder?.description || 'Navegue pelas suas pastas temáticas, rankings e coleções de jogos organizadas.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsImportBackloggdModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg transition-colors cursor-pointer"
                    title="Importar do Backloggd via URL ou HTML"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Importar do Backloggd</span>
                  </button>

                  <button
                    onClick={() => openFolderModal(parentFolder || undefined)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{parentFolder ? 'Editar Pasta' : '+ Nova Pasta'}</span>
                  </button>

                  {/* Delete Current Folder Button */}
                  {parentFolder && (
                    <button
                      onClick={() => {
                        setConfirmState({
                          isOpen: true,
                          title: 'Excluir Pasta',
                          message: `Deseja realmente excluir a pasta "${parentFolder.name}"? As listas vinculadas não serão apagadas, apenas movidas para a raiz (sem pasta).`,
                          confirmLabel: 'Excluir Pasta',
                          onConfirm: () => {
                            deleteFolder(parentFolder.id);
                            setSelectedFolderId(null);
                          }
                        });
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                      title="Excluir esta pasta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Pasta</span>
                    </button>
                  )}

                  <button
                    onClick={() => openListModal(undefined, parentFolder?.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nova Lista</span>
                  </button>
                </div>
              </div>

              {/* Folders Cards Section */}
              {!parentFolder && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      Pastas Principais ({folders.length})
                    </h3>

                    {folders.length > 0 && (
                      <button
                        onClick={() => {
                          setIsSelectingFolders(!isSelectingFolders);
                          setSelectedFolderIds([]);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isSelectingFolders 
                            ? 'bg-indigo-600 text-white font-semibold' 
                            : 'text-indigo-400 hover:text-indigo-300 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{isSelectingFolders ? 'Cancelar Seleção' : 'Selecionar Pastas'}</span>
                      </button>
                    )}
                  </div>

                  {/* Folder Batch Action Bar */}
                  {isSelectingFolders && folders.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleSelectAllFolders}
                          className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-medium cursor-pointer"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            selectedFolderIds.length === folders.length
                              ? 'bg-indigo-600 border-indigo-400 text-white'
                              : 'border-white/30 bg-black/40'
                          }`}>
                            {selectedFolderIds.length === folders.length && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>
                            {selectedFolderIds.length === folders.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                          </span>
                        </button>

                        <span className="text-slate-400 font-mono">
                          | <strong className="text-white">{selectedFolderIds.length}</strong> de {folders.length} pastas selecionadas
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsSelectingFolders(false);
                            setSelectedFolderIds([]);
                          }}
                          className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleBulkDeleteFolders}
                          disabled={selectedFolderIds.length === 0}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-rose-950/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir Selecionadas ({selectedFolderIds.length})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {folders.map(f => {
                      const count = lists.filter(l => l.folderId === f.id).length;
                      const isSelected = selectedFolderIds.includes(f.id);

                      return (
                        <div
                          key={f.id}
                          onClick={() => {
                            if (isSelectingFolders) {
                              toggleFolderSelection(f.id);
                            } else {
                              setSelectedFolderId(f.id);
                            }
                          }}
                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
                            isSelected 
                              ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500' 
                              : 'bg-[#141824] hover:bg-[#181d2c] border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {isSelectingFolders && (
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-white/30 bg-black/40'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                )}
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                  style={{ backgroundColor: `${f.color || '#6366f1'}25`, color: f.color || '#6366f1' }}
                                >
                                  <FolderIcon className="w-4 h-4" />
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                                  {count} {count === 1 ? 'lista' : 'listas'}
                                </span>

                                {!isSelectingFolders && (
                                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1" onClick={e => e.stopPropagation()}>
                                    <button
                                      onClick={() => openFolderModal(f)}
                                      className="p-1 hover:text-white text-slate-400 hover:bg-white/10 rounded transition-colors"
                                      title="Editar pasta"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setConfirmState({
                                          isOpen: true,
                                          title: 'Excluir Pasta',
                                          message: `Deseja excluir a pasta "${f.name}"? As listas não serão apagadas, apenas movidas para a raiz.`,
                                          confirmLabel: 'Excluir Pasta',
                                          onConfirm: () => deleteFolder(f.id)
                                        });
                                      }}
                                      className="p-1 hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 rounded transition-colors"
                                      title="Excluir pasta"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                              {f.name}
                            </h4>
                          </div>

                          <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Ver listas da pasta</span>
                            <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">→</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lists Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      {parentFolder ? `Listas dentro de "${parentFolder.name}"` : 'Todas as Listas de Jogos'}
                    </h3>
                    {parentFolder && (
                      <button
                        onClick={() => setSelectedFolderId(null)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        ← Ver todas as pastas
                      </button>
                    )}
                  </div>

                  {currentDisplayedLists.length > 0 && (
                    <button
                      onClick={() => {
                        setIsSelectingLists(!isSelectingLists);
                        setSelectedListIds([]);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelectingLists 
                          ? 'bg-indigo-600 text-white font-semibold' 
                          : 'text-indigo-400 hover:text-indigo-300 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{isSelectingLists ? 'Cancelar Seleção' : 'Selecionar Listas'}</span>
                    </button>
                  )}
                </div>

                {/* List Batch Action Bar */}
                {isSelectingLists && currentDisplayedLists.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleSelectAllLists}
                        className="flex items-center gap-1.5 text-indigo-300 hover:text-white font-medium cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedListIds.length === currentDisplayedLists.length
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'border-white/30 bg-black/40'
                        }`}>
                          {selectedListIds.length === currentDisplayedLists.length && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>
                          {selectedListIds.length === currentDisplayedLists.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                        </span>
                      </button>

                      <span className="text-slate-400 font-mono">
                        | <strong className="text-white">{selectedListIds.length}</strong> de {currentDisplayedLists.length} listas selecionadas
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsSelectingLists(false);
                          setSelectedListIds([]);
                        }}
                        className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleBulkDeleteLists}
                        disabled={selectedListIds.length === 0}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-rose-950/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Selecionadas ({selectedListIds.length})</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentDisplayedLists.map(list => {
                    const f = list.folderId ? getFolderById(list.folderId) : null;
                    const isSelected = selectedListIds.includes(list.id);

                    return (
                      <div
                        key={list.id}
                        onClick={() => {
                          if (isSelectingLists) {
                            toggleListSelection(list.id);
                          } else {
                            setSelectedListId(list.id);
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group space-y-3 ${
                          isSelected 
                            ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500' 
                            : 'bg-[#141824] hover:bg-[#181d2c] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {isSelectingLists && (
                              <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-white/30 bg-black/40'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {f && (
                                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                                    <span 
                                      className="w-2 h-2 rounded-full inline-block" 
                                      style={{ backgroundColor: f.color || '#6366f1' }}
                                    />
                                    <span>{f.name}</span>
                                    <span>·</span>
                                  </span>
                                )}
                                {list.isRanked && (
                                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    Ranking
                                  </span>
                                )}
                              </div>
                              <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                {list.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono tabular-nums text-xs font-bold text-slate-300 bg-white/5 px-2 py-1 rounded">
                              {list.items.length} {list.items.length === 1 ? 'jogo' : 'jogos'}
                            </span>

                            {!isSelectingLists && (
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => openListModal(list)}
                                  className="p-1 hover:text-white text-slate-400 hover:bg-white/10 rounded transition-colors"
                                  title="Editar detalhes da lista"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmState({
                                      isOpen: true,
                                      title: 'Excluir Lista',
                                      message: `Deseja realmente excluir a lista "${list.title}"?`,
                                      confirmLabel: 'Excluir Lista',
                                      onConfirm: () => deleteList(list.id)
                                    });
                                  }}
                                  className="p-1 hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 rounded transition-colors"
                                  title="Excluir lista"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Confirmation Dialog Modal */}
      {confirmState && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel || 'Excluir'}
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

    </div>
  );
};
