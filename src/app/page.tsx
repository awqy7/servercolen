import { getDashboardStats } from './actions';
import { Wrench, DollarSign, WalletCards, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Geral</h1>
      </div>

      <div className="stat-grid">
        {/* OS em Andamento */}
        <div className="card stat-card">
          <div className="stat-card-header">
            <span className="title">OS em Andamento</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <Wrench size={24} />
            </div>
          </div>
          <span className="value">{stats.osAtivas}</span>
        </div>

        {/* Faturamento Mensal */}
        <div className="card stat-card">
          <div className="stat-card-header">
            <span className="title">Faturamento Mensal</span>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <span className="value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.faturamento)}
          </span>
        </div>

        {/* Saldo de Caixa */}
        <div className="card stat-card">
          <div className="stat-card-header">
            <span className="title">Saldo do Caixa (Total)</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <WalletCards size={24} />
            </div>
          </div>
          <span className="value">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.saldoCaixa)}
          </span>
        </div>
      </div>

      {/* Alertas de Estoque */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle color="var(--warning)" /> Alertas de Estoque Baixo
        </h2>
        
        {stats.alertasEstoque.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Peça/Produto</th>
                  <th>Quantidade Atual</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {stats.alertasEstoque.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td><span className="badge badge-warning">{item.quantidade} unidades</span></td>
                    <td>
                      <Link href={`/estoque`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Repor
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>O estoque está em níveis normais. Nenhuma peça próxima de acabar.</p>
        )}
      </div>
    </div>
  );
}
