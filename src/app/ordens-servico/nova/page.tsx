import { getClientes } from '@/app/clientes/actions';
import { getEstoque } from '@/app/estoque/actions';
import NovaOSForm from './NovaOSForm';

export const dynamic = 'force-dynamic';

export default async function NovaOSPage() {
  const clientes = await getClientes();
  const estoque = await getEstoque();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Nova Ordem de Serviço</h1>
      </div>
      
      {/* We pass the server data down to an interactive Client Component to handle multiple dynamic items seamlessly */}
      <NovaOSForm clientes={clientes} estoque={estoque} />
    </div>
  );
}
