import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  Game,
  Folder,
  GameList,
  UserGameStatus,
  GameLog,
  UserProfile,
  ActiveView,
  GameStatus,
  ImportMode,
  BackupPayload,
  ToastNotification,
} from '../types';
import {
  INITIAL_GAMES,
  INITIAL_FOLDERS,
  INITIAL_LISTS,
  INITIAL_USER_STATUSES,
  INITIAL_LOGS,
  INITIAL_USER_PROFILE,
} from '../data/initialData';
import { storageService, STORAGE_KEYS } from '../services/storage';
import { exportTextFile, copyTextToClipboard } from '../services/fileExport';
import { getLocalDateString, getLocalTimestampFilename, getLocalTimestampISO } from '../utils/date';
import { generateGamesCsv, parseAndValidateBackupJson } from '../utils/format';

interface StoreContextType {
  games: Game[];
  folders: Folder[];
  lists: GameList[];
  userStatuses: Record<string, UserGameStatus>;
  logs: GameLog[];
  userProfile: UserProfile;
  activeView: ActiveView;
  selectedFolderId: string | null;
  selectedListId: string | null;
  searchTerm: string;
  statusFilter: GameStatus | 'all';

  // Toast feedback
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;

  // Modals
  activeGameModalId: string | null;
  addGameToListModalListId: string | null;
  folderModalData: { isOpen: boolean; folder?: Folder };
  listModalData: { isOpen: boolean; list?: GameList; defaultFolderId?: string };
  isCustomGameModalOpen: boolean;
  isBackupModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  isImportBackloggdModalOpen: boolean;

  // View state setters
  setActiveView: (view: ActiveView) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSelectedListId: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: GameStatus | 'all') => void;

  // Modal open/close actions
  openGameModal: (gameId: string) => void;
  closeGameModal: () => void;
  openAddGameToListModal: (listId: string) => void;
  closeAddGameToListModal: () => void;
  openFolderModal: (folder?: Folder) => void;
  closeFolderModal: () => void;
  openListModal: (list?: GameList, defaultFolderId?: string) => void;
  closeListModal: () => void;
  setIsCustomGameModalOpen: (isOpen: boolean) => void;
  setIsBackupModalOpen: (isOpen: boolean) => void;
  setIsEditProfileModalOpen: (isOpen: boolean) => void;
  setIsImportBackloggdModalOpen: (isOpen: boolean) => void;
  importParsedBackloggdData: (data: any) => { foldersCreated: number; listsCreated: number; gamesAdded: number };

  // Folder CRUD
  createFolder: (name: string, description?: string, color?: string) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  deleteFolders: (ids: string[]) => void;

  // List CRUD
  createList: (title: string, description?: string, folderId?: string | null, isRanked?: boolean) => GameList;
  updateList: (id: string, updates: Partial<GameList>) => void;
  deleteList: (id: string) => void;
  deleteLists: (ids: string[]) => void;
  addGameToList: (listId: string, gameId: string, notes?: string) => void;
  removeGameFromList: (listId: string, gameId: string) => void;
  removeGamesFromList: (listId: string, gameIds: string[]) => void;
  reorderListGames: (listId: string, fromIndex: number, toIndex: number) => void;

  // Status, Rating & Log Actions
  updateGameStatus: (
    gameId: string,
    status: GameStatus,
    rating?: number,
    review?: string,
    hours?: number,
    isFavorite?: boolean
  ) => void;
  removeGamesStatus: (gameIds: string[]) => void;
  unfavoriteGames: (gameIds: string[]) => void;
  toggleFavoriteGame: (gameId: string) => void;
  createGameLog: (gameId: string, status: GameStatus, rating?: number, review?: string, hoursSpent?: number) => void;
  deleteGameLog: (logId: string) => void;

  // Custom Game & Game Management
  createCustomGame: (game: Omit<Game, 'id'>) => Game;
  updateGameCover: (gameId: string, coverUrl: string) => void;
  updateGame: (gameId: string, updates: Partial<Game>) => void;
  deleteGame: (gameId: string) => void;
  deleteGames: (gameIds: string[]) => void;

  // Profile
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Import / Export
  buildBackupJson: () => string;
  exportData: () => Promise<{ success: boolean; filename?: string; message?: string }>;
  exportCsv: () => Promise<{ success: boolean; filename?: string; message?: string }>;
  copyBackupToClipboard: () => Promise<boolean>;
  importData: (jsonString: string, mode?: ImportMode) => { success: boolean; message: string };
  resetToDefaults: () => void;
  lastLoadedBackupName: string | null;
  serverBackupAvailable: boolean;

  // Helpers
  getGameById: (id: string) => Game | undefined;
  getGameStatus: (gameId: string) => UserGameStatus | undefined;
  getFolderById: (id: string) => Folder | undefined;
  getListById: (id: string) => GameList | undefined;
  getListsByFolder: (folderId: string) => GameList[];
  getUncategorizedLists: () => GameList[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fast synchronous hydration from localStorage fallback
  const [games, setGames] = useState<Game[]>(() => storageService.getSync(STORAGE_KEYS.GAMES, INITIAL_GAMES));
  const [folders, setFolders] = useState<Folder[]>(() => storageService.getSync(STORAGE_KEYS.FOLDERS, INITIAL_FOLDERS));
  const [lists, setLists] = useState<GameList[]>(() => storageService.getSync(STORAGE_KEYS.LISTS, INITIAL_LISTS));
  const [userStatuses, setUserStatuses] = useState<Record<string, UserGameStatus>>(() =>
    storageService.getSync(STORAGE_KEYS.STATUSES, INITIAL_USER_STATUSES)
  );
  const [logs, setLogs] = useState<GameLog[]>(() => storageService.getSync(STORAGE_KEYS.LOGS, INITIAL_LOGS));
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    storageService.getSync(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE)
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // UI state
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');

  // Toast state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Modals state
  const [activeGameModalId, setActiveGameModalId] = useState<string | null>(null);
  const [addGameToListModalListId, setAddGameToListModalListId] = useState<string | null>(null);
  const [folderModalData, setFolderModalData] = useState<{ isOpen: boolean; folder?: Folder }>({ isOpen: false });
  const [listModalData, setListModalData] = useState<{ isOpen: boolean; list?: GameList; defaultFolderId?: string }>({ isOpen: false });
  const [isCustomGameModalOpen, setIsCustomGameModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isImportBackloggdModalOpen, setIsImportBackloggdModalOpen] = useState(false);

  const [lastLoadedBackupName, setLastLoadedBackupName] = useState<string | null>(null);
  const [serverBackupAvailable, setServerBackupAvailable] = useState<boolean>(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastNotification['type'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
      setTimeout(() => {
        dismissToast(id);
      }, 3200);
    },
    [dismissToast]
  );

  // Primary IndexedDB hydration + optional local Express /backup auto-import on Web
  useEffect(() => {
    let isMounted = true;

    async function hydrateOfflineAndServer() {
      try {
        const [idbGames, idbFolders, idbLists, idbStatuses, idbLogs, idbProfile] = await Promise.all([
          storageService.load(STORAGE_KEYS.GAMES, INITIAL_GAMES),
          storageService.load(STORAGE_KEYS.FOLDERS, INITIAL_FOLDERS),
          storageService.load(STORAGE_KEYS.LISTS, INITIAL_LISTS),
          storageService.load(STORAGE_KEYS.STATUSES, INITIAL_USER_STATUSES),
          storageService.load(STORAGE_KEYS.LOGS, INITIAL_LOGS),
          storageService.load(STORAGE_KEYS.PROFILE, INITIAL_USER_PROFILE),
        ]);

        if (isMounted) {
          setGames(idbGames);
          setFolders(idbFolders);
          setLists(idbLists);
          setUserStatuses(idbStatuses);
          setLogs(idbLogs);
          setUserProfile(idbProfile);
        }

        // Only query /api/backups/latest when running on Web (not inside offline Android APK)
        if (!Capacitor.isNativePlatform()) {
          try {
            const res = await fetch('/api/backups/latest');
            if (res.ok) {
              const result = await res.json();
              if (isMounted && result.success && result.backup && result.backup.data) {
                const { filename, data } = result.backup;
                setServerBackupAvailable(true);
                setLastLoadedBackupName(filename);

                if (Array.isArray(data.games)) setGames(data.games);
                if (Array.isArray(data.folders)) setFolders(data.folders);
                if (Array.isArray(data.lists)) setLists(data.lists);
                if (data.userStatuses && typeof data.userStatuses === 'object') setUserStatuses(data.userStatuses);
                if (Array.isArray(data.logs)) setLogs(data.logs);
                if (data.userProfile && typeof data.userProfile === 'object') setUserProfile(data.userProfile);
              }
            }
          } catch {
            // Pure offline / static mode: IndexedDB + localStorage continue seamlessly
          }
        }
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    }

    hydrateOfflineAndServer();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state to IndexedDB (primary) + localStorage (fallback/sync) after hydration
  useEffect(() => {
    if (!isHydrated) return;
    storageService.save(STORAGE_KEYS.GAMES, games);
  }, [games, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    storageService.save(STORAGE_KEYS.FOLDERS, folders);
  }, [folders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    storageService.save(STORAGE_KEYS.LISTS, lists);
  }, [lists, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    storageService.save(STORAGE_KEYS.STATUSES, userStatuses);
  }, [userStatuses, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    storageService.save(STORAGE_KEYS.LOGS, logs);
  }, [logs, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    storageService.save(STORAGE_KEYS.PROFILE, userProfile);
  }, [userProfile, isHydrated]);

  // Modal handlers
  const openGameModal = (gameId: string) => setActiveGameModalId(gameId);
  const closeGameModal = () => setActiveGameModalId(null);

  const openAddGameToListModal = (listId: string) => setAddGameToListModalListId(listId);
  const closeAddGameToListModal = () => setAddGameToListModalListId(null);

  const openFolderModal = (folder?: Folder) => setFolderModalData({ isOpen: true, folder });
  const closeFolderModal = () => setFolderModalData({ isOpen: false });

  const openListModal = (list?: GameList, defaultFolderId?: string) =>
    setListModalData({ isOpen: true, list, defaultFolderId });
  const closeListModal = () => setListModalData({ isOpen: false });

  // Folder operations
  const createFolder = (name: string, description?: string, color?: string): Folder => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      description: description?.trim(),
      color: color || '#6366f1',
      createdAt: getLocalDateString(),
    };
    setFolders((prev) => [newFolder, ...prev]);
    showToast(`Pasta "${newFolder.name}" criada.`);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    showToast('Pasta atualizada.');
  };

  const deleteFolder = (id: string) => {
    deleteFolders([id]);
  };

  const deleteFolders = (ids: string[]) => {
    const idSet = new Set(ids);
    setLists((prev) => prev.map((l) => (l.folderId && idSet.has(l.folderId) ? { ...l, folderId: null } : l)));
    setFolders((prev) => prev.filter((f) => !idSet.has(f.id)));
    if (selectedFolderId && idSet.has(selectedFolderId)) setSelectedFolderId(null);
    showToast(ids.length === 1 ? 'Pasta excluída.' : `${ids.length} pastas excluídas.`);
  };

  // List operations
  const createList = (
    title: string,
    description?: string,
    folderId?: string | null,
    isRanked: boolean = false
  ): GameList => {
    const today = getLocalDateString();
    const newList: GameList = {
      id: `list-${Date.now()}`,
      title: title.trim(),
      description: description?.trim(),
      folderId: folderId || null,
      isRanked,
      items: [],
      createdAt: today,
      updatedAt: today,
    };
    setLists((prev) => [newList, ...prev]);
    showToast(`Lista "${newList.title}" criada.`);
    return newList;
  };

  const updateList = (id: string, updates: Partial<GameList>) => {
    const today = getLocalDateString();
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: today } : l)));
    showToast('Lista atualizada.');
  };

  const deleteList = (id: string) => {
    deleteLists([id]);
  };

  const deleteLists = (ids: string[]) => {
    const idSet = new Set(ids);
    setLists((prev) => prev.filter((l) => !idSet.has(l.id)));
    if (selectedListId && idSet.has(selectedListId)) setSelectedListId(null);
    showToast(ids.length === 1 ? 'Lista excluída.' : `${ids.length} listas excluídas.`);
  };

  const addGameToList = (listId: string, gameId: string, notes?: string) => {
    const today = getLocalDateString();
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        if (l.items.some((item) => item.gameId === gameId)) return l;

        const newItems = [
          ...l.items,
          {
            gameId,
            order: l.items.length + 1,
            notes: notes?.trim(),
            addedAt: today,
          },
        ];
        return { ...l, items: newItems, updatedAt: today };
      })
    );
    showToast('Jogo adicionado à lista.');
  };

  const removeGameFromList = (listId: string, gameId: string) => {
    removeGamesFromList(listId, [gameId]);
  };

  const removeGamesFromList = (listId: string, gameIds: string[]) => {
    const gameIdSet = new Set(gameIds);
    const today = getLocalDateString();
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        const filtered = l.items.filter((item) => !gameIdSet.has(item.gameId));
        const reordered = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
        return { ...l, items: reordered, updatedAt: today };
      })
    );
    showToast(gameIds.length === 1 ? 'Jogo removido da lista.' : `${gameIds.length} jogos removidos da lista.`);
  };

  const reorderListGames = (listId: string, fromIndex: number, toIndex: number) => {
    const today = getLocalDateString();
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== listId) return l;
        const itemsCopy = [...l.items];
        if (fromIndex < 0 || fromIndex >= itemsCopy.length || toIndex < 0 || toIndex >= itemsCopy.length) {
          return l;
        }
        const [moved] = itemsCopy.splice(fromIndex, 1);
        itemsCopy.splice(toIndex, 0, moved);
        const reordered = itemsCopy.map((item, idx) => ({ ...item, order: idx + 1 }));
        return { ...l, items: reordered, updatedAt: today };
      })
    );
  };

  // Game status & logs
  const updateGameStatus = (
    gameId: string,
    status: GameStatus,
    rating?: number,
    review?: string,
    hours?: number,
    isFavorite?: boolean
  ) => {
    const today = getLocalDateString();
    setUserStatuses((prev) => {
      const existing = prev[gameId] || {
        gameId,
        status,
        rating: 0,
        isFavorite: false,
        updatedAt: today,
      };

      const updated: UserGameStatus = {
        ...existing,
        status,
        rating: rating !== undefined ? rating : existing.rating,
        review: review !== undefined ? review : existing.review,
        hoursPlayed: hours !== undefined ? hours : existing.hoursPlayed,
        isFavorite: isFavorite !== undefined ? isFavorite : existing.isFavorite,
        completedAt: status === 'completed' && !existing.completedAt ? today : existing.completedAt,
        updatedAt: today,
      };

      return {
        ...prev,
        [gameId]: updated,
      };
    });
  };

  const toggleFavoriteGame = (gameId: string) => {
    const today = getLocalDateString();
    setUserStatuses((prev) => {
      const existing = prev[gameId] || {
        gameId,
        status: 'backlog',
        rating: 0,
        isFavorite: false,
        updatedAt: today,
      };
      return {
        ...prev,
        [gameId]: {
          ...existing,
          isFavorite: !existing.isFavorite,
          updatedAt: today,
        },
      };
    });
  };

  const createGameLog = (
    gameId: string,
    status: GameStatus,
    rating?: number,
    review?: string,
    hoursSpent?: number
  ) => {
    const today = getLocalDateString();
    const newLog: GameLog = {
      id: `log-${Date.now()}`,
      gameId,
      date: today,
      status,
      rating,
      review: review?.trim(),
      hoursSpent,
    };
    setLogs((prev) => [newLog, ...prev]);
    updateGameStatus(gameId, status, rating, review, hoursSpent);
    showToast('Registro adicionado ao Diário.');
  };

  const deleteGameLog = (logId: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    showToast('Registro removido do Diário.');
  };

  // Custom Game creation
  const createCustomGame = (gameData: Omit<Game, 'id'>): Game => {
    const newGame: Game = {
      ...gameData,
      id: `custom-game-${Date.now()}`,
      title: gameData.title.trim(),
      coverUrl: gameData.coverUrl.trim() || '/assets/default-cover.svg',
    };
    setGames((prev) => [newGame, ...prev]);
    showToast(`Jogo "${newGame.title}" cadastrado.`);
    return newGame;
  };

  const updateGameCover = (gameId: string, coverUrl: string) => {
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, coverUrl: coverUrl.trim() } : g)));
    showToast('Capa do jogo atualizada.');
  };

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, ...updates } : g)));
  };

  const deleteGame = (gameId: string) => {
    deleteGames([gameId]);
  };

  const deleteGames = (gameIds: string[]) => {
    const gameIdSet = new Set(gameIds);
    const today = getLocalDateString();

    setGames((prev) => prev.filter((g) => !gameIdSet.has(g.id)));
    setLists((prev) =>
      prev.map((l) => {
        const hasGame = l.items.some((i) => gameIdSet.has(i.gameId));
        if (!hasGame) return l;
        const filtered = l.items.filter((item) => !gameIdSet.has(item.gameId));
        const reordered = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
        return { ...l, items: reordered, updatedAt: today };
      })
    );
    setUserStatuses((prev) => {
      const next = { ...prev };
      gameIds.forEach((id) => delete next[id]);
      return next;
    });
    setLogs((prev) => prev.filter((l) => !gameIdSet.has(l.gameId)));

    if (activeGameModalId && gameIdSet.has(activeGameModalId)) {
      setActiveGameModalId(null);
    }
    showToast(gameIds.length === 1 ? 'Jogo excluído.' : `${gameIds.length} jogos excluídos.`);
  };

  const removeGamesStatus = (gameIds: string[]) => {
    setUserStatuses((prev) => {
      const next = { ...prev };
      gameIds.forEach((id) => delete next[id]);
      return next;
    });
    showToast(gameIds.length === 1 ? 'Status removido.' : `${gameIds.length} status removidos.`);
  };

  const unfavoriteGames = (gameIds: string[]) => {
    const today = getLocalDateString();
    setUserStatuses((prev) => {
      const next = { ...prev };
      gameIds.forEach((id) => {
        if (next[id]) {
          next[id] = {
            ...next[id],
            isFavorite: false,
            updatedAt: today,
          };
        }
      });
      return next;
    });
    showToast(
      gameIds.length === 1
        ? 'Jogo removido dos favoritos.'
        : `${gameIds.length} jogos removidos dos favoritos.`
    );
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    showToast('Perfil atualizado.');
  };

  // Backup & Portability
  const buildBackupPayload = (): BackupPayload => ({
    version: 2,
    app: 'Gamelog',
    exportedAt: getLocalTimestampISO(),
    games,
    folders,
    lists,
    userStatuses,
    logs,
    userProfile,
  });

  const buildBackupJson = (): string => JSON.stringify(buildBackupPayload(), null, 2);

  const exportData = async (): Promise<{ success: boolean; filename?: string; message?: string }> => {
    const backup = buildBackupPayload();
    const jsonContent = JSON.stringify(backup, null, 2);
    let serverSavedFilename: string | undefined;

    // 1. Optional Web full-stack /backup directory save
    if (!Capacitor.isNativePlatform()) {
      try {
        const response = await fetch('/api/backups/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: jsonContent,
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            serverSavedFilename = resData.filename;
            setLastLoadedBackupName(resData.filename);
            setServerBackupAvailable(true);
          }
        }
      } catch {
        // Offline / static mode
      }
    }

    const filename = serverSavedFilename || getLocalTimestampFilename('gamelog-backup', 'json');
    const result = await exportTextFile({
      filename,
      content: jsonContent,
      mimeType: 'application/json;charset=utf-8',
      shareTitle: 'Backup Gamelog (JSON)',
      shareText: 'Backup completo da biblioteca de jogos do Gamelog.',
    });

    const msg = serverSavedFilename
      ? `Backup salvo em backup/${serverSavedFilename} e exportado!`
      : result.message;

    showToast(msg);
    return {
      success: true,
      filename,
      message: msg,
    };
  };

  const exportCsv = async (): Promise<{ success: boolean; filename?: string; message?: string }> => {
    const csvContent = generateGamesCsv(games, userStatuses);
    const filename = getLocalTimestampFilename('gamelog-relatorio', 'csv');
    const result = await exportTextFile({
      filename,
      content: csvContent,
      mimeType: 'text/csv;charset=utf-8',
      shareTitle: 'Relatório Gamelog (CSV)',
      shareText: 'Relatório de jogos, status e notas exportado do Gamelog.',
    });

    showToast(result.message);
    return {
      success: true,
      filename,
      message: result.message,
    };
  };

  const copyBackupToClipboard = async (): Promise<boolean> => {
    const ok = await copyTextToClipboard(buildBackupJson());
    if (ok) {
      showToast('Backup JSON copiado para a área de transferência!');
    } else {
      showToast('Não foi possível copiar automaticamente. Use o campo de texto.', 'error');
    }
    return ok;
  };

  const importData = (jsonString: string, mode: ImportMode = 'replace'): { success: boolean; message: string } => {
    const check = parseAndValidateBackupJson(jsonString);
    if (!check.valid || !check.data) {
      return { success: false, message: check.error || 'JSON inválido.' };
    }

    const data = check.data;

    if (mode === 'replace') {
      if (Array.isArray(data.games)) setGames(data.games);
      if (Array.isArray(data.folders)) setFolders(data.folders);
      if (Array.isArray(data.lists)) setLists(data.lists);
      if (data.userStatuses && typeof data.userStatuses === 'object') setUserStatuses(data.userStatuses);
      if (Array.isArray(data.logs)) setLogs(data.logs);
      if (data.userProfile && typeof data.userProfile === 'object') setUserProfile(data.userProfile);

      showToast('Dados substituídos pelo backup com sucesso!');
      return { success: true, message: 'Todos os dados foram substituídos pelo backup!' };
    }

    // Mode: 'merge' — mescla sem apagar registros existentes
    let addedGames = 0;
    let addedFolders = 0;
    let addedLists = 0;
    let addedLogs = 0;

    if (Array.isArray(data.games)) {
      setGames((prev) => {
        const existingIds = new Set(prev.map((g) => g.id));
        const existingTitles = new Set(prev.map((g) => g.title.trim().toLowerCase()));
        const toAdd = data.games!.filter(
          (g) => g?.id && g?.title && !existingIds.has(g.id) && !existingTitles.has(g.title.trim().toLowerCase())
        );
        addedGames = toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    if (Array.isArray(data.folders)) {
      setFolders((prev) => {
        const existingIds = new Set(prev.map((f) => f.id));
        const toAdd = data.folders!.filter((f) => f?.id && f?.name && !existingIds.has(f.id));
        addedFolders = toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    if (Array.isArray(data.lists)) {
      setLists((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const toAdd = data.lists!.filter((l) => l?.id && l?.title && !existingIds.has(l.id));
        addedLists = toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    if (data.userStatuses && typeof data.userStatuses === 'object') {
      setUserStatuses((prev) => ({
        ...data.userStatuses,
        ...prev, // Mantém status já editados localmente em caso de conflito
      }));
    }

    if (Array.isArray(data.logs)) {
      setLogs((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const toAdd = data.logs!.filter((l) => l?.id && !existingIds.has(l.id));
        addedLogs = toAdd.length;
        return [...toAdd, ...prev];
      });
    }

    const summaryMsg = `Mesclado: +${addedGames} jogos, +${addedFolders} pastas, +${addedLists} listas, +${addedLogs} logs.`;
    showToast(summaryMsg);
    return { success: true, message: summaryMsg };
  };

  const importParsedBackloggdData = (data: any) => {
    let foldersCreated = 0;
    let listsCreated = 0;
    let gamesAdded = 0;

    const folderMap = new Map<string, string>();
    folders.forEach((f) => folderMap.set(f.name.toLowerCase(), f.id));

    const today = getLocalDateString();

    // 1. Process Folders
    const newFolders: Folder[] = [];
    if (data.folders && Array.isArray(data.folders)) {
      for (const f of data.folders) {
        const key = f.name.toLowerCase();
        if (!folderMap.has(key)) {
          const newFolder: Folder = {
            id: f.id || `folder-${Date.now()}-${foldersCreated}`,
            name: f.name.trim(),
            description: f.description?.trim(),
            color: f.color || '#6366f1',
            createdAt: today,
          };
          newFolders.push(newFolder);
          folderMap.set(key, newFolder.id);
          foldersCreated++;
        }
      }
    }
    if (newFolders.length > 0) {
      setFolders((prev) => [...newFolders, ...prev]);
    }

    // 2. Process Lists & Games
    const newLists: GameList[] = [];
    const newGamesToRegister: Game[] = [];
    const gameTitleMap = new Map<string, string>();
    games.forEach((g) => gameTitleMap.set(g.title.toLowerCase(), g.id));

    if (data.lists && Array.isArray(data.lists)) {
      for (const l of data.lists) {
        let parentFolderId: string | null = null;
        if (l.folderName && folderMap.has(l.folderName.toLowerCase())) {
          parentFolderId = folderMap.get(l.folderName.toLowerCase()) || null;
        }

        const listItems: GameList['items'] = [];

        if (l.games && Array.isArray(l.games)) {
          for (let idx = 0; idx < l.games.length; idx++) {
            const gItem = l.games[idx];
            const gameKey = gItem.title.trim().toLowerCase();
            let matchedGameId = gameTitleMap.get(gameKey);

            if (!matchedGameId) {
              const newGame: Game = {
                id: `game-imported-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
                title: gItem.title.trim(),
                coverUrl: gItem.coverUrl?.trim() || '/assets/default-cover.svg',
                releaseYear: gItem.releaseYear || new Date().getFullYear(),
                developer: gItem.developer || 'Estúdio',
                genres: ['Importado'],
                platforms: ['Multiplataforma'],
              };
              newGamesToRegister.push(newGame);
              matchedGameId = newGame.id;
              gameTitleMap.set(gameKey, matchedGameId);
            }

            listItems.push({
              gameId: matchedGameId,
              order: gItem.order || idx + 1,
              notes: gItem.notes,
              addedAt: today,
            });
            gamesAdded++;
          }
        }

        const createdList: GameList = {
          id: `list-${Date.now()}-${listsCreated}`,
          title: l.title.trim(),
          description: l.description?.trim(),
          folderId: parentFolderId,
          isRanked: l.isRanked || false,
          items: listItems,
          createdAt: today,
          updatedAt: today,
        };

        newLists.push(createdList);
        listsCreated++;
      }
    }

    if (newGamesToRegister.length > 0) {
      setGames((prev) => [...newGamesToRegister, ...prev]);
    }
    if (newLists.length > 0) {
      setLists((prev) => [...newLists, ...prev]);
      setSelectedListId(newLists[0].id);
      if (newLists[0].folderId) setSelectedFolderId(newLists[0].folderId);
      setActiveView('folders');
    }

    showToast(`Importado: ${listsCreated} listas e ${gamesAdded} jogos.`);
    return { foldersCreated, listsCreated, gamesAdded };
  };

  const resetToDefaults = () => {
    setGames(INITIAL_GAMES);
    setFolders(INITIAL_FOLDERS);
    setLists(INITIAL_LISTS);
    setUserStatuses(INITIAL_USER_STATUSES);
    setLogs(INITIAL_LOGS);
    setUserProfile(INITIAL_USER_PROFILE);
    setSelectedFolderId(null);
    setSelectedListId(null);
    showToast('Dados padrão restaurados.');
  };

  // Helper selectors
  const getGameById = (id: string) => games.find((g) => g.id === id);
  const getGameStatus = (gameId: string) => userStatuses[gameId];
  const getFolderById = (id: string) => folders.find((f) => f.id === id);
  const getListById = (id: string) => lists.find((l) => l.id === id);
  const getListsByFolder = (folderId: string) => lists.filter((l) => l.folderId === folderId);
  const getUncategorizedLists = () => lists.filter((l) => !l.folderId);

  return (
    <StoreContext.Provider
      value={{
        games,
        folders,
        lists,
        userStatuses,
        logs,
        userProfile,
        activeView,
        selectedFolderId,
        selectedListId,
        searchTerm,
        statusFilter,
        toasts,
        showToast,
        dismissToast,
        activeGameModalId,
        addGameToListModalListId,
        folderModalData,
        listModalData,
        isCustomGameModalOpen,
        isBackupModalOpen,
        isEditProfileModalOpen,
        isImportBackloggdModalOpen,

        setActiveView,
        setSelectedFolderId,
        setSelectedListId,
        setSearchTerm,
        setStatusFilter,

        openGameModal,
        closeGameModal,
        openAddGameToListModal,
        closeAddGameToListModal,
        openFolderModal,
        closeFolderModal,
        openListModal,
        closeListModal,
        setIsCustomGameModalOpen,
        setIsBackupModalOpen,
        setIsEditProfileModalOpen,
        setIsImportBackloggdModalOpen,
        importParsedBackloggdData,

        createFolder,
        updateFolder,
        deleteFolder,
        deleteFolders,

        createList,
        updateList,
        deleteList,
        deleteLists,
        addGameToList,
        removeGameFromList,
        removeGamesFromList,
        reorderListGames,

        updateGameStatus,
        removeGamesStatus,
        unfavoriteGames,
        toggleFavoriteGame,
        createGameLog,
        deleteGameLog,

        createCustomGame,
        updateGameCover,
        updateGame,
        deleteGame,
        deleteGames,
        updateUserProfile,

        buildBackupJson,
        exportData,
        exportCsv,
        copyBackupToClipboard,
        importData,
        resetToDefaults,
        lastLoadedBackupName,
        serverBackupAvailable,

        getGameById,
        getGameStatus,
        getFolderById,
        getListById,
        getListsByFolder,
        getUncategorizedLists,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
