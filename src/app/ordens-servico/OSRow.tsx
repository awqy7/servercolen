'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Printer, CheckCircle } from 'lucide-react';
import Link from 'next/link';

type OSProps = {
  os: any;
  pecas: any[];
  servicos: any[];
  onConcluir: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function OSRow({ os, pecas, servicos, onConcluir, onDelete }: OSProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr 
        onClick={() => setExpanded(!expanded)} 
        style={{ cursor: 'pointer', transition: 'background 0.2s', background: expanded ? 'var(--surface-hover)' : 'transparent' }}
      >
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {expanded ? <ChevronDown size={18} color="var(--primary)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
            <strong>#{os.id.toString().padStart(5, '0')}</strong>
          </div>
        </td>
        <td>{new Date(os.data_entrada).toLocaleDateString('pt-BR')}</td>
        <td style={{ fontWeight: 600 }}>{os.cliente_nome || 'Cliente Deletado'}</td>
        <td><span className="badge badge-primary">{os.cliente_placa || '-'}</span></td>
        <td>
          <span className={os.status === 'Concluído' ? "badge badge-success" : "badge badge-warning"}>
            {os.status}
          </span>
        </td>
        <td style={{ fontWeight: 600, color: 'var(--success)' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.valor_final)}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="flex-row">
            {os.status !== 'Concluído' ? (
              <>
                <button 
                  onClick={() => onConcluir(os.id)} 
                  className="btn btn-outline" 
                  style={{ padding: '6px', color: 'var(--success)', borderColor: 'var(--success)' }} 
                  title="Concluir OS"
                >
                  <CheckCircle size={16} />
                </button>
                <Link 
                  href={`/ordens-servico/editar/${os.id}`} 
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-outline" 
                  style={{ padding: '6px', color: 'var(--warning)', borderColor: 'var(--warning)' }} 
                  title="Editar OS"
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </div>
                </Link>
                <button 
                  onClick={() => onDelete(os.id)} 
                  className="btn btn-outline" 
                  style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }} 
                  title="Excluir OS"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, padding: '0 8px' }}>Finalizada</span>
            )}
            <Link href={`/ordens-servico/imprimir/${os.id}`} className="btn btn-outline" style={{ padding: '6px' }} title="Imprimir Nota de Serviço">
              <Printer size={16} color="var(--primary)" />
            </Link>
          </div>
        </td>
      </tr>
      
      {expanded && (
        <tr style={{ background: 'var(--surface-hover)' }}>
          <td colSpan={7} style={{ padding: '0' }}>
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                
                {/* Peças */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Peças / Produtos</h4>
                  {pecas && pecas.length > 0 ? (
                    <table className="table" style={{ background: 'var(--surface)', margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '8px 12px' }}>Item</th>
                          <th style={{ padding: '8px 12px' }}>Qtd</th>
                          <th style={{ padding: '8px 12px' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pecas.map((p: any) => (
                          <tr key={p.id}>
                            <td style={{ padding: '8px 12px' }}>{p.nome}</td>
                            <td style={{ padding: '8px 12px' }}>{p.quantidade}</td>
                            <td style={{ padding: '8px 12px' }}>R$ {(p.quantidade * p.valor_unitario).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhuma peça utilizada.</p>
                  )}
                </div>

                {/* Serviços */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mão de Obra / Serviços</h4>
                  {servicos && servicos.length > 0 ? (
                    <table className="table" style={{ background: 'var(--surface)', margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '8px 12px' }}>Descrição</th>
                          <th style={{ padding: '8px 12px' }}>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {servicos.map((s: any) => (
                          <tr key={s.id}>
                            <td style={{ padding: '8px 12px' }}>{s.descricao}</td>
                            <td style={{ padding: '8px 12px' }}>R$ {s.valor.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Nenhum serviço registrado.</p>
                  )}
                </div>

              </div>
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '24px' }}>
                <span style={{ fontSize: '0.9rem' }}>Total Peças: <strong>R$ {os.valor_pecas.toFixed(2)}</strong></span>
                <span style={{ fontSize: '0.9rem' }}>Total Serviços: <strong>R$ {os.valor_maodeobra.toFixed(2)}</strong></span>
                <span style={{ fontSize: '1rem', color: 'var(--primary)' }}>Valor Final: <strong>R$ {os.valor_final.toFixed(2)}</strong></span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
