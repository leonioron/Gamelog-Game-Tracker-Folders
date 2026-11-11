import { Game, Folder, GameList, GameStatus } from '../types';

export interface ParsedBackloggdData {
  folders: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  }[];
  lists: {
    id: string;
    title: string;
    description?: string;
    folderName?: string;
    isRanked: boolean;
    games: {
      title: string;
      coverUrl?: string;
      releaseYear?: number;
      developer?: string;
      order?: number;
      notes?: string;
      rating?: number;
      status?: GameStatus;
    }[];
  }[];
  statsSummary?: {
    totalFolders: number;
    totalLists: number;
    totalGames: number;
  };
}

/**
 * Parses raw HTML string from Backloggd (profile, lists page, or single list page).
 */
export function parseBackloggdHtml(htmlContent: string): ParsedBackloggdData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const parsedFolders: ParsedBackloggdData['folders'] = [];
  const parsedLists: ParsedBackloggdData['lists'] = [];

  // 1. Try to find Folders
  // Backloggd displays folders as tabs, links with '?folder=', or elements with class containing 'folder'
  const folderElements = doc.querySelectorAll('.folder-item, [data-folder-name], a[href*="folder="], .folder-pill');
  const detectedFolderNames = new Set<string>();

  folderElements.forEach(el => {
    const name = el.textContent?.trim().replace(/\(\d+\)/, '').trim();
    if (name && name.toLowerCase() !== 'all' && name.toLowerCase() !== 'todas' && !detectedFolderNames.has(name)) {
      detectedFolderNames.add(name);
      parsedFolders.push({
        id: `folder-imported-${Date.now()}-${parsedFolders.length}`,
        name,
        color: getRandomFolderColor(parsedFolders.length),
      });
    }
  });

  // 2. Check if this is a Single List Page (e.g. /u/username/list/my-ranking/)
  const listTitleEl = doc.querySelector('h1.list-title, h1.page-title, h1[class*="title"], .list-header h1');
  const gameCardsInPage = doc.querySelectorAll('.game-card, .card.game-cover, [data-game-id], .list-game-item, .card');

  // Check if there are games in this page
  const gamesInCurrentList: ParsedBackloggdData['lists'][0]['games'] = [];

  gameCardsInPage.forEach((card, index) => {
    // Look for image cover
    const imgEl = card.querySelector('img') as HTMLImageElement | null;
    const coverUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || undefined;

    // Look for game title in alt, title attribute or inner text
    const title = 
      imgEl?.getAttribute('alt')?.trim() || 
      card.getAttribute('title')?.trim() || 
      card.querySelector('.game-title, .card-title, h3, h4, .title')?.textContent?.trim() ||
      imgEl?.title?.trim();

    if (title && title.length > 1 && !title.toLowerCase().includes('banner') && !title.toLowerCase().includes('avatar')) {
      // Look for custom note
      const noteEl = card.querySelector('.list-note, .entry-note, .note, p.text-muted');
      const notes = noteEl?.textContent?.trim() || undefined;

      // Look for rank number
      const rankEl = card.querySelector('.rank-num, .order, .rank');
      let order = index + 1;
      if (rankEl && rankEl.textContent) {
        const parsedNum = parseInt(rankEl.textContent.replace('#', '').trim(), 10);
        if (!isNaN(parsedNum)) order = parsedNum;
      }

      gamesInCurrentList.push({
        title,
        coverUrl: coverUrl?.startsWith('//') ? `https:${coverUrl}` : coverUrl,
        order,
        notes,
      });
    }
  });

  // If a list title was found or games were extracted directly
  if (listTitleEl || gamesInCurrentList.length > 0) {
    const listTitle = listTitleEl?.textContent?.trim() || 'Lista Importada do Backloggd';
    const listDescEl = doc.querySelector('.list-description, .list-bio, .description');
    const description = listDescEl?.textContent?.trim() || undefined;

    parsedLists.push({
      id: `list-imported-${Date.now()}`,
      title: listTitle,
      description,
      isRanked: gamesInCurrentList.some(g => g.order !== undefined),
      games: gamesInCurrentList,
    });
  }

  // 3. Check for multiple lists on a User Lists page (/u/username/lists/)
  const listCards = doc.querySelectorAll('.list-preview, .list-card, a[href*="/list/"]');
  listCards.forEach(listCard => {
    const titleEl = listCard.querySelector('.list-title, h3, h4, .card-title') || listCard;
    const title = titleEl.textContent?.trim();

    if (title && title.length > 2 && !parsedLists.some(l => l.title === title)) {
      // Find thumbnail images in this list card
      const miniImgs = listCard.querySelectorAll('img');
      const miniGames: ParsedBackloggdData['lists'][0]['games'] = [];

      miniImgs.forEach((mImg, mIdx) => {
        const mTitle = mImg.getAttribute('alt') || `Jogo ${mIdx + 1}`;
        const mSrc = mImg.getAttribute('src') || mImg.getAttribute('data-src') || undefined;
        if (mTitle && !mTitle.toLowerCase().includes('avatar')) {
          miniGames.push({
            title: mTitle,
            coverUrl: mSrc?.startsWith('//') ? `https:${mSrc}` : mSrc,
            order: mIdx + 1,
          });
        }
      });

      parsedLists.push({
        id: `list-imported-${Date.now()}-${parsedLists.length}`,
        title,
        isRanked: false,
        games: miniGames,
      });
    }
  });

  // Calculate totals
  const totalGames = parsedLists.reduce((acc, l) => acc + l.games.length, 0);

  return {
    folders: parsedFolders,
    lists: parsedLists,
    statsSummary: {
      totalFolders: parsedFolders.length,
      totalLists: parsedLists.length,
      totalGames,
    },
  };
}

/**
 * Parses structured plain text or markdown lists.
 * E.g.:
 * [Pasta: Meus Favoritos]
 * Lista: Resident Evil Ranking
 * 1. Resident Evil 4 Remake - O melhor de todos
 * 2. Resident Evil 2 Remake
 */
export function parseBackloggdText(textContent: string): ParsedBackloggdData {
  const lines = textContent.split('\n').map(l => l.trim()).filter(Boolean);

  const folders: ParsedBackloggdData['folders'] = [];
  const lists: ParsedBackloggdData['lists'] = [];

  let currentFolderName: string | undefined = undefined;
  let currentList: ParsedBackloggdData['lists'][0] | null = null;

  for (const line of lines) {
    // Check if folder line: [Pasta: Nome] or Pasta: Nome
    const folderMatch = line.match(/^\[?(?:Pasta|Folder):\s*(.+?)\]?$/i);
    if (folderMatch) {
      currentFolderName = folderMatch[1].trim();
      if (!folders.some(f => f.name.toLowerCase() === currentFolderName!.toLowerCase())) {
        folders.push({
          id: `folder-text-${Date.now()}-${folders.length}`,
          name: currentFolderName,
          color: getRandomFolderColor(folders.length),
        });
      }
      continue;
    }

    // Check if list line: [Lista: Titulo] or Lista: Titulo
    const listMatch = line.match(/^\[?(?:Lista|List):\s*(.+?)\]?$/i);
    if (listMatch) {
      if (currentList) lists.push(currentList);
      currentList = {
        id: `list-text-${Date.now()}-${lists.length}`,
        title: listMatch[1].trim(),
        folderName: currentFolderName,
        isRanked: true,
        games: [],
      };
      continue;
    }

    // Check if game line: 1. Nome do Jogo - Anotação ou - Nome do Jogo
    if (currentList) {
      const numberedGameMatch = line.match(/^(?:#?(\d+)[\.\)]\s*)?(.+?)(?:\s*[-–—]\s*(.+))?$/);
      if (numberedGameMatch) {
        const order = numberedGameMatch[1] ? parseInt(numberedGameMatch[1], 10) : currentList.games.length + 1;
        const title = numberedGameMatch[2].trim();
        const notes = numberedGameMatch[3]?.trim();

        if (title) {
          currentList.games.push({
            title,
            order,
            notes,
          });
        }
      }
    }
  }

  if (currentList) {
    lists.push(currentList);
  }

  // If no lists created but lines exist, create a default list
  if (lists.length === 0 && lines.length > 0) {
    const games = lines.map((line, idx) => {
      const match = line.match(/^(?:#?(\d+)[\.\)]\s*)?(.+?)(?:\s*[-–—]\s*(.+))?$/);
      return {
        title: match ? match[2].trim() : line,
        order: idx + 1,
        notes: match?.[3]?.trim(),
      };
    });

    lists.push({
      id: `list-text-${Date.now()}`,
      title: 'Lista Importada do Backloggd',
      isRanked: true,
      games,
    });
  }

  const totalGames = lists.reduce((acc, l) => acc + l.games.length, 0);

  return {
    folders,
    lists,
    statsSummary: {
      totalFolders: folders.length,
      totalLists: lists.length,
      totalGames,
    },
  };
}

function getRandomFolderColor(index: number): string {
  const colors = ['#6366f1', '#8b5cf6', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#f87171'];
  return colors[index % colors.length];
}
