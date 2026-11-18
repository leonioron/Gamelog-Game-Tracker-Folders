import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useStore } from '../../context/StoreContext';
import { ImportMode } from '../../types';
import { ConfirmModal } from './ConfirmModal';
import {
  Download,
  Upload,
  RotateCcw,
  X,
  Database,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Copy,
  Layers,
  RefreshCw,
} from 'lucide-react';

export const BackupModal: React.FC = () => {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    exportData,
    exportCsv,
    copyBackupToClipboard,
    importData,
    resetToDefaults,
    lastLoadedBackupName,
  } = useStore();

  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  if (!isBackupModalOpen) return null;

  const isNative = Capacitor.isNativePlatform();

  const handleExportJson = async () => {
    setIsExportingJson(true);
    setMsg(null);
    try {
      const res = await exportData();
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Backup JSON exportado com sucesso!' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Erro ao exportar backup: ' + (err?.message || 'Erro desconhecido') });
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    setMsg(null);
    try {
      const res = await exportCsv();
      if (res.success) {
        setMsg({ type: 'success', text: res.message || 'Relatório CSV exportado com sucesso!' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: 'Erro ao exportar CSV: ' + (err?.message || 'Erro desconhecido') });
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleCopyJson = async () => {
    const ok = await copyBackupToClipboard();
    setMsg(
      ok
        ? { type: 'success', text: 'JSON completo copiado para a área de transferência!' }
        : { type: 'error', text: 'Não foi possível copiar automaticamente neste WebView.' }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importData(content, importMode);
        setMsg({ type: res.success ? 'success' : 'error', text: res.message });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleManualImport = () => {
    if (!jsonInput.trim()) return;
    const res = importData(jsonInput, importMode);
    setMsg({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) {
      setJsonInput('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-safe-top bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={() => setIsBackupModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg min-w-0 bg-[#121824] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-6 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-[#090D14] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-4 h-4 text-indigo-400 shrink-0" />
            <h2 className="text-sm font-semibold text-white truncate">
              Backup e Portabilidade (Offline)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsBackupModalOpen(false)}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal de backup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto min-w-0">
          {msg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {msg.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="min-w-0 break-words">{msg.text}</span>
            </div>
          )}

          {/* Export section */}
          <div className="p-4 rounded-xl bg-[#090D14] border border-white/5 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Exportar Dados</span>
              </h3>
              <span className="text-[11px] font-mono text-indigo-300">
                {isNative ? 'Compartilhamento Nativo Android' : 'Download + pasta /backup'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Exporte sua biblioteca completa em <code className="text-indigo-300 font-mono">.json</code> ou gere uma planilha <code className="text-emerald-300 font-mono">.csv</code> com todos os status e notas.
            </p>

            {lastLoadedBackupName && (
              <div className="text-[11px] font-mono text-slate-400 bg-[#121824] px-3 py-2 rounded-lg border border-white/5 flex items-center justify-between gap-2 min-w-0">
                <span className="shrink-0">Backup inicial:</span>
                <span className="text-indigo-400 font-semibold truncate" title={lastLoadedBackupName}>
                  {lastLoadedBackupName}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExportJson}
                disabled={isExportingJson}
                className="min-h-[44px] py-2.5 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{isExportingJson ? 'Exportando...' : 'Exportar JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExportingCsv}
                className="min-h-[44px] py-2.5 px-3.5 text-xs font-semibold text-emerald-200 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isExportingCsv ? 'Gerando CSV...' : 'Relatório CSV'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="min-h-[44px] w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Copiar JSON para Área de Transferência</span>
            </button>
          </div>

          {/* Import section */}
          <div className="p-4 rounded-xl bg-[#090D14] border border-white/5 space-y-3 min-w-0">
            <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Importar Backup JSON</span>
            </h3>

            {/* Mode switcher: Mesclar vs Substituir tudo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('merge')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  importMode === 'merge'
                    ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                    : 'bg-[#121824] border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Mesclar</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  importMode === 'replace'
                    ? 'bg-amber-600/25 border-amber-500 text-amber-200'
                    : 'bg-[#121824] border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>Substituir Tudo</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {importMode === 'merge'
                ? 'Mesclar adiciona jogos, pastas, listas e logs novos sem apagar o que você já salvou.'
                : 'Substituir Tudo apaga os dados atuais e restaura exatamente o conteúdo do arquivo.'}
            </p>

            <label className="block w-full cursor-pointer">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="min-h-[44px] w-full py-2.5 px-4 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-center flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 shrink-0" />
                <span>Escolher arquivo .json</span>
              </div>
            </label>

            {/* Manual JSON Paste fallback for restricted WebViews */}
            <details className="text-xs text-slate-400">
              <summary className="min-h-[44px] flex items-center cursor-pointer hover:text-slate-200 font-medium">
                Ou colar texto JSON manualmente (fallback WebView)
              </summary>
              <div className="mt-2 space-y-2.5">
                <textarea
                  rows={3}
                  placeholder="Cole aqui o texto do seu backup JSON..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleManualImport}
                  disabled={!jsonInput.trim()}
                  className="min-h-[44px] w-full px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  {importMode === 'merge' ? 'Mesclar a partir do Texto' : 'Substituir a partir do Texto'}
                </button>
              </div>
            </details>
          </div>

          {/* Reset section */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
            <div className="min-w-0">
              <span className="block text-xs font-medium text-slate-300">Dados de Exemplo</span>
              <span className="block text-[11px] text-slate-500">Recarrega a base inicial local</span>
            </div>
            <button
              type="button"
              onClick={() => setIsConfirmResetOpen(true)}
              className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmResetOpen}
        title="Restaurar Dados Padrão"
        message="Tem certeza que deseja restaurar os dados de exemplo iniciais? Suas alterações atuais serão substituídas."
        confirmLabel="Restaurar Padrão"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={() => {
          resetToDefaults();
          setMsg({ type: 'success', text: 'Dados iniciais restaurados com sucesso!' });
        }}
        onCancel={() => setIsConfirmResetOpen(false)}
      />
    </div>
  );
};
