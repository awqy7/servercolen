import { getEstoque, deletePeca, addQuantidade } from './actions';
import { Trash2, Plus, ArrowUp } from 'lucide-react';
import EstoqueForm from './EstoqueForm';

export default async function EstoquePage() {
  const pecas = await getEstoque();

  const totalCusto = pecas.reduce((acc: number, p: any) => acc + (p.valor_custo * p.quantidade), 0);
  const totalVendaEstimado = pecas.reduce((acc: number, p: any) => acc + (p.valor_venda * p.quantidade), 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Controle de Estoque</h1>
      </div>

      <div className="stat-grid">
        <div className="card stat-card" style={{ padding: '16px 24px' }}>
          <span className="title">Valor em Estoque (Custo)</span>
          <span className="value" style={{ fontSize: '1.8rem' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCusto)}
          </span>
        </div>
        <div className="card stat-card" style={{ padding: '16px 24px' }}>
          <span className="title">Lucro Potencial (Venda)</span>
          <span className="value" style={{ fontSize: '1.8rem', color: 'var(--success)' }}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVendaEstimado - totalCusto)}
          </span>
        </div>
        <div className="card stat-card" style={{ padding: '16px 24px' }}>
          <span className="title">Total de Peças (Tipos)</span>
          <span className="value" style={{ fontSize: '1.8rem' }}>{pecas.length}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        <EstoqueForm />

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Peças Cadastradas</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Cod</th>
                  <th>Produto</th>
                  <th>Qtd</th>
                  <th>Custo</th>
                  <th>Venda</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pecas.length > 0 ? pecas.map((p: any) => (
                  <tr key={p.id}>
                    <td>#{p.id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 500 }}>{p.nome}</td>
                    <td>
                      {p.quantidade < 5 ? (
                        <span className="badge badge-warning">{p.quantidade} un</span>
                      ) : (
                        <span className="badge badge-success">{p.quantidade} un</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor_custo)}
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor_venda)}
                    </td>
                    <td>
                      <div className="flex-row">
                        <form action={async () => {
                          'use server';
                          await addQuantidade(p.id, p.quantidade, 1);
                        }}>
                          <button type="submit" className="btn btn-outline" title="Adicionar +1 Unidade" style={{ padding: '4px', border: 'none', background: 'var(--surface-hover)' }}>
                            <ArrowUp size={16} color="var(--success)" />
                          </button>
                        </form>
                        <form action={async () => {
                          'use server';
                          await deletePeca(p.id);
                        }}>
                          <button type="submit" className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center" style={{ color: 'var(--text-muted)' }}>Estoque vazio.</td>
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
