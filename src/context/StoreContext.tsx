import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Folder, GameList, UserGameStatus, GameLog, UserProfile, ActiveView, GameStatus } from '../types';
import { 
  INITIAL_GAMES, 
  INITIAL_FOLDERS, 
  INITIAL_LISTS, 
  INITIAL_USER_STATUSES, 
  INITIAL_LOGS, 
  INITIAL_USER_PROFILE 
} from '../data/initialData';

const STORAGE_KEYS = {
  GAMES: 'backloggd_games_v1',
  FOLDERS: 'backloggd_folders_v1',
  LISTS: 'backloggd_lists_v1',
  STATUSES: 'backloggd_statuses_v1',
  LOGS: 'backloggd_logs_v1',
  PROFILE: 'backloggd_profile_v1',
};

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
  exportData: () => void;
  importData: (jsonString: string) => boolean;
  resetToDefaults: () => void;

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
  // Load from local storage or fallback to initial data
  const [games, setGames] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAMES);
      return saved ? JSON.parse(saved) : INITIAL_GAMES;
    } catch {
      return INITIAL_GAMES;
    }
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
    } catch {
      return INITIAL_FOLDERS;
    }
  });

  const [lists, setLists] = useState<GameList[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LISTS);
      return saved ? JSON.parse(saved) : INITIAL_LISTS;
    } catch {
      return INITIAL_LISTS;
    }
  });

  const [userStatuses, setUserStatuses] = useState<Record<string, UserGameStatus>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STATUSES);
      return saved ? JSON.parse(saved) : INITIAL_USER_STATUSES;
    } catch {
      return INITIAL_USER_STATUSES;
    }
  });

  const [logs, setLogs] = useState<GameLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // UI state
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');

  // Modals state
  const [activeGameModalId, setActiveGameModalId] = useState<string | null>(null);
  const [addGameToListModalListId, setAddGameToListModalListId] = useState<string | null>(null);
  const [folderModalData, setFolderModalData] = useState<{ isOpen: boolean; folder?: Folder }>({ isOpen: false });
  const [listModalData, setListModalData] = useState<{ isOpen: boolean; list?: GameList; defaultFolderId?: string }>({ isOpen: false });
  const [isCustomGameModalOpen, setIsCustomGameModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isImportBackloggdModalOpen, setIsImportBackloggdModalOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(userStatuses));
  }, [userStatuses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

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
      createdAt: new Date().toISOString().split('T')[0]
    };
    setFolders(prev => [newFolder, ...prev]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteFolder = (id: string) => {
    deleteFolders([id]);
  };

  const deleteFolders = (ids: string[]) => {
    const idSet = new Set(ids);
    // Unlink lists from deleted folders
    setLists(prev => prev.map(l => l.folderId && idSet.has(l.folderId) ? { ...l, folderId: null } : l));
    setFolders(prev => prev.filter(f => !idSet.has(f.id)));
    if (selectedFolderId && idSet.has(selectedFolderId)) setSelectedFolderId(null);
  };

  // List operations
  const createList = (title: string, description?: string, folderId?: string | null, isRanked: boolean = false): GameList => {
    const today = new Date().toISOString().split('T')[0];
    const newList: GameList = {
      id: `list-${Date.now()}`,
      title: title.trim(),
      description: description?.trim(),
      folderId: folderId || null,
      isRanked,
      items: [],
      createdAt: today,
      updatedAt: today
    };
    setLists(prev => [newList, ...prev]);
    return newList;
  };

  const updateList = (id: string, updates: Partial<GameList>) => {
    const today = new Date().toISOString().split('T')[0];
    setLists(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: today } : l));
  };

  const deleteList = (id: string) => {
    deleteLists([id]);
  };

  const deleteLists = (ids: string[]) => {
    const idSet = new Set(ids);
    setLists(prev => prev.filter(l => !idSet.has(l.id)));
    if (selectedListId && idSet.has(selectedListId)) setSelectedListId(null);
  };

  const addGameToList = (listId: string, gameId: string, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setLists(prev => prev.map(l => {
      if (l.id !== listId) return l;
      // Check if already in list
      if (l.items.some(item => item.gameId === gameId)) return l;
      
      const newItems = [
        ...l.items,
        {
          gameId,
          order: l.items.length + 1,
          notes: notes?.trim(),
          addedAt: today
        }
      ];
      return { ...l, items: newItems, updatedAt: today };
    }));
  };

  const removeGameFromList = (listId: string, gameId: string) => {
    removeGamesFromList(listId, [gameId]);
  };

  const removeGamesFromList = (listId: string, gameIds: string[]) => {
    const gameIdSet = new Set(gameIds);
    const today = new Date().toISOString().split('T')[0];
    setLists(prev => prev.map(l => {
      if (l.id !== listId) return l;
      const filtered = l.items.filter(item => !gameIdSet.has(item.gameId));
      // Re-normalize order
      const reordered = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
      return { ...l, items: reordered, updatedAt: today };
    }));
  };

  const reorderListGames = (listId: string, fromIndex: number, toIndex: number) => {
    const today = new Date().toISOString().split('T')[0];
    setLists(prev => prev.map(l => {
      if (l.id !== listId) return l;
      const itemsCopy = [...l.items];
      if (fromIndex < 0 || fromIndex >= itemsCopy.length || toIndex < 0 || toIndex >= itemsCopy.length) {
        return l;
      }
      const [moved] = itemsCopy.splice(fromIndex, 1);
      itemsCopy.splice(toIndex, 0, moved);
      const reordered = itemsCopy.map((item, idx) => ({ ...item, order: idx + 1 }));
      return { ...l, items: reordered, updatedAt: today };
    }));
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
    const today = new Date().toISOString().split('T')[0];
    setUserStatuses(prev => {
      const existing = prev[gameId] || {
        gameId,
        status,
        rating: 0,
        isFavorite: false,
        updatedAt: today
      };

      const updated: UserGameStatus = {
        ...existing,
        status,
        rating: rating !== undefined ? rating : existing.rating,
        review: review !== undefined ? review : existing.review,
        hoursPlayed: hours !== undefined ? hours : existing.hoursPlayed,
        isFavorite: isFavorite !== undefined ? isFavorite : existing.isFavorite,
        completedAt: status === 'completed' && !existing.completedAt ? today : existing.completedAt,
        updatedAt: today
      };

      return {
        ...prev,
        [gameId]: updated
      };
    });
  };

  const toggleFavoriteGame = (gameId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setUserStatuses(prev => {
      const existing = prev[gameId] || {
        gameId,
        status: 'backlog',
        rating: 0,
        isFavorite: false,
        updatedAt: today
      };
      return {
        ...prev,
        [gameId]: {
          ...existing,
          isFavorite: !existing.isFavorite,
          updatedAt: today
        }
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
    const today = new Date().toISOString().split('T')[0];
    const newLog: GameLog = {
      id: `log-${Date.now()}`,
      gameId,
      date: today,
      status,
      rating,
      review: review?.trim(),
      hoursSpent
    };
    setLogs(prev => [newLog, ...prev]);

    // Also sync the game's overall status & rating if provided
    updateGameStatus(gameId, status, rating, review, hoursSpent);
  };

  const deleteGameLog = (logId: string) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
  };

  // Custom Game creation
  const createCustomGame = (gameData: Omit<Game, 'id'>): Game => {
    const newGame: Game = {
      ...gameData,
      id: `custom-game-${Date.now()}`,
      title: gameData.title.trim(),
      coverUrl: gameData.coverUrl.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'
    };
    setGames(prev => [newGame, ...prev]);
    return newGame;
  };

  const updateGameCover = (gameId: string, coverUrl: string) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, coverUrl: coverUrl.trim() } : g));
  };

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, ...updates } : g));
  };

  const deleteGame = (gameId: string) => {
    deleteGames([gameId]);
  };

  const deleteGames = (gameIds: string[]) => {
    const gameIdSet = new Set(gameIds);
    const today = new Date().toISOString().split('T')[0];
    
    // Remove from catalog
    setGames(prev => prev.filter(g => !gameIdSet.has(g.id)));

    // Remove from all lists
    setLists(prev => prev.map(l => {
      const hasGame = l.items.some(i => gameIdSet.has(i.gameId));
      if (!hasGame) return l;
      const filtered = l.items.filter(item => !gameIdSet.has(item.gameId));
      const reordered = filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
      return { ...l, items: reordered, updatedAt: today };
    }));

    // Remove status
    setUserStatuses(prev => {
      const next = { ...prev };
      gameIds.forEach(id => delete next[id]);
      return next;
    });

    // Remove logs
    setLogs(prev => prev.filter(l => !gameIdSet.has(l.gameId)));

    // Close game modal if it was open for one of deleted games
    if (activeGameModalId && gameIdSet.has(activeGameModalId)) {
      setActiveGameModalId(null);
    }
  };

  const removeGamesStatus = (gameIds: string[]) => {
    const gameIdSet = new Set(gameIds);
    setUserStatuses(prev => {
      const next = { ...prev };
      gameIds.forEach(id => delete next[id]);
      return next;
    });
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  // Backup & Restore
  const exportData = () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      games,
      folders,
      lists,
      userStatuses,
      logs,
      userProfile
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backloggd-leonio-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.games && Array.isArray(data.games)) setGames(data.games);
      if (data.folders && Array.isArray(data.folders)) setFolders(data.folders);
      if (data.lists && Array.isArray(data.lists)) setLists(data.lists);
      if (data.userStatuses && typeof data.userStatuses === 'object') setUserStatuses(data.userStatuses);
      if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
      if (data.userProfile && typeof data.userProfile === 'object') setUserProfile(data.userProfile);
      return true;
    } catch {
      return false;
    }
  };

  const importParsedBackloggdData = (data: any) => {
    let foldersCreated = 0;
    let listsCreated = 0;
    let gamesAdded = 0;

    const folderMap = new Map<string, string>();
    folders.forEach(f => folderMap.set(f.name.toLowerCase(), f.id));

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
            createdAt: new Date().toISOString().split('T')[0],
          };
          newFolders.push(newFolder);
          folderMap.set(key, newFolder.id);
          foldersCreated++;
        }
      }
    }
    if (newFolders.length > 0) {
      setFolders(prev => [...newFolders, ...prev]);
    }

    // 2. Process Lists & Games
    const today = new Date().toISOString().split('T')[0];
    const newLists: GameList[] = [];
    const newGamesToRegister: Game[] = [];
    const gameTitleMap = new Map<string, string>();
    games.forEach(g => gameTitleMap.set(g.title.toLowerCase(), g.id));

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
                coverUrl: gItem.coverUrl?.trim() || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
                releaseYear: gItem.releaseYear || 2024,
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
      setGames(prev => [...newGamesToRegister, ...prev]);
    }
    if (newLists.length > 0) {
      setLists(prev => [...newLists, ...prev]);
      setSelectedListId(newLists[0].id);
      if (newLists[0].folderId) setSelectedFolderId(newLists[0].folderId);
      setActiveView('folders');
    }

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
  };

  // Helper selectors
  const getGameById = (id: string) => games.find(g => g.id === id);
  const getGameStatus = (gameId: string) => userStatuses[gameId];
  const getFolderById = (id: string) => folders.find(f => f.id === id);
  const getListById = (id: string) => lists.find(l => l.id === id);
  const getListsByFolder = (folderId: string) => lists.filter(l => l.folderId === folderId);
  const getUncategorizedLists = () => lists.filter(l => !l.folderId);

  return (
    <StoreContext.Provider value={{
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
      toggleFavoriteGame,
      createGameLog,
      deleteGameLog,

      createCustomGame,
      updateGameCover,
      updateGame,
      deleteGame,
      deleteGames,
      updateUserProfile,

      exportData,
      importData,
      resetToDefaults,

      getGameById,
      getGameStatus,
      getFolderById,
      getListById,
      getListsByFolder,
      getUncategorizedLists,
    }}>
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
