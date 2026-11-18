import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { parseBackloggdHtml, parseBackloggdText, ParsedBackloggdData } from '../../utils/backloggdParser';
import {
  Globe,
  Code,
  FileText,
  X,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export const ImportBackloggdModal: React.FC = () => {
  const {
    isImportBackloggdModalOpen,
    setIsImportBackloggdModalOpen,
    importParsedBackloggdData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'url' | 'html' | 'text'>('url');
  const [url, setUrl] = useState('https://www.backloggd.com/u/Leonio_Ranulfo/lists/');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isBotBlocked, setIsBotBlocked] = useState(false);

  const [rawHtml, setRawHtml] = useState('');
  const [rawText, setRawText] = useState(`[Pasta: Franquias Favoritas]
Lista: Saga Resident Evil
1. Resident Evil 4 Remake - Obra-prima absoluta
2. Resident Evil 2 Remake - Clássico moderno na RPD
3. Resident Evil Village - Castelo Dimitrescu
4. Resident Evil 7 - Terror em primeira pessoa

[Pasta: Metas de 2026]
Lista: Prioridades para Zerar
1. Baldur's Gate 3 - 50 horas de campanha
2. Alan Wake 2
3. Persona 3 Reload`);

  const [previewData, setPreviewData] = useState<ParsedBackloggdData | null>(null);
  const [importResult, setImportResult] = useState<{
    foldersCreated: number;
    listsCreated: number;
    gamesAdded: number;
  } | null>(null);

  if (!isImportBackloggdModalOpen) return null;

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setIsLoadingUrl(true);
    setInlineError(null);
    setIsBotBlocked(false);
    setPreviewData(null);

    const targetUrl = url.trim();
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    ];

    let htmlResult: string | null = null;
    let gotBotChallenge = false;

    for (const proxyUrl of proxies) {
      try {
        const res = await fetch(proxyUrl, {
          headers: {
            Accept: 'text/html,application/xhtml+xml',
          },
        });

        if (res.ok) {
          const text = await res.text();
          if (
            text.includes("Making sure you're not a bot!") ||
            text.includes('anubis_challenge') ||
            text.includes('challenge-running')
          ) {
            gotBotChallenge = true;
          } else if (text.includes('backloggd') || text.includes('<html') || text.includes('card')) {
            htmlResult = text;
            break;
          }
        }
      } catch {
        // Tenta próximo proxy
      }
    }

    setIsLoadingUrl(false);

    if (htmlResult) {
      const parsed = parseBackloggdHtml(htmlResult);
      if (parsed.lists.length === 0 && parsed.folders.length === 0) {
        setInlineError(
          'A página foi carregada, mas não foi possível identificar listas públicas estruturadas. Experimente a aba "Colar HTML".'
        );
      } else {
        setPreviewData(parsed);
      }
    } else if (gotBotChallenge) {
      setIsBotBlocked(true);
      setInlineError(
        'O Backloggd ativou a proteção anti-bot Cloudflare bloqueando requisições diretas.'
      );
    } else {
      setInlineError(
        'Não foi possível acessar a URL diretamente por CORS/rede ou modo offline. Use a aba "Colar HTML" ou "Texto Rápido".'
      );
    }
  };

  const handleProcessHtml = () => {
    setInlineError(null);
    if (!rawHtml.trim()) return;
    const parsed = parseBackloggdHtml(rawHtml);
    if (parsed.lists.length === 0 && parsed.folders.length === 0) {
      setInlineError(
        'Não foram encontradas listas ou pastas no código HTML fornecido. Verifique se copiou a página correta do Backloggd.'
      );
      return;
    }
    setPreviewData(parsed);
  };

  const handleProcessText = () => {
    setInlineError(null);
    if (!rawText.trim()) return;
    const parsed = parseBackloggdText(rawText);
    if (parsed.lists.length === 0) {
      setInlineError('Nenhuma lista identificada no texto informado.');
      return;
    }
    setPreviewData(parsed);
  };

  const handleConfirmImport = () => {
    if (!previewData) return;
    const result = importParsedBackloggdData(previewData);
    setImportResult(result);
    setTimeout(() => {
      setIsImportBackloggdModalOpen(false);
      setPreviewData(null);
      setImportResult(null);
      setInlineError(null);
    }, 1800);
  };

  const switchTab = (tab: 'url' | 'html' | 'text') => {
    setActiveTab(tab);
    setPreviewData(null);
    setInlineError(null);
    setIsBotBlocked(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-safe-top bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={() => setIsImportBackloggdModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl min-w-0 bg-[#121824] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#090D14] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              B
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-display font-bold text-white truncate">
                Importador do Backloggd
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Importe Pastas, Listas e Jogos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsImportBackloggdModalOpen(false)}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar importador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-white/5 bg-[#0e131e] px-3 sm:px-6 text-xs shrink-0">
          <button
            type="button"
            onClick={() => switchTab('url')}
            className={`min-h-[44px] py-3 px-3 sm:px-4 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Via URL</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('html')}
            className={`min-h-[44px] py-3 px-3 sm:px-4 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'html'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Colar HTML</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('text')}
            className={`min-h-[44px] py-3 px-3 sm:px-4 font-medium border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texto Rápido</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 min-w-0">
          {inlineError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="min-w-0 break-words">{inlineError}</span>
            </div>
          )}

          {/* TAB 1: VIA URL */}
          {activeTab === 'url' && !previewData && (
            <div className="space-y-4 min-w-0">
              <div className="min-w-0">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  URL do Perfil ou Lista no Backloggd:
                </label>
                <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                  <input
                    type="url"
                    placeholder="https://www.backloggd.com/u/usuario/lists/"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="min-h-[44px] flex-1 min-w-0 w-full bg-[#090D14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrl}
                    disabled={isLoadingUrl || !url.trim()}
                    className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    {isLoadingUrl ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Carregar URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Proteção Anti-Bot & Modo Offline</span>
                </div>
                <p className="leading-relaxed">
                  Caso o Backloggd bloqueie a leitura automática ou você esteja sem internet, use a aba <strong>"Colar HTML"</strong> ou <strong>"Texto Rápido"</strong> para importar 100% offline.
                </p>
              </div>

              {isBotBlocked && (
                <button
                  type="button"
                  onClick={() => switchTab('html')}
                  className="min-h-[44px] w-full py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Ir para aba "Colar HTML"</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* TAB 2: VIA HTML */}
          {activeTab === 'html' && !previewData && (
            <div className="space-y-4 min-w-0">
              <div className="p-4 rounded-xl bg-[#090D14] border border-indigo-500/20 text-xs space-y-2">
                <span className="font-semibold text-indigo-300 block">Passo a Passo:</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Abra sua página de listas no Backloggd no navegador.</li>
                  <li>Copie o código-fonte HTML da página.</li>
                  <li>Cole no campo abaixo e toque em processar.</li>
                </ol>
              </div>

              <textarea
                rows={7}
                placeholder="<!DOCTYPE html><html>... Cole aqui o código-fonte"
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                className="w-full bg-[#090D14] border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />

              <button
                type="button"
                onClick={handleProcessHtml}
                disabled={!rawHtml.trim()}
                className="min-h-[44px] w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Processar Pastas e Listas</span>
              </button>
            </div>
          )}

          {/* TAB 3: VIA TEXT */}
          {activeTab === 'text' && !previewData && (
            <div className="space-y-4 min-w-0">
              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full bg-[#090D14] border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />

              <button
                type="button"
                onClick={handleProcessText}
                disabled={!rawText.trim()}
                className="min-h-[44px] w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Processar Lista de Jogos</span>
              </button>
            </div>
          )}

          {/* PREVIEW VIEW */}
          {previewData && !importResult && (
            <div className="space-y-4 min-w-0">
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <div className="flex items-center gap-2 font-medium min-w-0">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="truncate">Conteúdo identificado com sucesso!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="min-h-[44px] px-2 text-slate-300 hover:text-white underline shrink-0 cursor-pointer"
                >
                  Voltar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-xl bg-[#090D14] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Pastas</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-indigo-400">
                    {previewData.folders.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#090D14] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Listas</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-violet-400">
                    {previewData.lists.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#090D14] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Jogos</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                    {previewData.lists.reduce((acc, l) => acc + l.games.length, 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {previewData.lists.map((l, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#090D14] border border-white/5 text-xs space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-white truncate">{l.title}</h4>
                      <span className="font-mono tabular-nums text-slate-400 text-[11px] shrink-0">
                        {l.games.length} jogos
                      </span>
                    </div>
                    {l.folderName && (
                      <span className="text-[11px] text-indigo-400 block truncate">Pasta: {l.folderName}</span>
                    )}
                    <p className="text-[11px] text-slate-400 truncate">
                      {l.games.map((g) => g.title).join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="min-h-[44px] w-full py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>Confirmar e Adicionar à Coleção</span>
              </button>
            </div>
          )}

          {/* SUCCESS RESULT */}
          {importResult && (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">
                Importação Concluída!
              </h3>
              <p className="text-xs text-slate-300 tabular-nums">
                {importResult.foldersCreated} pastas criadas · {importResult.listsCreated} listas · {importResult.gamesAdded} jogos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
