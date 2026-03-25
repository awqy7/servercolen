'use client'

import { addTransacao } from './actions';
import { PlusCircle } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function CaixaForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function clientAction(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await addTransacao(formData);
      if (result?.success) {
        setMessage({ type: 'success', text: 'Transação registrada com sucesso!' });
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) form.reset();
      } else {
        setMessage({ type: 'error', text: result?.error || 'Erro ao registrar transação.' });
      }
    });
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Nova Transação Manual</h2>
      
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
          <label>Tipo de Movimentação</label>
          <select name="tipo" className="select" required>
            <option value="Entrada">Entrada (Recebimento)</option>
            <option value="Saída">Saída (Pagamento/Gasto)</option>
          </select>
        </div>
        <div className="input-group">
          <label>Valor (R$)</label>
          <input type="number" step="0.01" name="valor" className="input" placeholder="0.00" required />
        </div>
        <div className="input-group">
          <label>Descrição / Motivo</label>
          <input type="text" name="descricao" className="input" placeholder="Ex: Pagamento de Luz" required />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ marginTop: '8px' }}
          disabled={isPending}
        >
          {isPending ? 'Registrando...' : (
            <><PlusCircle size={18} /> Registrar no Caixa</>
          )}
        </button>
      </form>
    </div>
  );
}
