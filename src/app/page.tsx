import { getDashboardStats } from './actions';
import { Wrench, DollarSign, WalletCards, AlertTriangle, Users, CheckCircle, TrendingUp, TrendingDown, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default async function Dashboard() {
  const stats = await getDashboardStats();

  const maxFaturamento = Math.max(...stats.faturamentoMensal.map(m => m.valor), 1);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Geral</h1>
      </div>

      {/* Cards principais */}
      <div className="stat-grid">
        <div className="card stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="stat-card-header">
            <span className="title">OS em Andamento</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <Wrench size={24} />
            </div>
          </div>
          <span className="value">{stats.osAtivas}</span>
          <Link href="/ordens-servico" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--success)' }}>
          <div className="stat-card-header">
            <span className="title">OS Concluídas (Mês)</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <CheckCircle size={24} />
            </div>
          </div>
          <span className="value">{stats.osConcluidasMes}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmt(stats.faturamento)} em serviços</span>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--warning)' }}>
          <div className="stat-card-header">
            <span className="title">Faturamento Mensal</span>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <DollarSign size={24} />
            </div>
          </div>
          <span className="value">{fmt(stats.faturamento)}</span>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--success)' }}>
          <div className="stat-card-header">
            <span className="title">Saldo do Caixa</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <WalletCards size={24} />
            </div>
          </div>
          <span className="value" style={{ color: stats.saldoCaixa >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt(stats.saldoCaixa)}
          </span>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="stat-card-header">
            <span className="title">Clientes</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
          </div>
          <span className="value">{stats.totalClientes}</span>
          <Link href="/clientes" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--warning)' }}>
          <div className="stat-card-header">
            <span className="title">Caixa no Mês</span>
            <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={14} /> {fmt(stats.entradasMes)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingDown size={14} /> {fmt(stats.saidasMes)}
              </span>
            </div>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Entradas vs Saídas</span>
        </div>
      </div>

      {/* Gráfico de Faturamento 6 meses */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} color="var(--primary)" />
          Faturamento Mensal (Últimos 6 Meses)
        </h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', minHeight: '160px', paddingTop: '16px' }}>
          {stats.faturamentoMensal.map((mes, i) => {
            const altura = Math.max((mes.valor / maxFaturamento) * 140, 8);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {fmt(mes.valor)}
                </span>
                <div style={{
                  width: '100%', maxWidth: '60px',
                  height: `${altura}px`,
                  background: 'linear-gradient(180deg, var(--primary) 0%, rgba(99,102,241,0.4) 100%)',
                  borderRadius: '8px 8px 4px 4px',
                  transition: 'height 0.3s ease',
                  minHeight: '8px'
                }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {mes.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Últimas Atividades */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--primary)" />
          Últimas Atividades
        </h2>
        {stats.ultimasAtividades.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>OS</th>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {stats.ultimasAtividades.map((os: any) => (
                  <tr key={os.id}>
                    <td><span className="badge badge-primary">#{os.id.toString().padStart(5, '0')}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {os.data ? new Date(os.data).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td style={{ fontWeight: 500 }}>{os.cliente || '—'}</td>
                    <td>
                      <span className={os.status === 'Concluído' ? 'badge badge-success' : 'badge badge-warning'}>
                        {os.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{fmt(os.valor || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
            Nenhuma ordem de serviço registrada ainda.
          </p>
        )}
      </div>

      {/* Alertas de Estoque */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <Link href="/estoque" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
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
