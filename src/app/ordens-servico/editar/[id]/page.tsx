import { getOrdemCompleta } from '../../actions';
import { getClientes } from '@/app/clientes/actions';
import { getEstoque } from '@/app/estoque/actions';
import EditarOSForm from './EditarOSForm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditarOSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getOrdemCompleta(parseInt(id));
  
  if (!data || data.os.status === 'Concluído') {
    redirect('/ordens-servico');
  }

  const clientes = await getClientes();
  const estoque = await getEstoque();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Editar Ordem de Serviço #{id.padStart(5, '0')}</h1>
      </div>
      
      <EditarOSForm 
        os={data.os} 
        pecas={data.pecas} 
        servicos={data.servicos} 
        clientes={clientes} 
        estoque={estoque} 
      />
    </div>
  );
}
