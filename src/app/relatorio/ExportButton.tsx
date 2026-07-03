'use client';

import { useState } from 'react';
import { FileSpreadsheet, CheckCircle, Loader, XCircle } from 'lucide-react';

export default function ExportButton({ periodo }: { periodo: string }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/exportar?periodo=${periodo}`);
      if (res.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || 'Erro ao exportar');
      }

      const blob = await res.blob();

      const cdHeader = res.headers.get('Content-Disposition') || '';
      const filenameMatch = cdHeader.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `relatorio_${periodo}.xlsx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setFeedback({ type: 'success', message: 'Planilha baixada com sucesso!' });
    } catch (e: any) {
      setFeedback({ type: 'error', message: e.message || 'Erro ao gerar planilha.' });
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
        {loading ? 'Gerando...' : 'Exportar Planilha Excel'}
      </button>
      {feedback && (
        <span style={{
          fontSize: '0.78rem',
          display: 'flex', alignItems: 'center', gap: '4px',
          color: feedback.type === 'success' ? 'var(--success)' : 'var(--danger)'
        }}>
          {feedback.type === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {feedback.message}
        </span>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
