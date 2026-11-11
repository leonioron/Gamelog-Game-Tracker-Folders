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
  FolderTree, 
  Layers, 
  Gamepad2, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const ImportBackloggdModal: React.FC = () => {
  const { 
    isImportBackloggdModalOpen, 
    setIsImportBackloggdModalOpen, 
    importParsedBackloggdData 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'url' | 'html' | 'text'>('url');
  
  // URL Tab state
  const [url, setUrl] = useState('https://www.backloggd.com/u/Leonio_Ranulfo/lists/');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isBotBlocked, setIsBotBlocked] = useState(false);

  // HTML Tab state
  const [rawHtml, setRawHtml] = useState('');

  // Text Tab state
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

  // Preview state
  const [previewData, setPreviewData] = useState<ParsedBackloggdData | null>(null);
  const [importResult, setImportResult] = useState<{ foldersCreated: number; listsCreated: number; gamesAdded: number } | null>(null);

  if (!isImportBackloggdModalOpen) return null;

  const handleFetchUrl = async () => {
    if (!url.trim()) return;
    setIsLoadingUrl(true);
    setUrlError(null);
    setIsBotBlocked(false);
    setPreviewData(null);

    // List of CORS-friendly proxies to try fetching public HTML
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
            'Accept': 'text/html,application/xhtml+xml',
          }
        });

        if (res.ok) {
          const text = await res.text();
          if (text.includes("Making sure you're not a bot!") || text.includes("anubis_challenge") || text.includes("challenge-running")) {
            gotBotChallenge = true;
          } else if (text.includes("backloggd") || text.includes("<html") || text.includes("card")) {
            htmlResult = text;
            break;
          }
        }
      } catch (err) {
        // Continue to next proxy
      }
    }

    setIsLoadingUrl(false);

    if (htmlResult) {
      const parsed = parseBackloggdHtml(htmlResult);
      if (parsed.lists.length === 0 && parsed.folders.length === 0) {
        setUrlError('A página foi carregada, mas não foi possível identificar listas públicas estruturadas. Experimente o modo "Colar HTML da Página".');
      } else {
        setPreviewData(parsed);
      }
    } else if (gotBotChallenge) {
      setIsBotBlocked(true);
      setUrlError('O Backloggd ativou a proteção anti-bot Cloudflare ("Making sure you\'re not a bot!") bloqueando requisições automatizadas.');
    } else {
      setUrlError('Não foi possível acessar a URL diretamente devido às restrições de CORS/firewall do Backloggd. Use a aba "Colar Código da Página" para importar instantaneamente!');
    }
  };

  const handleProcessHtml = () => {
    if (!rawHtml.trim()) return;
    const parsed = parseBackloggdHtml(rawHtml);
    if (parsed.lists.length === 0 && parsed.folders.length === 0) {
      alert('Não foram encontradas listas ou pastas no código HTML fornecido. Verifique se copiou a página correta do Backloggd.');
      return;
    }
    setPreviewData(parsed);
  };

  const handleProcessText = () => {
    if (!rawText.trim()) return;
    const parsed = parseBackloggdText(rawText);
    if (parsed.lists.length === 0) {
      alert('Nenhuma lista identificada no texto.');
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
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30">
              B
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Importador do Backloggd
              </h2>
              <p className="text-xs text-slate-400">
                Importe suas Pastas, Listas e Jogos para o aplicativo
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsImportBackloggdModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-[#151a26] px-6 text-xs">
          <button
            onClick={() => { setActiveTab('url'); setPreviewData(null); }}
            className={`py-3 px-4 font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Importar via URL</span>
          </button>

          <button
            onClick={() => { setActiveTab('html'); setPreviewData(null); }}
            className={`py-3 px-4 font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'html'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Colar HTML da Página (100% Infalível)</span>
          </button>

          <button
            onClick={() => { setActiveTab('text'); setPreviewData(null); }}
            className={`py-3 px-4 font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'text'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texto Rápido / Lista</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: VIA URL */}
          {activeTab === 'url' && !previewData && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  URL do seu Perfil ou Lista no Backloggd:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.backloggd.com/u/Leonio_Ranulfo/lists/"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className="flex-1 bg-[#0d1017] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleFetchUrl}
                    disabled={isLoadingUrl || !url.trim()}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0"
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

              {/* Notice about Backloggd Anti-Bot protection */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Aviso sobre a Proteção Anti-Bot do Backloggd</span>
                </div>
                <p className="leading-relaxed">
                  O site Backloggd utiliza proteção Cloudflare / Anubis (desafio de robô <em>"Making sure you're not a bot!"</em>) que bloqueia requisições automatizadas vindas de servidores externos.
                </p>
                <p className="leading-relaxed text-amber-200">
                  Caso o Backloggd bloqueie a leitura via URL, clique na aba <strong>"Colar HTML da Página"</strong> acima. Basta copiar o código-fonte da página aberta no seu navegador (onde você já está logado) para importar todas as pastas e listas com 100% de precisão!
                </p>
              </div>

              {/* Bot blocked warning */}
              {isBotBlocked && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 space-y-3">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Bloqueio de Robô Detectado pelo Backloggd</span>
                  </div>
                  <p>
                    O Backloggd respondeu com a página de verificação de robô. Para contornar isso com facilidade:
                  </p>
                  <button
                    onClick={() => setActiveTab('html')}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Ir para aba "Colar HTML da Página"</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {urlError && !isBotBlocked && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VIA HTML (100% RELIABLE) */}
          {activeTab === 'html' && !previewData && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs space-y-2">
                <span className="font-semibold text-indigo-300 block">
                  Instruções Simples (Passo a Passo):
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Abra sua página de listas no Backloggd no seu navegador.</li>
                  <li>Pressione <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + U</kbd> no teclado (ou clique com botão direito e selecione <em>"Exibir código-fonte da página"</em>).</li>
                  <li>Copie todo o conteúdo (<kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + A</kbd> e depois <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + C</kbd>).</li>
                  <li>Cole no campo abaixo e clique no botão verde de processar!</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Cole o código-fonte HTML aqui:
                </label>
                <textarea
                  rows={8}
                  placeholder="<!DOCTYPE html><html>... Cole aqui o código-fonte copiado com Ctrl+U"
                  value={rawHtml}
                  onChange={e => setRawHtml(e.target.value)}
                  className="w-full bg-[#0d1017] border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                onClick={handleProcessHtml}
                disabled={!rawHtml.trim()}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Processar e Extrair Pastas e Listas</span>
              </button>
            </div>
          )}

          {/* TAB 3: VIA TEXT FORMAT */}
          {activeTab === 'text' && !previewData && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                <p>
                  Você também pode colar uma lista formatada manualmente com pastas e títulos de jogos:
                </p>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  Texto Estruturado:
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  className="w-full bg-[#0d1017] border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                onClick={handleProcessText}
                disabled={!rawText.trim()}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Processar Lista de Jogos</span>
              </button>
            </div>
          )}

          {/* PREVIEW VIEW */}
          {previewData && !importResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4" />
                  <span>Conteúdo do Backloggd identificado com sucesso!</span>
                </div>
                <button
                  onClick={() => setPreviewData(null)}
                  className="text-slate-400 hover:text-white underline"
                >
                  Voltar
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#141824] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Pastas</span>
                  <span className="text-xl font-bold font-mono text-indigo-400">{previewData.folders.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Listas</span>
                  <span className="text-xl font-bold font-mono text-violet-400">{previewData.lists.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#141824] border border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Jogos</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {previewData.lists.reduce((acc, l) => acc + l.games.length, 0)}
                  </span>
                </div>
              </div>

              {/* Details breakdown */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {previewData.lists.map((l, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#141824] border border-white/5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">{l.title}</h4>
                      <span className="font-mono text-slate-400 text-[11px]">{l.games.length} jogos</span>
                    </div>
                    {l.folderName && (
                      <span className="text-[11px] text-indigo-400">Pasta: {l.folderName}</span>
                    )}
                    <p className="text-[11px] text-slate-400 truncate">
                      {l.games.map(g => g.title).join(', ')}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirmImport}
                className="w-full py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar e Adicionar à Minha Coleção</span>
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
                Importação Concluída com Sucesso!
              </h3>
              <p className="text-xs text-slate-300">
                {importResult.foldersCreated} pastas criadas · {importResult.listsCreated} listas adicionadas · {importResult.gamesAdded} jogos vinculados.
              </p>
              <p className="text-[11px] text-slate-500">
                Redirecionando para a visualização de Pastas e Listas...
              </p>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#0f131d] flex items-center justify-between text-[11px] text-slate-500">
          <span>Compatível com perfis públicos do Backloggd.com</span>
          <a 
            href="https://www.backloggd.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-slate-300"
          >
            <span>Abrir Backloggd</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
