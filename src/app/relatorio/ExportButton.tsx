'use client';

import { useState } from 'react';
import { FileSpreadsheet, CheckCircle, Loader } from 'lucide-react';

export default function ExportButton({ periodo }: { periodo: string }) {
  const [loading, setLoading] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setSavedPath(null);
    try {
      const res = await fetch(`/api/exportar?periodo=${periodo}`);
      if (!res.ok) throw new Error('Erro ao exportar');

      const filename = res.headers.get('X-Filename') || 'relatorio.xlsx';
      const xPath = res.headers.get('X-Saved-Path') || '';

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setSavedPath(xPath || filename);
    } catch (e) {
      alert('Erro ao gerar planilha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <button
        onClick={handleExport}
        disabled={loading}
        className="btn btn-success"
        style={{ gap: '8px', padding: '10px 20px', fontWeight: 600 }}
      >
        {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FileSpreadsheet size={18} />}
        {loading ? 'Gerando...' : '📊 Exportar Planilha Excel'}
      </button>
      {savedPath && (
        <span style={{ fontSize: '0.78rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={12} /> Salvo também em: <em style={{ marginLeft: 2 }}>{savedPath}</em>
        </span>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
