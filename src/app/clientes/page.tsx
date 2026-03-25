import { getClientes, deleteCliente } from './actions';
import { Trash2, UserPlus, Car } from 'lucide-react';
import ClienteForm from './ClienteForm';

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestão de Clientes e Veículos</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
        <ClienteForm />

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Clientes Cadastrados ({clientes.length})</h2>
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
                    <td style={{ fontWeight: 600 }}>{c.nome}</td>
                    <td>{c.telefone || '-'}</td>
                    <td>
                      <span className="flex-row" style={{ gap: '6px', color: 'var(--text-muted)' }}>
                        <Car size={16} /> {c.modelo || '-'}
                      </span>
                    </td>
                    <td><span className="badge badge-primary" style={{ letterSpacing: '1px' }}>{c.placa || '-'}</span></td>
                    <td>
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
                    <td colSpan={5} className="text-center" style={{ color: 'var(--text-muted)' }}>Nenhum cliente cadastrado ainda.</td>
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
