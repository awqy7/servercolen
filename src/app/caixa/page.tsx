import { getCaixaTransacoes, deleteTransacao } from './actions';
import { getDashboardStats } from '../actions';
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react';
import CaixaForm from './CaixaForm';

export default async function CaixaPage() {
  const transacoes = await getCaixaTransacoes();
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Controle de Caixa</h1>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card stat-card" style={{ background: 'linear-gradient(135deg, var(--surface) 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
          <span className="title">Saldo Total da Oficina</span>
          <span className="value" style={{ color: stats.saldoCaixa >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '2.5rem' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.saldoCaixa)}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        <div className="card">
        <CaixaForm />
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Histórico Financeiro</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {transacoes.length > 0 ? transacoes.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.data).toLocaleString('pt-BR')}</td>
                    <td>
                      {t.tipo === 'Entrada' ? 
                        <span className="badge badge-success flex-row" style={{gap:'4px'}}><ArrowUpCircle size={14}/> Entrada</span> : 
                        <span className="badge badge-warning flex-row" style={{gap:'4px', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)'}}><ArrowDownCircle size={14}/> Saída</span>
                      }
                    </td>
                    <td>{t.descricao} {t.os_id && <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>(OS #{t.os_id})</span>}</td>
                    <td style={{ fontWeight: 600, color: t.tipo === 'Entrada' ? 'var(--success)' : 'var(--danger)'}}>
                      {t.tipo === 'Entrada' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.valor)}
                    </td>
                    <td>
                      <form action={async () => {
                        'use server';
                        await deleteTransacao(t.id);
                      }}>
                        <button type="submit" className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center" style={{ color: 'var(--text-muted)' }}>Nenhuma transação registrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
