'use client'

import { addPeca } from './actions';
import { Plus } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function EstoqueForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function clientAction(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await addPeca(formData);
      if (result?.success) {
        setMessage({ type: 'success', text: 'Peça adicionada com sucesso!' });
        // Limpar formulário (opcional, mas bom UX)
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) form.reset();
      } else {
        setMessage({ type: 'error', text: result?.error || 'Erro ao adicionar peça.' });
      }
    });
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Cadastrar Nova Peça</h2>
      
      {message && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '0.9rem'
        }}>
          {message.text}
        </div>
      )}

      <form action={clientAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="input-group">
          <label>Nome / Descrição do Produto</label>
          <input type="text" name="nome" className="input" placeholder="Ex: Filtro de Óleo" required />
        </div>
        <div className="input-group">
          <label>Quantidade Inicial</label>
          <input type="number" name="quantidade" className="input" defaultValue="1" min="0" required />
        </div>
        <div className="input-group">
          <label>Valor de Custo (R$)</label>
          <input type="number" step="0.01" name="valor_custo" className="input" placeholder="0.00" required />
        </div>
        <div className="input-group">
          <label>Valor de Venda (R$)</label>
          <input type="number" step="0.01" name="valor_venda" className="input" placeholder="0.00" required />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ marginTop: '8px' }}
          disabled={isPending}
        >
          {isPending ? 'Adicionando...' : (
            <><Plus size={18} /> Adicionar Produto</>
          )}
        </button>
      </form>
    </div>
  );
}
