'use client';

import { useEffect, useState } from 'react';

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function today() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

type OsPorStatus = { concluidas: number; andamento: number; abertas: number };
type Atividade = { id: number; data: string; status: string; valor: number; cliente: string; placa: string };
type Alerta = { id: number; nome: string; quantidade: number };
type SemanaItem = { label: string; valor: number };

export default function OwnerDashboard({
  faturamentoHoje, faturamentoSemana, saldoCaixa,
  osAtivas, osConcluidasMes, osPorStatus,
  faturamentoSemanal, faturamento,
  alertasEstoque, ultimasAtividades,
  totalClientes, clientesNovosMes,
  entradasMes, saidasMes,
}: {
  faturamentoHoje: number; faturamentoSemana: number; saldoCaixa: number;
  osAtivas: number; osConcluidasMes: number; osPorStatus: OsPorStatus;
  faturamentoSemanal: SemanaItem[]; faturamento: number;
  alertasEstoque: Alerta[]; ultimasAtividades: Atividade[];
  totalClientes: number; clientesNovosMes: number;
  entradasMes: number; saidasMes: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const maxSemana = Math.max(...faturamentoSemanal.map(m => m.valor), 1);
  const maxStatus = Math.max(osPorStatus.concluidas, osPorStatus.andamento, osPorStatus.abertas, 1);

  return (
    <div className="owner-dashboard">
      {/* Header */}
      <div className="owner-header">
        <div>
          <h1 className="owner-greeting">{greeting()}! ☕</h1>
          <p className="owner-date">{today()}</p>
        </div>
        <div className="owner-brand">AP</div>
      </div>

      {/* Row 1 — Hoje */}
      <div className="owner-row">
        <div className="owner-card owner-card-primary">
          <span className="owner-card-label">Faturamento Hoje</span>
          <span className="owner-card-value">{fmt(faturamentoHoje)}</span>
        </div>
        <div className="owner-card owner-card-accent">
          <span className="owner-card-label">OS Abertas</span>
          <span className="owner-card-value">{osAtivas}</span>
        </div>
        <div className="owner-card owner-card-success">
          <span className="owner-card-label">Saldo</span>
          <span className="owner-card-value" style={{ color: saldoCaixa >= 0 ? undefined : 'var(--danger)' }}>
            {fmt(saldoCaixa)}
          </span>
        </div>
      </div>

      {/* Row 2 — Semana / Mês */}
      <div className="owner-row">
        <div className="owner-card owner-card-wide">
          <span className="owner-card-label">Faturamento da Semana</span>
          <span className="owner-card-value">{fmt(faturamentoSemana)}</span>
        </div>
        <div className="owner-card owner-card-wide">
          <span className="owner-card-label">OS Concluídas no Mês</span>
          <span className="owner-card-value">{osConcluidasMes}</span>
          <span className="owner-card-sub">{fmt(faturamento)} em serviços</span>
        </div>
      </div>

      {/* Gráfico — Faturamento Semanal */}
      <div className="owner-chart-section">
        <h2 className="owner-section-title">Faturamento por Dia</h2>
        <div className="owner-bar-chart">
          {faturamentoSemanal.map((dia, i) => {
            const pct = (dia.valor / maxSemana) * 100;
            return (
              <div key={i} className="owner-bar-row">
                <span className="owner-bar-label">{dia.label}</span>
                <div className="owner-bar-track">
                  <div
                    className="owner-bar-fill"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="owner-bar-value">{dia.valor >= 1000 ? `R$ ${(dia.valor / 1000).toFixed(1)}k` : fmt(dia.valor)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OS por Status */}
      <div className="owner-chart-section">
        <h2 className="owner-section-title">Ordens de Serviço por Status</h2>
        <div className="owner-bar-chart">
          {[
            { label: 'Concluídas', value: osPorStatus.concluidas, color: 'var(--success)' },
            { label: 'Em Andamento', value: osPorStatus.andamento, color: 'var(--warning)' },
            { label: 'Abertas', value: osPorStatus.abertas, color: 'var(--primary)' },
          ].map((item) => (
            <div key={item.label} className="owner-bar-row">
              <span className="owner-bar-label">{item.label}</span>
              <div className="owner-bar-track">
                <div
                  className="owner-bar-fill"
                  style={{ width: `${Math.max((item.value / maxStatus) * 100, 2)}%`, background: item.color }}
                />
              </div>
              <span className="owner-bar-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clientes + Financeiro */}
      <div className="owner-row">
        <div className="owner-card owner-card-wide">
          <span className="owner-card-label">Total de Clientes</span>
          <span className="owner-card-value">{totalClientes}</span>
          <span className="owner-card-sub" style={{ color: 'var(--success)' }}>
            +{clientesNovosMes} este mês
          </span>
        </div>
        <div className="owner-card owner-card-wide">
          <span className="owner-card-label">Movimento do Mês</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
            <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.95rem' }}>
              +{fmt(entradasMes)}
            </span>
            <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.95rem' }}>
              -{fmt(saidasMes)}
            </span>
          </div>
          <span className="owner-card-sub">Entradas vs Saídas</span>
        </div>
      </div>

      {/* Estoque Baixo */}
      {alertasEstoque.length > 0 && (
        <div className="owner-chart-section">
          <h2 className="owner-section-title" style={{ color: 'var(--warning)' }}>
            ⚠️ Estoque Baixo
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alertasEstoque.map(item => (
              <div key={item.id} className="owner-alert-row">
                <span>{item.nome}</span>
                <span className="owner-alert-qty">{item.quantidade} unid</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Últimas Atividades */}
      {ultimasAtividades.length > 0 && (
        <div className="owner-chart-section">
          <h2 className="owner-section-title">Últimas Atividades</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ultimasAtividades.slice(0, 4).map(os => (
              <div key={os.id} className={`owner-activity-row ${os.status === 'Concluído' ? 'activity-done' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <span className="owner-os-badge">#{os.id.toString().padStart(4, '0')}</span>
                  <span className="owner-activity-client">{os.cliente || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span className={`owner-status-tag ${os.status === 'Concluído' ? 'tag-done' : os.status === 'Em Andamento' ? 'tag-progress' : 'tag-open'}`}>
                    {os.status}
                  </span>
                  <span className="owner-activity-val">{fmt(os.valor || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="owner-footer">
        AutoRepair Pro • Painel do Proprietário
      </div>
    </div>
  );
}
