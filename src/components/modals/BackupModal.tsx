import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Download, Upload, RotateCcw, X, Database, Check, AlertCircle } from 'lucide-react';

export const BackupModal: React.FC = () => {
  const { isBackupModalOpen, setIsBackupModalOpen, exportData, importData, resetToDefaults, lastLoadedBackupName } = useStore();
  const [jsonInput, setJsonInput] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isBackupModalOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportData();
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Backup exportado com sucesso!' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Erro ao exportar backup: ' + (err.message || 'Erro desconhecido') });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setMsg({ type: 'success', text: 'Backup importado com sucesso!' });
        } else {
          setMsg({ type: 'error', text: 'Arquivo inválido. Verifique a estrutura JSON.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = () => {
    if (!jsonInput.trim()) return;
    const success = importData(jsonInput);
    if (success) {
      setMsg({ type: 'success', text: 'Backup importado com sucesso!' });
      setJsonInput('');
    } else {
      setMsg({ type: 'error', text: 'Código JSON inválido ou corrompido.' });
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja restaurar os dados de exemplo de Leonio Ranulfo? Suas alterações não salvas serão substituídas.')) {
      resetToDefaults();
      setMsg({ type: 'success', text: 'Dados originais restaurados com sucesso!' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#121622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f131d]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Backup e Exportação de Dados
            </h2>
          </div>
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {msg && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
              {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Export section */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Exportar Dados</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Salva em /backup
              </span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gera e grava automaticamente uma cópia <code className="text-indigo-300 font-mono">.json</code> na pasta <code className="text-amber-300 font-mono">backup/</code> do projeto (além de baixar no navegador). Toda vez que você iniciar o app, ele recarrega o backup mais recente desta pasta!
            </p>
            {lastLoadedBackupName && (
              <div className="text-[11px] font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 flex items-center justify-between">
                <span>Backup carregado na inicialização:</span>
                <span className="text-indigo-400 font-semibold truncate max-w-[200px]" title={lastLoadedBackupName}>
                  {lastLoadedBackupName}
                </span>
              </div>
            )}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="mt-2 w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exportando para /backup...' : 'Exportar para pasta /backup & Download'}</span>
            </button>
          </div>

          {/* Import section */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-400" />
              <span>Restaurar de um Arquivo de Backup</span>
            </h3>
            <p className="text-xs text-slate-400">
              Selecione um arquivo de backup previamente exportado para recuperar seus dados:
            </p>
            
            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-full py-2.5 px-4 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-center flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Escolher arquivo .json</span>
              </div>
            </label>

            {/* Manual JSON Paste */}
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer hover:text-slate-300 font-medium">
                Ou colar conteúdo JSON manualmente
              </summary>
              <div className="mt-2 space-y-2">
                <textarea
                  rows={3}
                  placeholder="Cole aqui o texto do seu backup JSON..."
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  className="w-full bg-[#0d1017] border border-white/10 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none"
                />
                <button
                  onClick={handleManualImport}
                  disabled={!jsonInput.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg"
                >
                  Importar do Texto
                </button>
              </div>
            </details>
          </div>

          {/* Reset section */}
          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <div>
              <span className="block text-xs font-medium text-slate-400">Dados de Exemplo</span>
              <span className="block text-[11px] text-slate-500">Recarrega o perfil padrão do Leonio Ranulfo</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restaurar Padrão</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
