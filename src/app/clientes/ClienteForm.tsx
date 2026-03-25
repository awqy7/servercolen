'use client'

import { addCliente } from './actions';
import { UserPlus } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function ClienteForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function clientAction(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await addCliente(formData);
      if (result?.success) {
        setMessage({ type: 'success', text: 'Cliente cadastrado com sucesso!' });
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) form.reset();
      } else {
        setMessage({ type: 'error', text: result?.error || 'Erro ao cadastrar cliente.' });
      }
    });
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Cadastrar Novo Cliente</h2>
      
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
          <label>Nome Completo do Cliente</label>
          <input type="text" name="nome" className="input" placeholder="Ex: João Silva" required />
        </div>
        <div className="input-group">
          <label>Telefone / WhatsApp</label>
          <input type="text" name="telefone" className="input" placeholder="Ex: (11) 99999-9999" />
        </div>
        
        <hr style={{ margin: '10px 0', borderColor: 'var(--border)' }} />
        <h3 style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Dados do Veículo</h3>

        <div className="input-group">
          <label>Placa do Veículo</label>
          <input type="text" name="placa" className="input" placeholder="AAA-1234" />
        </div>
        <div className="input-group">
          <label>Marca / Modelo</label>
          <input type="text" name="modelo" className="input" placeholder="VW Gol 1.0 2012" />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ marginTop: '8px' }}
          disabled={isPending}
        >
          {isPending ? 'Salvando...' : (
            <><UserPlus size={18} /> Salvar Cliente</>
          )}
        </button>
      </form>
    </div>
  );
}
