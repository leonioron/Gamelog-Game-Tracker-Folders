import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { GameCard } from '../GameCard';
import { StarRating } from '../StarRating';
import { StatusBadge } from '../StatusBadge';
import { ConfirmModal } from '../modals/ConfirmModal';
import { Pagination } from '../Pagination';
import { formatLocalDateDisplay } from '../../utils/date';
import {
  Folder as FolderIcon,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Award,
  Gamepad2,
  FolderPlus,
  Globe,
  CheckSquare,
  Check,
  ArrowLeft,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

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
    setIsImportBackloggdModalOpen,
  } = useStore();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [isSelectingGames, setIsSelectingGames] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);

  const [isSelectingFolders, setIsSelectingFolders] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  const [isSelectingLists, setIsSelectingLists] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);

  const [foldersPage, setFoldersPage] = useState(1);
  const [listsPage, setListsPage] = useState(1);
  const [listGamesPage, setListGamesPage] = useState(1);

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
    : selectedFolderId
    ? getFolderById(selectedFolderId)
    : null;

  useEffect(() => {
    setListsPage(1);
  }, [parentFolder?.id]);

  useEffect(() => {
    setListGamesPage(1);
  }, [selectedList?.id]);

  const toggleGameSelection = (gameId: string) => {
    setSelectedGameIds((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  const toggleSelectAllGames = () => {
    if (!selectedList) return;
    if (selectedGameIds.length === selectedList.items.length) {
      setSelectedGameIds([]);
    } else {
      setSelectedGameIds(selectedList.items.map((i) => i.gameId));
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
      },
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
      },
    });
  };

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const toggleSelectAllFolders = () => {
    if (selectedFolderIds.length === folders.length) {
      setSelectedFolderIds([]);
    } else {
      setSelectedFolderIds(folders.map((f) => f.id));
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
      },
    });
  };

  const currentDisplayedLists = parentFolder
    ? lists.filter((l) => l.folderId === parentFolder.id)
    : [];

  const totalFoldersPages = Math.max(1, Math.ceil(folders.length / ITEMS_PER_PAGE));
  const safeFoldersPage = Math.min(foldersPage, totalFoldersPages);
  const paginatedFolders = folders.slice(
    (safeFoldersPage - 1) * ITEMS_PER_PAGE,
    safeFoldersPage * ITEMS_PER_PAGE
  );

  const totalListsPages = Math.max(1, Math.ceil(currentDisplayedLists.length / ITEMS_PER_PAGE));
  const safeListsPage = Math.min(listsPage, totalListsPages);
  const paginatedLists = currentDisplayedLists.slice(
    (safeListsPage - 1) * ITEMS_PER_PAGE,
    safeListsPage * ITEMS_PER_PAGE
  );

  const selectedListItems = selectedList?.items || [];
  const totalListGamesPages = Math.max(1, Math.ceil(selectedListItems.length / ITEMS_PER_PAGE));
  const safeListGamesPage = Math.min(listGamesPage, totalListGamesPages);
  const paginatedListGames = selectedListItems.slice(
    (safeListGamesPage - 1) * ITEMS_PER_PAGE,
    safeListGamesPage * ITEMS_PER_PAGE
  );

  const toggleListSelection = (listId: string) => {
    setSelectedListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const toggleSelectAllLists = () => {
    if (selectedListIds.length === currentDisplayedLists.length) {
      setSelectedListIds([]);
    } else {
      setSelectedListIds(currentDisplayedLists.map((l) => l.id));
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
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-8 min-w-0">
      <div className="rounded-2xl border border-white/5 bg-[#121824] p-4 sm:p-7 min-w-0">
        {selectedList ? (
          /* Selected Game List View */
          <div className="space-y-6 min-w-0">
            {/* Breadcrumb & Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/5 min-w-0">
              <div className="min-w-0">
                <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFolderId(null);
                      setSelectedListId(null);
                      setIsSelectingGames(false);
                    }}
                    className="min-h-[36px] hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Pastas
                  </button>
                  {parentFolder && (
                    <>
                      <span aria-hidden="true">/</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFolderId(parentFolder.id);
                          setSelectedListId(null);
                          setIsSelectingGames(false);
                        }}
                        className="min-h-[36px] hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: parentFolder.color || '#6366f1' }}
                        />
                        <span className="truncate max-w-[160px]">{parentFolder.name}</span>
                      </button>
                    </>
                  )}
                  <span aria-hidden="true">/</span>
                  <span className="text-indigo-400 font-semibold truncate">{selectedList.title}</span>
                </nav>

                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white tracking-tight break-words">
                    {selectedList.title}
                  </h2>
                  {selectedList.isRanked && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Award className="w-3.5 h-3.5" />
                      <span>Ranqueada</span>
                    </span>
                  )}
                </div>

                {selectedList.description && (
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
                    {selectedList.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-mono tabular-nums">
                  <span>{selectedList.items.length} jogos</span>
                  <span aria-hidden="true">·</span>
                  <span>Atualizada em {formatLocalDateDisplay(selectedList.updatedAt)}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <div className="flex items-center gap-1 p-1 bg-[#090D14] rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Visualização em Pôsteres"
                    aria-label="Grade de pôsteres"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Visualização em Tabela"
                    aria-label="Tabela"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>

                {selectedList.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingGames(!isSelectingGames);
                      setSelectedGameIds([]);
                    }}
                    className={`min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelectingGames
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-[#090D14] text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 shrink-0" />
                    <span>{isSelectingGames ? 'Cancelar' : 'Selecionar'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openListModal(selectedList)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white bg-[#090D14] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Editar detalhes da lista"
                  aria-label="Editar lista"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleDeleteCurrentList}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer border border-rose-500/20"
                  title="Excluir esta lista"
                  aria-label="Excluir lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openAddGameToListModal(selectedList.id)}
                  className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Adicionar Jogo</span>
                </button>
              </div>
            </div>

            {/* Multi-select Bar */}
            {isSelectingGames && selectedList.items.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAllGames}
                    className="min-h-[44px] flex items-center gap-2 text-indigo-300 hover:text-white font-medium cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedGameIds.length === selectedList.items.length
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'border-white/30 bg-black/40'
                      }`}
                    >
                      {selectedGameIds.length === selectedList.items.length && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>
                    <span>
                      {selectedGameIds.length === selectedList.items.length
                        ? 'Desmarcar Todos'
                        : 'Selecionar Todos'}
                    </span>
                  </button>

                  <span className="text-slate-400 font-mono tabular-nums">
                    <strong className="text-white">{selectedGameIds.length}</strong>/{selectedList.items.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingGames(false);
                      setSelectedGameIds([]);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkRemoveGames}
                    disabled={selectedGameIds.length === 0}
                    className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="tabular-nums">Remover ({selectedGameIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Games in List */}
            {selectedList.items.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#090D14] rounded-2xl border border-white/5">
                <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-200">
                  Esta lista ainda não possui jogos
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                  Pesquise no catálogo local ou cadastre um jogo personalizado.
                </p>
                <button
                  type="button"
                  onClick={() => openAddGameToListModal(selectedList.id)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Primeiro Jogo</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {paginatedListGames.map((item, idx) => {
                    const actualIdx = (safeListGamesPage - 1) * ITEMS_PER_PAGE + idx;
                    const game = getGameById(item.gameId);
                    if (!game) return null;
                    const isSelected = selectedGameIds.includes(item.gameId);

                    return (
                      <div key={item.gameId} className="relative group/item min-w-0">
                        <GameCard
                          game={game}
                          rankIndex={selectedList.isRanked ? actualIdx + 1 : undefined}
                          listNotes={item.notes}
                          variant="folder"
                          isSelectionMode={isSelectingGames}
                          isSelected={isSelected}
                          onToggleSelect={() => toggleGameSelection(item.gameId)}
                        />

                        {!isSelectingGames && (
                          <div className="absolute top-1.5 right-1.5 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity flex flex-col gap-1 z-20">
                            {selectedList.isRanked && actualIdx > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderListGames(selectedList.id, actualIdx, actualIdx - 1);
                                }}
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-black/85 hover:bg-indigo-600 text-white shadow-md cursor-pointer"
                                title="Subir no ranking"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            )}
                            {selectedList.isRanked && actualIdx < selectedList.items.length - 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderListGames(selectedList.id, actualIdx, actualIdx + 1);
                                }}
                                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-black/85 hover:bg-indigo-600 text-white shadow-md cursor-pointer"
                                title="Descer no ranking"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setConfirmState({
                                  isOpen: true,
                                  title: 'Remover Jogo da Lista',
                                  message: `Deseja remover "${game.title}" desta lista? O jogo continuará no seu catálogo.`,
                                  confirmLabel: 'Remover',
                                  onConfirm: () => removeGameFromList(selectedList.id, game.id),
                                });
                              }}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-black/85 hover:bg-rose-600 text-white shadow-lg transition-colors cursor-pointer"
                              title="Remover da lista"
                              aria-label={`Remover ${game.title} da lista`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Pagination
                  currentPage={safeListGamesPage}
                  totalItems={selectedListItems.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={setListGamesPage}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#090D14]">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-slate-400 font-mono uppercase text-[10px]">
                        {isSelectingGames && (
                          <th className="py-3 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={selectedGameIds.length === selectedList.items.length && selectedList.items.length > 0}
                              onChange={toggleSelectAllGames}
                              className="w-4 h-4 rounded border-white/20 bg-black/40 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </th>
                        )}
                        <th className="py-3 px-3 w-12 text-center">#</th>
                        <th className="py-3 px-3 w-14">Capa</th>
                        <th className="py-3 px-4 font-sans">Jogo & Estúdio</th>
                        <th className="py-3 px-4">Status & Avaliação</th>
                        <th className="py-3 px-4">Anotação</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedListGames.map((item, idx) => {
                        const actualIdx = (safeListGamesPage - 1) * ITEMS_PER_PAGE + idx;
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
                              <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleGameSelection(game.id)}
                                  className="w-4 h-4 rounded border-white/20 bg-black/40 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              </td>
                            )}

                            <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-slate-400">
                              {selectedList.isRanked ? (
                                <span className="text-amber-400">#{actualIdx + 1}</span>
                              ) : (
                                <span className="text-slate-600">{actualIdx + 1}</span>
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
                                <span className="text-slate-300 italic text-[11px] block max-w-xs truncate">
                                  "{item.notes}"
                                </span>
                              ) : (
                                <span className="text-slate-600 text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                {selectedList.isRanked && actualIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => reorderListGames(selectedList.id, actualIdx, actualIdx - 1)}
                                    className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-white text-slate-400 hover:bg-white/10 rounded-lg cursor-pointer"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                )}
                                {selectedList.isRanked && actualIdx < selectedList.items.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => reorderListGames(selectedList.id, actualIdx, actualIdx + 1)}
                                    className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-white text-slate-400 hover:bg-white/10 rounded-lg cursor-pointer"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setConfirmState({
                                      isOpen: true,
                                      title: 'Remover Jogo da Lista',
                                      message: `Deseja remover "${game.title}" desta lista? O jogo continuará no seu catálogo.`,
                                      confirmLabel: 'Remover',
                                      onConfirm: () => removeGameFromList(selectedList.id, game.id),
                                    });
                                  }}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={safeListGamesPage}
                  totalItems={selectedListItems.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={setListGamesPage}
                />
              </div>
            )}
          </div>
        ) : parentFolder ? (
          /* Lists Inside Selected Folder View */
          <div className="space-y-6 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5 min-w-0">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolderId(null);
                    setIsSelectingLists(false);
                    setSelectedListIds([]);
                  }}
                  className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 mb-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Todas as Pastas</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight truncate">
                  {parentFolder.name}
                </h2>
                {parentFolder.description && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">{parentFolder.description}</p>
                )}
              </div>

              {/* Compact icon-only action toolbar */}
              <div className="flex items-center gap-2 shrink-0">
                {currentDisplayedLists.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingLists(!isSelectingLists);
                      setSelectedListIds([]);
                    }}
                    className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      isSelectingLists
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-indigo-400 hover:text-indigo-300 bg-[#090D14] border border-white/10'
                    }`}
                    title={isSelectingLists ? 'Cancelar seleção' : 'Selecionar listas'}
                    aria-label={isSelectingLists ? 'Cancelar seleção' : 'Selecionar listas'}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openFolderModal(parentFolder)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white bg-[#090D14] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
                  title="Editar pasta"
                  aria-label="Editar pasta"
                >
                  <Edit2 className="w-4 h-4 text-indigo-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmState({
                      isOpen: true,
                      title: 'Excluir Pasta',
                      message: `Deseja realmente excluir a pasta "${parentFolder.name}"? As listas vinculadas não serão apagadas, apenas movidas para a raiz.`,
                      confirmLabel: 'Excluir Pasta',
                      onConfirm: () => {
                        deleteFolder(parentFolder.id);
                        setSelectedFolderId(null);
                      },
                    });
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors cursor-pointer"
                  title="Excluir pasta"
                  aria-label="Excluir pasta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openListModal(undefined, parentFolder.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
                  title="Nova lista nesta pasta"
                  aria-label="Nova lista"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isSelectingLists && currentDisplayedLists.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAllLists}
                    className="min-h-[44px] flex items-center gap-2 text-indigo-300 hover:text-white font-medium cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedListIds.length === currentDisplayedLists.length
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'border-white/30 bg-black/40'
                      }`}
                    >
                      {selectedListIds.length === currentDisplayedLists.length && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>
                    <span>
                      {selectedListIds.length === currentDisplayedLists.length
                        ? 'Desmarcar Todas'
                        : 'Selecionar Todas'}
                    </span>
                  </button>

                  <span className="text-slate-400 font-mono tabular-nums">
                    <strong className="text-white">{selectedListIds.length}</strong>/{currentDisplayedLists.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingLists(false);
                      setSelectedListIds([]);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDeleteLists}
                    disabled={selectedListIds.length === 0}
                    className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="tabular-nums">Excluir ({selectedListIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {currentDisplayedLists.length > 0 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {paginatedLists.map((list) => {
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
                        className={`p-4 rounded-xl border transition-all cursor-pointer group space-y-2 min-w-0 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500'
                            : 'bg-[#090D14] hover:bg-[#161e2e] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            {isSelectingLists && (
                              <div
                                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-white/30 bg-black/40'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              {list.isRanked && (
                                <span className="inline-block mb-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  Ranking
                                </span>
                              )}
                              <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                                {list.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-mono tabular-nums text-xs font-bold text-slate-300 bg-[#121824] px-2.5 py-1 rounded-lg border border-white/5">
                              {list.items.length} {list.items.length === 1 ? 'jogo' : 'jogos'}
                            </span>

                            {!isSelectingLists && (
                              <div
                                className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => openListModal(list)}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-white text-slate-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                  title="Editar detalhes da lista"
                                  aria-label="Editar lista"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmState({
                                      isOpen: true,
                                      title: 'Excluir Lista',
                                      message: `Deseja realmente excluir a lista "${list.title}"?`,
                                      confirmLabel: 'Excluir Lista',
                                      onConfirm: () => deleteList(list.id),
                                    });
                                  }}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir lista"
                                  aria-label="Excluir lista"
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

                <Pagination
                  currentPage={safeListsPage}
                  totalItems={currentDisplayedLists.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={setListsPage}
                />
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-[#090D14] rounded-2xl border border-white/5">
                <FolderIcon className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
                <p className="text-xs text-slate-400 mb-4">
                  Esta pasta ainda não possui listas de jogos.
                </p>
                <button
                  type="button"
                  onClick={() => openListModal(undefined, parentFolder.id)}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeira Lista</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Root View: Only All Folders Block with Icon-Only Action Buttons */
          <div className="space-y-5 min-w-0">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/5 min-w-0">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight truncate">
                  Todas as Pastas
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5 tabular-nums">
                  {folders.length} {folders.length === 1 ? 'pasta cadastrada' : 'pastas cadastradas'}
                </p>
              </div>

              {/* Compact Icon-Only Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsImportBackloggdModalOpen(true)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-indigo-400 hover:text-white bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl transition-colors cursor-pointer"
                  title="Importar Backloggd"
                  aria-label="Importar Backloggd"
                >
                  <Globe className="w-4 h-4" />
                </button>

                {folders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingFolders(!isSelectingFolders);
                      setSelectedFolderIds([]);
                    }}
                    className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                      isSelectingFolders
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-300 hover:text-white bg-[#090D14] hover:bg-white/10 border border-white/10'
                    }`}
                    title={isSelectingFolders ? 'Cancelar seleção' : 'Selecionar pastas'}
                    aria-label={isSelectingFolders ? 'Cancelar seleção' : 'Selecionar pastas'}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openFolderModal()}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
                  title="Nova Pasta"
                  aria-label="Nova Pasta"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isSelectingFolders && folders.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAllFolders}
                    className="min-h-[44px] flex items-center gap-2 text-indigo-300 hover:text-white font-medium cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedFolderIds.length === folders.length
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'border-white/30 bg-black/40'
                      }`}
                    >
                      {selectedFolderIds.length === folders.length && (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                    </div>
                    <span>
                      {selectedFolderIds.length === folders.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                    </span>
                  </button>

                  <span className="text-slate-400 font-mono tabular-nums">
                    <strong className="text-white">{selectedFolderIds.length}</strong>/{folders.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingFolders(false);
                      setSelectedFolderIds([]);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDeleteFolders}
                    disabled={selectedFolderIds.length === 0}
                    className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="tabular-nums">Excluir ({selectedFolderIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {folders.length > 0 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {paginatedFolders.map((f) => {
                    const count = lists.filter((l) => l.folderId === f.id).length;
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
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between min-w-0 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500'
                            : 'bg-[#090D14] hover:bg-[#161e2e] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {isSelectingFolders && (
                                <div
                                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-white/30 bg-black/40'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                              )}
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${f.color || '#6366f1'}25`, color: f.color || '#6366f1' }}
                              >
                                <FolderIcon className="w-4 h-4" />
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                                {count} {count === 1 ? 'lista' : 'listas'}
                              </span>

                              {!isSelectingFolders && (
                                <div
                                  className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => openFolderModal(f)}
                                    className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-white text-slate-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                    title="Editar pasta"
                                    aria-label="Editar pasta"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setConfirmState({
                                        isOpen: true,
                                        title: 'Excluir Pasta',
                                        message: `Deseja excluir a pasta "${f.name}"? As listas não serão apagadas, apenas movidas para a raiz.`,
                                        confirmLabel: 'Excluir Pasta',
                                        onConfirm: () => deleteFolder(f.id),
                                      });
                                    }}
                                    className="min-h-[36px] min-w-[36px] flex items-center justify-center hover:text-rose-400 text-slate-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Excluir pasta"
                                    aria-label="Excluir pasta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
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

                <Pagination
                  currentPage={safeFoldersPage}
                  totalItems={folders.length}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={setFoldersPage}
                />
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-[#090D14] rounded-2xl border border-white/5">
                <FolderIcon className="w-10 h-10 text-slate-600 mx-auto mb-2.5" />
                <p className="text-xs text-slate-400 mb-4">
                  Nenhuma pasta criada ainda.
                </p>
                <button
                  type="button"
                  onClick={() => openFolderModal()}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Criar Primeira Pasta</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
