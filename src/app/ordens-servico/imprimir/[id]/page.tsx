import { getOrdemCompleta } from '../../actions';
import { notFound } from 'next/navigation';
import { Printer } from 'lucide-react';

export default async function NotaFiscalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const osData = await getOrdemCompleta(parseInt(id));
  
  if (!osData) return notFound();

  const { os, pecas, servicos } = osData;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', color: '#000', padding: '40px', borderRadius: '8px', minHeight: '800px' }}>
      
      {/* Print styles applied globally when printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex-between no-print" style={{ marginBottom: '24px' }}>
        {/* We use window.print() natively here instead of complex setup */}
        <h2 style={{ color: 'var(--text-muted)' }}>Visualização da Impressão</h2>
        <button className="btn btn-primary" onClick={() => {/* Needs client side for this button so we use raw HTML onlick if possible but this is SSC so we leave to browser ctrl+p OR we add a tiny client script */}}
          style={{ cursor: 'pointer' }}>
          Tecle Ctrl+P para Imprimir ou Salvar em PDF
        </button>
      </div>

      <div className="printable-area" style={{ border: '2px solid #222', padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #222', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase' }}>AutoRepair Pro</h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>O Melhor Cuidado para seu Veículo</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#444' }}>Cel: (11) 99999-9999 | CNPJ: 00.000.000/0001-00</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>NOTA DE SERVIÇO / OS</h2>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Nº: {os.id.toString().padStart(6, '0')}</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Data Entrada: {new Date(os.data_entrada).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fafafa' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Dados do Cliente e Veículo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div><strong>Cliente:</strong> {os.cliente_nome}</div>
            <div><strong>Telefone:</strong> {os.cliente_telefone || '-'}</div>
            <div><strong>Veículo Modelo:</strong> {os.cliente_modelo || '-'}</div>
            <div><strong>Placa:</strong> {os.cliente_placa || '-'}</div>
          </div>
        </div>

        {pecas.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>Peças Utilizadas</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Item / Peça</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>Qtd</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>V. Unit.</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pecas.map((p: any, i: number) => (
                  <tr key={i}>
                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{p.nome}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>{p.quantidade}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>R$ {p.valor_unitario.toFixed(2)}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>R$ {(p.quantidade * p.valor_unitario).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {servicos.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>Mão de Obra / Serviços</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Descrição do Serviço</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>Valor Cobrado</th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((s: any, i: number) => (
                  <tr key={i}>
                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{s.descricao}</td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>R$ {s.valor.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
          <div style={{ width: '300px', border: '2px solid #222', borderRadius: '4px', padding: '16px', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span>Subtotal Peças:</span>
              <span>R$ {os.valor_pecas.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
              <span>Subtotal Serviços:</span>
              <span>R$ {os.valor_maodeobra.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ccc', paddingTop: '8px', fontWeight: 'bold', fontSize: '18px' }}>
              <span>TOTAL FINAL:</span>
              <span>R$ {os.valor_final.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#555' }}>
              <span>Status atual:</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{os.status}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '14px' }}>
          <div style={{ width: '300px', borderTop: '1px solid #000', margin: '0 auto', paddingTop: '8px' }}>
            Assinatura do Cliente
          </div>
          <p style={{ marginTop: '24px', fontSize: '12px', color: '#666' }}>Garantia de 90 dias sobre os serviços prestados conforme CDC. Peças seguem garantia do fabricante.</p>
        </div>

      </div>
    </div>
  );
}
