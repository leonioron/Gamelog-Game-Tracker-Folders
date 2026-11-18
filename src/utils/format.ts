import { BackupPayload, Game, GameStatus, UserGameStatus } from '../types';

const STATUS_LABELS: Record<GameStatus, string> = {
  playing: 'Jogando',
  completed: 'Zerado',
  backlog: 'Backlog',
  wishlist: 'Desejo',
  paused: 'Pausado',
  dropped: 'Abandonado',
};

export function escapeCsvField(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  const normalized = str.replace(/\r?\n/g, ' ');
  if (/[",;\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function generateGamesCsv(
  games: Game[],
  userStatuses: Record<string, UserGameStatus>
): string {
  const headers = [
    'ID',
    'Título',
    'Ano',
    'Desenvolvedora',
    'Gêneros',
    'Plataformas',
    'Status',
    'Nota',
    'Horas Jogadas',
    'Favorito',
    'Concluído em',
    'Atualizado em',
    'Resenha',
  ];

  const rows = games.map((game) => {
    const st = userStatuses[game.id];
    return [
      game.id,
      game.title,
      game.releaseYear,
      game.developer,
      game.genres.join(' | '),
      game.platforms.join(' | '),
      st?.status ? STATUS_LABELS[st.status] || st.status : 'Sem status',
      st?.rating ? st.rating.toFixed(1) : '',
      st?.hoursPlayed ?? '',
      st?.isFavorite ? 'Sim' : 'Não',
      st?.completedAt || '',
      st?.updatedAt || '',
      st?.review || '',
    ].map(escapeCsvField);
  });

  // BOM UTF-8 (\uFEFF) para acentuação perfeita no Excel / Android Sheets
  return '\uFEFF' + [headers.map(escapeCsvField).join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function isValidHttpOrLocalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/assets/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseAndValidateBackupJson(jsonString: string): {
  valid: boolean;
  data?: Partial<BackupPayload>;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Estrutura JSON inválida.' };
    }

    const hasRecognizedKey =
      Array.isArray(parsed.games) ||
      Array.isArray(parsed.folders) ||
      Array.isArray(parsed.lists) ||
      (parsed.userStatuses && typeof parsed.userStatuses === 'object') ||
      Array.isArray(parsed.logs);

    if (!hasRecognizedKey) {
      return { valid: false, error: 'O JSON não contém dados válidos do Gamelog.' };
    }

    return { valid: true, data: parsed as Partial<BackupPayload> };
  } catch {
    return { valid: false, error: 'Não foi possível ler o JSON. Verifique a formatação.' };
  }
}

export function clampNonNegativeNumber(val: string | number, fallback: number = 0): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return num;
}
