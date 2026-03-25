'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getOrdens() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('OrdensServico')
    .select(`
      *,
      Clientes (id, nome, placa),
      OS_Itens (*, Estoque (nome)),
      OS_MaoDeObra (*)
    `)
    .order('id', { ascending: false });

  if (error) return [];

  // Map to match the previous structure if needed
  return data.map((os: any) => ({
    ...os,
    cliente_nome: os.Clientes?.nome,
    cliente_placa: os.Clientes?.placa,
    pecas: os.OS_Itens?.map((item: any) => ({
      ...item,
      nome: item.Estoque?.nome
    })),
    servicos: os.OS_MaoDeObra
  }));
}

export async function getOrdemCompleta(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('OrdensServico')
    .select(`
      *,
      Clientes (*),
      OS_Itens (*, Estoque (nome)),
      OS_MaoDeObra (*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    os: {
      ...data,
      cliente_nome: data.Clientes?.nome,
      cliente_telefone: data.Clientes?.telefone,
      cliente_placa: data.Clientes?.placa,
      cliente_modelo: data.Clientes?.modelo
    },
    pecas: data.OS_Itens?.map((item: any) => ({
      ...item,
      nome: item.Estoque?.nome
    })),
    servicos: data.OS_MaoDeObra
  };
}

export async function createOrdem(data: {
  cliente_id: number;
  pecas: { id: number; nome: string; quantidade: number; valor_venda: number }[];
  servicos: { descricao: string; valor: number }[];
  lancarCaixa: boolean;
}) {
  const supabase = await createClient();
  
  const valor_pecas = data.pecas.reduce((acc, p) => acc + (p.quantidade * p.valor_venda), 0);
  const valor_maodeobra = data.servicos.reduce((acc, s) => acc + s.valor, 0);
  const valor_final = valor_pecas + valor_maodeobra;
  const status = data.lancarCaixa ? 'Concluído' : 'Em Andamento';

  // 1. Inserir OS
  const { data: os, error: osError } = await supabase
    .from('OrdensServico')
    .insert([{
      cliente_id: data.cliente_id,
      status,
      valor_pecas,
      valor_maodeobra,
      valor_final
    }])
    .select()
    .single();

  if (osError) throw osError;

  const osId = os.id;

  // 2. Inserir Itens e atualizar estoque
  const itemsToInsert = data.pecas
    .filter(p => p.quantidade > 0)
    .map(p => ({
      os_id: osId,
      estoque_id: p.id,
      quantidade: p.quantidade,
      valor_unitario: p.valor_venda
    }));

  if (itemsToInsert.length > 0) {
    const { error: itemsError } = await supabase.from('OS_Itens').insert(itemsToInsert);
    if (itemsError) throw itemsError;
    
    // Atualizar estoque (um por um pois Supabase não tem decrement/increment em massa fácil sem RPC)
    for (const p of data.pecas) {
      if (p.quantidade <= 0) continue;
      
      // Get current quantity
      const { data: currentStock, error: stockError } = await supabase
        .from('Estoque')
        .select('quantidade')
        .eq('id', p.id)
        .single();
        
      if (stockError) throw stockError;
        
      const newQty = Math.max(0, (currentStock?.quantidade || 0) - p.quantidade);
      
      const { error: updateError } = await supabase
        .from('Estoque')
        .update({ quantidade: newQty })
        .eq('id', p.id);

      if (updateError) throw updateError;
    }
  }

  // 3. Inserir Mão de Obra
  const servicosToInsert = data.servicos
    .filter(s => s.descricao && s.valor > 0)
    .map(s => ({
      os_id: osId,
      descricao: s.descricao,
      valor: s.valor
    }));

  if (servicosToInsert.length > 0) {
    const { error: svcError } = await supabase.from('OS_MaoDeObra').insert(servicosToInsert);
    if (svcError) throw svcError;
  }

  // 4. Lançar no Caixa
  if (data.lancarCaixa) {
    const { error: caixaError } = await supabase.from('Caixa').insert([{
      tipo: 'Entrada',
      valor: valor_final,
      descricao: `Recebimento Ref. OS #${osId}`,
      os_id: osId
    }]);
    if (caixaError) throw caixaError;
  }

  revalidatePath('/ordens-servico');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/estoque');
  revalidatePath('/caixa');
  revalidatePath('/');
  
  return osId;
}

export async function deleteOrdem(id: number) {
  const supabase = await createClient();
  await supabase.from('OrdensServico').delete().eq('id', id);
  
  revalidatePath('/ordens-servico');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/');
}

export async function concluirOrdem(id: number) {
  const supabase = await createClient();
  
  // 1. Get OS info
  const { data: os } = await supabase
    .from('OrdensServico')
    .select('valor_final')
    .eq('id', id)
    .single();

  if (!os) return;

  // 2. Check if already in Caixa
  const { data: exists } = await supabase
    .from('Caixa')
    .select('id')
    .eq('os_id', id)
    .maybeSingle();
  
  if (!exists) {
    const { error: caixaError } = await supabase.from('Caixa').insert([{
      tipo: 'Entrada',
      valor: os.valor_final,
      descricao: `Recebimento Ref. OS #${id}`,
      os_id: id
    }]);
    if (caixaError) throw caixaError;
  }

  // 3. Update status
  const { error: statusError } = await supabase
    .from('OrdensServico')
    .update({ status: 'Concluído' })
    .eq('id', id);
  
  if (statusError) throw statusError;
  
  revalidatePath('/ordens-servico');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/caixa');
  revalidatePath('/');
}

export async function updateOrdem(id: number, data: {
  cliente_id: number;
  pecas: { id: number; nome: string; quantidade: number; valor_venda: number }[];
  servicos: { descricao: string; valor: number }[];
}) {
  const supabase = await createClient();

  // 1. Estornar estoque atual
  const { data: itensAntigos } = await supabase
    .from('OS_Itens')
    .select('estoque_id, quantidade')
    .eq('os_id', id);

  if (itensAntigos) {
    for (const item of itensAntigos) {
      const { data: stock } = await supabase.from('Estoque').select('quantidade').eq('id', item.estoque_id).single();
      await supabase.from('Estoque').update({ quantidade: (stock?.quantidade || 0) + item.quantidade }).eq('id', item.estoque_id);
    }
  }

  // 2. Deletar itens e serviços antigos
  await supabase.from('OS_Itens').delete().eq('os_id', id);
  await supabase.from('OS_MaoDeObra').delete().eq('os_id', id);

  // 3. Recalcular e Atualizar OS
  const valor_pecas = data.pecas.reduce((acc, p) => acc + (p.quantidade * p.valor_venda), 0);
  const valor_maodeobra = data.servicos.reduce((acc, s) => acc + s.valor, 0);
  const valor_final = valor_pecas + valor_maodeobra;

  await supabase
    .from('OrdensServico')
    .update({
      cliente_id: data.cliente_id,
      valor_pecas,
      valor_maodeobra,
      valor_final
    })
    .eq('id', id);

  // 4. Inserir novos e atualizar estoque
  if (data.pecas.length > 0) {
    for (const p of data.pecas) {
      if (p.quantidade <= 0) continue;
      const { error: itemError } = await supabase.from('OS_Itens').insert([{ os_id: id, estoque_id: p.id, quantidade: p.quantidade, valor_unitario: p.valor_venda }]);
      if (itemError) throw itemError;
      
      const { data: stock, error: stockError } = await supabase.from('Estoque').select('quantidade').eq('id', p.id).single();
      if (stockError) throw stockError;
      
      const { error: updateError } = await supabase.from('Estoque').update({ quantidade: Math.max(0, (stock?.quantidade || 0) - p.quantidade) }).eq('id', p.id);
      if (updateError) throw updateError;
    }
  }

  if (data.servicos.length > 0) {
    const servicosToInsert = data.servicos
      .filter(s => s.descricao && s.valor > 0)
      .map(s => ({ os_id: id, descricao: s.descricao, valor: s.valor }));
    if (servicosToInsert.length > 0) {
      const { error: svcError } = await supabase.from('OS_MaoDeObra').insert(servicosToInsert);
      if (svcError) throw svcError;
    }
  }

  revalidatePath('/ordens-servico');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/estoque');
  revalidatePath('/');
}
