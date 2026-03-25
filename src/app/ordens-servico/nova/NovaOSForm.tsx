'use client';

import { useState } from 'react';
import { createOrdem } from '../actions';
import { addClienteDirect } from '@/app/clientes/actions';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, CheckCircle, UserCircle, UserPlus, X } from 'lucide-react';

export default function NovaOSForm({ clientes, estoque }: { clientes: any[], estoque: any[] }) {
  const router = useRouter();
  
  const [localClientes, setLocalClientes] = useState(clientes);
  const [clienteId, setClienteId] = useState('');
  
  // Tab control: 'existing' or 'new'
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  
  // New Client fields
  const [newClienteNome, setNewClienteNome] = useState('');
  const [newClienteTelefone, setNewClienteTelefone] = useState('');
  const [newClientePlaca, setNewClientePlaca] = useState('');
  const [newClienteModelo, setNewClienteModelo] = useState('');
  
  const [pecasUsadas, setPecasUsadas] = useState<{ id: number; nome: string; quantidade: number; valor_venda: number; max: number }[]>([]);
  const [servicos, setServicos] = useState<{ descricao: string; valor: number }[]>([]);
  
  const [pecaSelecionada, setPecaSelecionada] = useState('');
  const [qtdPecaSelecionada, setQtdPecaSelecionada] = useState(1);
  
  const [descServico, setDescServico] = useState('');
  const [valorServico, setValorServico] = useState(0);

  const [lancarCaixa, setLancarCaixa] = useState(false);
  const [loading, setLoading] = useState(false);

  // Totals
  const valorPecas = pecasUsadas.reduce((acc, p) => acc + (p.quantidade * p.valor_venda), 0);
  const valorMaoDeObra = servicos.reduce((acc, s) => acc + s.valor, 0);
  const valorTotal = valorPecas + valorMaoDeObra;

  const handleAddPeca = () => {
    if (!pecaSelecionada) return;
    const pecaDb = estoque.find(e => e.id.toString() === pecaSelecionada);
    if (!pecaDb || qtdPecaSelecionada <= 0 || qtdPecaSelecionada > pecaDb.quantidade) {
      alert("Quantidade inválida ou maior que o estoque disponível.");
      return;
    }
    
    // Check if already added
    const exists = pecasUsadas.find(p => p.id === pecaDb.id);
    if (exists) {
      if (exists.quantidade + qtdPecaSelecionada > pecaDb.quantidade) {
        alert("A soma da quantidade já adicionada excede o estoque disponível.");
        return;
      }
      setPecasUsadas(pecasUsadas.map(p => p.id === pecaDb.id ? { ...p, quantidade: p.quantidade + qtdPecaSelecionada } : p));
    } else {
      setPecasUsadas([...pecasUsadas, { 
        id: pecaDb.id, 
        nome: pecaDb.nome, 
        quantidade: qtdPecaSelecionada, 
        valor_venda: pecaDb.valor_venda,
        max: pecaDb.quantidade
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
      let finalClienteId = clienteId;

      // Se estiver criando novo cliente, cria ele primeiro
      if (clientMode === 'new') {
        if (!newClienteNome) {
          alert('O nome do cliente é obrigatório!');
          setLoading(false);
          return;
        }
        const newCliente = await addClienteDirect(newClienteNome, newClienteTelefone, newClientePlaca, newClienteModelo);
        if (newCliente && newCliente.id !== undefined) {
          finalClienteId = newCliente.id.toString();
        } else {
          throw new Error('Erro ao criar cliente');
        }
      }

      if (!finalClienteId) {
        alert('Selecione um cliente ou preencha os dados do novo cliente!');
        setLoading(false);
        return;
      }

      if (pecasUsadas.length === 0 && servicos.length === 0) {
        alert('Adicione pelo menos uma peça ou serviço.');
        setLoading(false);
        return;
      }
      
      const result = await createOrdem({
        cliente_id: parseInt(finalClienteId),
        pecas: pecasUsadas,
        servicos,
        lancarCaixa
      });

      if (result.success) {
        router.push('/ordens-servico');
      } else {
        alert(result.error || 'Erro ao processar solicitação.');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao processar solicitação. Verifique os dados.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: '32px', alignItems: 'start' }}>
      
      {/* Formulário Principal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Custom Tabs Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
            <button 
              onClick={() => setClientMode('existing')}
              style={{ 
                flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                border: 'none', background: clientMode === 'existing' ? 'var(--surface)' : 'transparent',
                color: clientMode === 'existing' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600, borderBottom: clientMode === 'existing' ? '2px solid var(--primary)' : 'none'
              }}
            >
              <UserCircle size={18} /> Selecionar Existente
            </button>
            <button 
              onClick={() => setClientMode('new')}
              style={{ 
                flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                border: 'none', background: clientMode === 'new' ? 'var(--surface)' : 'transparent',
                color: clientMode === 'new' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600, borderBottom: clientMode === 'new' ? '2px solid var(--primary)' : 'none'
              }}
            >
              <UserPlus size={18} /> Cadastrar Novo Cliente
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {clientMode === 'existing' ? (
              <div>
                <label className="label">Escolher Cliente da Lista</label>
                <select className="select" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                  <option value="">-- Clique para buscar um cliente --</option>
                  {localClientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} - {c.placa || 'Sem Placa'} ({c.modelo || 'Sem Veículo'})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Nome Completo *</label>
                    <input type="text" className="input" value={newClienteNome} onChange={e => setNewClienteNome(e.target.value)} placeholder="Ex: José Ferreira" />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Telefone</label>
                    <input type="text" className="input" value={newClienteTelefone} onChange={e => setNewClienteTelefone(e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Placa do Veículo</label>
                    <input type="text" className="input" value={newClientePlaca} onChange={e => setNewClientePlaca(e.target.value)} placeholder="ABC-1234" />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Modelo / Ano</label>
                    <input type="text" className="input" value={newClienteModelo} onChange={e => setNewClienteModelo(e.target.value)} placeholder="Hilux 2022 Branca" />
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '4px', fontWeight: 500 }}>
                  ✓ O cliente será salvo automaticamente junto com a OS.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>2. Peças e Produtos</h2>
          <div className="flex-row" style={{ alignItems: 'flex-end', marginBottom: '16px', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                Selecionar Peça do Estoque
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(Total no sistema: {estoque.length})</span>
              </label>
              <select className="select" value={pecaSelecionada} onChange={e => setPecaSelecionada(e.target.value)}>
                <option value="">-- Estoque --</option>
                {estoque.map(e => (
                  <option key={e.id} value={e.id} disabled={e.quantidade === 0}>
                    {e.nome} (Qtd: {e.quantidade}) - R$ {e.valor_venda.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ width: '100px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qtd Usada</label>
              <input type="number" min="1" className="input" value={qtdPecaSelecionada} onChange={e => setQtdPecaSelecionada(parseInt(e.target.value) || 0)} />
            </div>
            <button type="button" onClick={handleAddPeca} className="btn btn-primary" style={{ height: '44px' }}>
              <Plus size={18}/>
            </button>
          </div>

          {pecasUsadas.length > 0 && (
            <table className="table" style={{ marginTop: '16px' }}>
              <thead>
                <tr>
                  <th>Peça</th>
                  <th>Qtd</th>
                  <th>V. Unit.</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pecasUsadas.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.nome}</td>
                    <td>{p.quantidade}</td>
                    <td>R$ {p.valor_venda.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>R$ {(p.quantidade * p.valor_venda).toFixed(2)}</td>
                    <td>
                      <button onClick={() => setPecasUsadas(pecasUsadas.filter((_, i) => i !== idx))} className="btn btn-outline" style={{ padding: '4px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>3. Serviços / Mão de Obra</h2>
          <div className="flex-row" style={{ alignItems: 'flex-end', marginBottom: '16px', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mão de Obra (Descrição)</label>
              <input type="text" className="input" placeholder="Ex: Substituição das Pastilhas" value={descServico} onChange={e => setDescServico(e.target.value)} />
            </div>
            <div style={{ width: '150px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Valor Custo (R$)</label>
              <input type="number" step="0.01" min="0" className="input" placeholder="0.00" value={valorServico || ''} onChange={e => setValorServico(parseFloat(e.target.value) || 0)} />
            </div>
            <button type="button" onClick={handleAddServico} className="btn btn-primary" style={{ height: '44px' }}>
              <Plus size={18}/>
            </button>
          </div>

          {servicos.length > 0 && (
            <table className="table" style={{ marginTop: '16px' }}>
              <thead>
                <tr>
                  <th>Serviço Prestado</th>
                  <th>Valor Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {servicos.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.descricao}</td>
                    <td style={{ fontWeight: 600 }}>R$ {s.valor.toFixed(2)}</td>
                    <td>
                      <button onClick={() => setServicos(servicos.filter((_, i) => i !== idx))} className="btn btn-outline" style={{ padding: '4px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Summary / Submit Column */}
      <div className="card" style={{ position: 'sticky', top: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Resumo Geral</h2>
        <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />
        
        <div className="flex-between" style={{ marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Subtotal Peças:</span>
          <span style={{ fontWeight: '500' }}>R$ {valorPecas.toFixed(2)}</span>
        </div>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Subtotal Mão de Obra:</span>
          <span style={{ fontWeight: '500' }}>R$ {valorMaoDeObra.toFixed(2)}</span>
        </div>
        
        <div className="flex-between" style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontWeight: '700', fontSize: '1.4rem' }}>
          <span>Total OS:</span>
          <span>R$ {valorTotal.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '12px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
          <input 
            type="checkbox" 
            id="caixaCheck" 
            checked={lancarCaixa} 
            onChange={e => setLancarCaixa(e.target.checked)} 
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="caixaCheck" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-main)', userSelect: 'none' }}>
            Pagamento Recebido (Concluir e lançar entrada no Caixa).
          </label>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading || (clientMode === 'existing' && !clienteId) || (clientMode === 'new' && !newClienteNome) || (pecasUsadas.length === 0 && servicos.length === 0)}
          className="btn btn-success" 
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem', letterSpacing: '0.5px' }}
        >
          <CheckCircle size={22} />
          {loading ? 'Processando...' : 'Gerar Ordem de Serviço'}
        </button>
      </div>

    </div>
  );
}
