import { getRelatorio, Periodo } from './actions';
import Link from 'next/link';
import ExportButton from './ExportButton';
import { BarChart2, TrendingUp, TrendingDown, DollarSign, Wrench, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default async function RelatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const params = await searchParams;
  const periodo = (params?.periodo as Periodo) || 'mes';
  const data = await getRelatorio(periodo);

  const periodoLabel = {
    dia: 'Hoje',
    semana: 'Esta Semana',
    mes: 'Este Mês',
  }[periodo];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BarChart2 color="var(--primary)" /> Relatório Financeiro
          </span>
        </h1>
        <ExportButton periodo={periodo} />
      </div>

      {/* Seletor de período */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {(['dia', 'semana', 'mes'] as Periodo[]).map((p) => {
          const label = { dia: '📅 Hoje', semana: '📆 Semanal', mes: '🗓️ Mensal' }[p];
          const isActive = periodo === p;
          return (
            <Link
              key={p}
              href={`/relatorio?periodo=${p}`}
              className="btn"
              style={{
                background: isActive ? 'var(--primary)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                border: isActive ? 'none' : '1px solid var(--border)',
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? '0 2px 10px rgba(99,102,241,0.35)' : 'none',
                transform: isActive ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </Link>
          );
        })}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center', fontStyle: 'italic' }}>
          Período: <strong style={{ color: 'var(--text-main)' }}>{periodoLabel}</strong>
        </span>
      </div>

      {/* Cards de resumo */}
      <div className="stat-grid">
        <div className="card stat-card" style={{ borderTop: '3px solid var(--primary)' }}>
          <div className="stat-card-header">
            <span className="title">OS Concluídas</span>
            <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
              <Wrench size={22} />
            </div>
          </div>
          <span className="value">{data.resumoOS.quantidade}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Peças: {fmt(data.resumoOS.totalPecas)} · Mão de obra: {fmt(data.resumoOS.totalMaoDeObra)}
          </span>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--warning)' }}>
          <div className="stat-card-header">
            <span className="title">Faturamento (OS)</span>
            <div className="stat-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <span className="value">{fmt(data.resumoOS.total)}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Serviços concluídos no período</span>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--success)' }}>
          <div className="stat-card-header">
            <span className="title">Entradas (Caixa)</span>
            <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <span className="value" style={{ color: 'var(--success)' }}>{fmt(data.resumoCaixa.totalEntradas)}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Total de entradas no período</span>
        </div>

        <div className="card stat-card" style={{ borderTop: '3px solid var(--danger)' }}>
          <div className="stat-card-header">
            <span className="title">Saídas (Caixa)</span>
            <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
              <TrendingDown size={22} />
            </div>
          </div>
          <span className="value" style={{ color: 'var(--danger)' }}>{fmt(data.resumoCaixa.totalSaidas)}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Total de saídas no período</span>
        </div>

        <div className="card stat-card" style={{
          borderTop: `3px solid ${data.resumoCaixa.saldo >= 0 ? 'var(--success)' : 'var(--danger)'}`,
          gridColumn: 'span 1',
        }}>
          <div className="stat-card-header">
            <span className="title">Saldo do Período</span>
            <div className="stat-card-icon" style={{
              background: data.resumoCaixa.saldo >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: data.resumoCaixa.saldo >= 0 ? 'var(--success)' : 'var(--danger)'
            }}>
              <DollarSign size={22} />
            </div>
          </div>
          <span className="value" style={{ color: data.resumoCaixa.saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {fmt(data.resumoCaixa.saldo)}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Entradas − Saídas do caixa</span>
        </div>
      </div>

      {/* Tabela de OS concluídas */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={18} color="var(--primary)" />
          Ordens de Serviço Concluídas — {periodoLabel}
        </h2>
        {data.osConcluidas.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>#OS</th>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Veículo</th>
                  <th>Peças</th>
                  <th>Mão de Obra</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.osConcluidas.map((os: any) => (
                  <tr key={os.id}>
                    <td><span className="badge badge-primary">#{os.id}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(os.data_entrada).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{os.cliente_nome || '—'}</td>
                    <td>{os.modelo || '—'} {os.placa ? <span className="badge badge-primary" style={{ marginLeft: 4 }}>{os.placa}</span> : ''}</td>
                    <td>{fmt(os.valor_pecas)}</td>
                    <td>{fmt(os.valor_maodeobra)}</td>
                    <td><strong style={{ color: 'var(--success)' }}>{fmt(os.valor_final)}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--background)' }}>
                  <td colSpan={4} style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    TOTAL ({data.resumoOS.quantidade} OS)
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{fmt(data.resumoOS.totalPecas)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{fmt(data.resumoOS.totalMaoDeObra)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--success)', fontSize: '1rem' }}>
                    {fmt(data.resumoOS.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            Nenhuma OS concluída no período selecionado.
          </p>
        )}
      </div>

      {/* Tabela de transações do caixa */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={18} color="var(--warning)" />
          Transações do Caixa — {periodoLabel}
        </h2>
        {data.transacoes.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.transacoes.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(t.data).toLocaleString('pt-BR')}
                    </td>
                    <td>
                      {t.tipo === 'Entrada' ? (
                        <span className="badge badge-success flex-row" style={{ gap: '4px' }}>
                          <ArrowUpCircle size={14} /> Entrada
                        </span>
                      ) : (
                        <span className="badge flex-row" style={{ gap: '4px', color: 'var(--danger)', background: 'rgba(239,68,68,0.1)' }}>
                          <ArrowDownCircle size={14} /> Saída
                        </span>
                      )}
                    </td>
                    <td>
                      {t.descricao}
                      {t.os_id && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 6 }}>(OS #{t.os_id})</span>}
                    </td>
                    <td style={{ fontWeight: 600, color: t.tipo === 'Entrada' ? 'var(--success)' : 'var(--danger)' }}>
                      {t.tipo === 'Entrada' ? '+' : '-'} {fmt(t.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--background)' }}>
                  <td colSpan={3} style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    SALDO DO PERÍODO
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: data.resumoCaixa.saldo >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '1rem' }}>
                    {fmt(data.resumoCaixa.saldo)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
            Nenhuma transação no caixa no período selecionado.
          </p>
        )}
      </div>
    </div>
  );
}
