import { getOrdens, deleteOrdem, concluirOrdem } from './actions';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import OSRow from './OSRow';

export default async function OrdensServicoPage() {
  const ordens = await getOrdens();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ordens de Serviço (OS)</h1>
        <Link href="/ordens-servico/nova" className="btn btn-primary">
          <Plus size={18} /> Criar Nova OS
        </Link>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Núm OS</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Status</th>
                <th>Valor Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordens.length > 0 ? ordens.map((os) => (
                <OSRow 
                  key={os.id} 
                  os={os} 
                  pecas={os.pecas} 
                  servicos={os.servicos}
                  onConcluir={concluirOrdem}
                  onDelete={deleteOrdem}
                />
              )) : (
                <tr>
                  <td colSpan={7} className="text-center" style={{ color: 'var(--text-muted)' }}>Nenhuma Ordem de Serviço encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
