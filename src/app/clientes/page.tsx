import { getClientes, deleteCliente } from './actions';
import { Trash2, Users, Car } from 'lucide-react';
import ClienteForm from './ClienteForm';

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <ClienteForm />

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--primary)" />
              Clientes Cadastrados
            </h2>
            <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Veículo</th>
                  <th>Placa</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length > 0 ? clientes.map((c) => (
                  <tr key={c.id}>
                    <td data-label="Nome" style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td data-label="Telefone">
                      {c.telefone && c.telefone !== '-' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          {c.telefone}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td data-label="Veículo">
                      {c.modelo ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Car size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          {c.modelo}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td data-label="Placa">
                      {c.placa ? (
                        <span className="badge badge-primary" style={{ letterSpacing: '1px' }}>{c.placa}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td data-label="">
                      <form action={async () => {
                        'use server';
                        await deleteCliente(c.id);
                      }}>
                        <button type="submit" className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 16px' }}>
                      Nenhum cliente cadastrado ainda.
                    </td>
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
