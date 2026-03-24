'use client';

import { useState } from 'react';
import { updateOrdem } from '../../actions';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CheckCircle, ArrowLeft, Package, Wrench } from 'lucide-react';

export default function EditarOSForm({ 
  os, 
  pecas, 
  servicos: servicosIniciais, 
  clientes, 
  estoque 
}: { 
  os: any, 
  pecas: any[], 
  servicos: any[], 
  clientes: any[], 
  estoque: any[] 
}) {
  const router = useRouter();
  
  const [clienteId, setClienteId] = useState(os.cliente_id.toString());
  
  // No caso da edição, o estoque real disponível é o estoque atual do banco + o que já está reservado nesta OS
  const getPecaEstoqueTotal = (pecaId: number) => {
    const itemNoEstoque = estoque.find(e => e.id === pecaId);
    const itemNaOS = pecas.find(p => p.estoque_id === pecaId);
    return (itemNoEstoque?.quantidade || 0) + (itemNaOS?.quantidade || 0);
  };

  const [pecasUsadas, setPecasUsadas] = useState<{ id: number; nome: string; quantidade: number; valor_venda: number }[]>(
    pecas.map(p => ({
      id: p.estoque_id,
      nome: p.nome,
      quantidade: p.quantidade,
      valor_venda: p.valor_unitario
    }))
  );
  
  const [servicos, setServicos] = useState<{ descricao: string; valor: number }[]>(
    servicosIniciais.map(s => ({
      descricao: s.descricao,
      valor: s.valor
    }))
  );
  
  const [pecaSelecionada, setPecaSelecionada] = useState('');
  const [qtdPecaSelecionada, setQtdPecaSelecionada] = useState(1);
  const [descServico, setDescServico] = useState('');
  const [valorServico, setValorServico] = useState(0);

  const [loading, setLoading] = useState(false);

  const valorPecasTotal = pecasUsadas.reduce((acc, p) => acc + (p.quantidade * p.valor_venda), 0);
  const valorMaoDeObraTotal = servicos.reduce((acc, s) => acc + s.valor, 0);
  const valorTotal = valorPecasTotal + valorMaoDeObraTotal;

  const handleAddPeca = () => {
    if (!pecaSelecionada) return;
    const pecaDb = estoque.find(e => e.id.toString() === pecaSelecionada);
    if (!pecaDb) return;

    const totalDisponivel = getPecaEstoqueTotal(pecaDb.id);
    const jaAdicionado = pecasUsadas.find(p => p.id === pecaDb.id)?.quantidade || 0;

    if (jaAdicionado + qtdPecaSelecionada > totalDisponivel) {
      alert(`Quantidade insuficiente! Você só tem ${totalDisponivel} unidades no total para este item.`);
      return;
    }
    
    const exists = pecasUsadas.find(p => p.id === pecaDb.id);
    if (exists) {
      setPecasUsadas(pecasUsadas.map(p => p.id === pecaDb.id ? { ...p, quantidade: p.quantidade + qtdPecaSelecionada } : p));
    } else {
      setPecasUsadas([...pecasUsadas, { 
        id: pecaDb.id, 
        nome: pecaDb.nome, 
        quantidade: qtdPecaSelecionada, 
        valor_venda: pecaDb.valor_venda
      }]);
    }
    setQtdPecaSelecionada(1);
    setPecaSelecionada('');
  };

  const handleAddServico = () => {
    if (!descServico || valorServico <= 0) return;
    setServicos([...servicos, { descricao: descServico, valor: valorServico }]);
    setDescServico('');
    setValorServico(0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateOrdem(os.id, {
        cliente_id: parseInt(clienteId),
        pecas: pecasUsadas,
        servicos
      });
      router.push('/ordens-servico');
      setTimeout(() => router.refresh(), 500);
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar OS.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '32px', alignItems: 'start' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* CLIENTE */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Cliente da OS
          </h2>
          <select className="select" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome} - {c.placa || 'Sem Placa'}</option>
            ))}
          </select>
        </div>

        {/* PEÇAS */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--primary)"/> Peças e Produtos
          </h2>
          
          <div className="flex-row" style={{ alignItems: 'flex-end', marginBottom: '20px', gap: '8px', background: 'var(--surface-hover)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <label className="label">Adicionar Peça do Estoque</label>
              <select className="select" value={pecaSelecionada} onChange={e => setPecaSelecionada(e.target.value)}>
                <option value="">-- Selecione para adicionar --</option>
                {estoque.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nome} (Estoque: {e.quantidade})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: '80px' }}>
              <label className="label">Qtd</label>
              <input type="number" min="1" className="input" value={qtdPecaSelecionada} onChange={e => setQtdPecaSelecionada(parseInt(e.target.value) || 0)} />
            </div>
            <button type="button" onClick={handleAddPeca} className="btn btn-primary" style={{ height: '44px' }}>
              <Plus size={18}/>
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>V. Unit</th>
                <th>Subtotal</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {pecasUsadas.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.nome}</td>
                  <td><strong>{p.quantidade}</strong></td>
                  <td>R$ {p.valor_venda.toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>R$ {(p.quantidade * p.valor_venda).toFixed(2)}</td>
                  <td>
                    <button onClick={() => setPecasUsadas(pecasUsadas.filter((_, i) => i !== idx))} className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              {pecasUsadas.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Nenhuma peça adicionada.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* SERVIÇOS */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={20} color="var(--primary)"/> Mão de Obra e Serviços
          </h2>
          
          <div className="flex-row" style={{ alignItems: 'flex-end', marginBottom: '20px', gap: '8px', background: 'var(--surface-hover)', padding: '16px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <label className="label">Descrição do Serviço</label>
              <input type="text" className="input" placeholder="O que foi feito?" value={descServico} onChange={e => setDescServico(e.target.value)} />
            </div>
            <div style={{ width: '120px' }}>
              <label className="label">Preço (R$)</label>
              <input type="number" step="0.01" className="input" placeholder="0.00" value={valorServico || ''} onChange={e => setValorServico(parseFloat(e.target.value) || 0)} />
            </div>
            <button type="button" onClick={handleAddServico} className="btn btn-primary" style={{ height: '44px' }}>
              <Plus size={18}/>
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Descrição do Serviço</th>
                <th>Valor</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((s, idx) => (
                <tr key={idx}>
                  <td>{s.descricao}</td>
                  <td style={{ fontWeight: 600 }}>R$ {s.valor.toFixed(2)}</td>
                  <td>
                    <button onClick={() => setServicos(servicos.filter((_, i) => i !== idx))} className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              {servicos.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Nenhum serviço registrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY SIDEBAR */}
      <div style={{ position: 'sticky', top: '32px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Resumo</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Editando OS #{os.id.toString().padStart(5, '0')}</p>
          
          <div style={{ padding: '16px', background: 'var(--surface-hover)', borderRadius: '12px', marginBottom: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
              <span>Total em Peças:</span>
              <span>R$ {valorPecasTotal.toFixed(2)}</span>
            </div>
            <div className="flex-between" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
              <span>Total Serviços:</span>
              <span>R$ {valorMaoDeObraTotal.toFixed(2)}</span>
            </div>
            <div className="flex-between" style={{ paddingTop: '16px', borderTop: '1px solid var(--border)', fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.4rem' }}>
              <span>Valor Final:</span>
              <span>R$ {valorTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleSubmit} 
              disabled={loading || !clienteId || (pecasUsadas.length === 0 && servicos.length === 0)}
              className="btn btn-success" 
              style={{ padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}
            >
              <CheckCircle size={20} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button 
              onClick={() => router.push('/ordens-servico')}
              className="btn btn-outline" 
              style={{ padding: '12px', justifyContent: 'center' }}
            >
              <ArrowLeft size={18} /> Voltar sem salvar
            </button>
          </div>
        </div>
        
        <p style={{ marginTop: '16px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '8px', fontSize: '0.8rem', lineHeight: '1.4' }}>
          <strong>Nota:</strong> Ao salvar, o estoque será recalculado automaticamente com base nas novas peças adicionadas ou removidas.
        </p>
      </div>

    </div>
  );
}
