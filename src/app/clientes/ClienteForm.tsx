'use client'

import { addCliente } from './actions';
import { UserPlus, X } from 'lucide-react';
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
        const form = document.querySelector('#cliente-form') as HTMLFormElement;
        if (form) form.reset();
      } else {
        setMessage({ type: 'error', text: result?.error || 'Erro ao cadastrar cliente.' });
      }
    });
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <UserPlus size={18} color="var(--primary)" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Cadastrar Cliente</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Preencha os dados do cliente e veículo
          </p>
        </div>
      </div>
      
      {message && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
        }}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'inherit', opacity: 0.6, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form id="cliente-form" action={clientAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="input-group">
          <label>Nome Completo do Cliente</label>
          <input type="text" name="nome" className="input" placeholder="Ex: João Silva" required />
        </div>
        <div className="input-group">
          <label>Telefone / WhatsApp</label>
          <input type="text" name="telefone" className="input" placeholder="Ex: (11) 99999-9999" />
        </div>
        
        <div style={{
          height: 1, background: 'var(--border)', margin: '4px 0',
          border: 'none'
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Car size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Dados do Veículo</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="input-group">
            <label>Placa</label>
            <input type="text" name="placa" className="input" placeholder="AAA-1234" />
          </div>
          <div className="input-group">
            <label>Marca / Modelo</label>
            <input type="text" name="modelo" className="input" placeholder="VW Gol 1.0 2012" />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ marginTop: '4px', alignSelf: 'flex-start' }}
          disabled={isPending}
        >
          {isPending ? 'Salvando...' : (
            <><UserPlus size={18} /> Cadastrar Cliente</>
          )}
        </button>
      </form>
    </div>
  );
}

function Car(props: any) {
  return (
    <svg width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke={props.color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}
