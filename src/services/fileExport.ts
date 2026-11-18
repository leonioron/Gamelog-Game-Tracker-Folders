import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface FileExportResult {
  success: boolean;
  mode: 'native-share' | 'web-download';
  filename: string;
  message: string;
}

/**
 * Exporta um arquivo de texto (JSON ou CSV) de forma compatível com:
 * - Android Nativo (Capacitor Filesystem + Share)
 * - Navegador Web (Download via Blob)
 */
export async function exportTextFile(options: {
  filename: string;
  content: string;
  mimeType: string;
  shareTitle?: string;
  shareText?: string;
}): Promise<FileExportResult> {
  const { filename, content, mimeType, shareTitle, shareText } = options;

  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    const uriResult = await Filesystem.getUri({
      directory: Directory.Cache,
      path: filename,
    });

    await Share.share({
      title: shareTitle || filename,
      text: shareText || `Arquivo exportado pelo Gamelog: ${filename}`,
      url: uriResult.uri,
      dialogTitle: shareTitle || 'Compartilhar arquivo do Gamelog',
    });

    return {
      success: true,
      mode: 'native-share',
      filename,
      message: `Arquivo ${filename} pronto para compartilhamento!`,
    };
  }

  // Fallback Web via Blob download
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return {
    success: true,
    mode: 'web-download',
    filename,
    message: `Arquivo ${filename} baixado com sucesso!`,
  };
}

/**
 * Copia texto para a área de transferência com fallback seguro para WebViews restritos.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Continua para fallback manual via textarea
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
