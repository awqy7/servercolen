'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getOrdens() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ordens_servico')
    .select(`
      *,
      clientes (id, nome, placa),
      os_itens (*, estoque (nome)),
      os_maodeobra (*)
    `)
    .order('id', { ascending: false });

  if (error) return [];

  // Map to match the previous structure if needed
  return data.map((os: any) => ({
    ...os,
    cliente_nome: os.clientes?.nome,
    cliente_placa: os.clientes?.placa,
    pecas: os.os_itens?.map((item: any) => ({
      ...item,
      nome: item.estoque?.nome
    })),
    servicos: os.os_maodeobra
  }));
}

export async function getOrdemCompleta(id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('ordens_servico')
    .select(`
      *,
      clientes (*),
      os_itens (*, estoque (nome)),
      os_maodeobra (*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    os: {
      ...data,
      cliente_nome: data.clientes?.nome,
      cliente_telefone: data.clientes?.telefone,
      cliente_placa: data.clientes?.placa,
      cliente_modelo: data.clientes?.modelo
    },
    pecas: data.os_itens?.map((item: any) => ({
      ...item,
      nome: item.estoque?.nome
    })),
    servicos: data.os_maodeobra
  };
}

export async function createOrdem(data: {
  cliente_id: number;
  pecas: { id: number; nome: string; quantidade: number; valor_venda: number }[];
  servicos: { descricao: string; valor: number }[];
  lancarCaixa: boolean;
}) {
  try {
    const supabase = await createClient();
    
    const valor_pecas = data.pecas.reduce((acc, p) => acc + (p.quantidade * p.valor_venda), 0);
    const valor_maodeobra = data.servicos.reduce((acc, s) => acc + s.valor, 0);
    const valor_final = valor_pecas + valor_maodeobra;
    const status = data.lancarCaixa ? 'Concluído' : 'Em Andamento';

    // 1. Inserir OS
    const { data: os, error: osError } = await supabase
      .from('ordens_servico')
      .insert([{
        cliente_id: data.cliente_id,
        status,
        valor_pecas,
        valor_maodeobra,
        valor_final
      }])
      .select()
      .single();

    if (osError) return { success: false, error: `Erro ao criar OS: ${osError.message}` };

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
      const { error: itemsError } = await supabase.from('os_itens').insert(itemsToInsert);
      if (itemsError) return { success: false, error: `Erro ao inserir peças: ${itemsError.message}` };
      
      // Atualizar estoque
      for (const p of data.pecas) {
        if (p.quantidade <= 0) continue;
        
        const { data: currentStock, error: stockError } = await supabase
          .from('estoque')
          .select('quantidade')
          .eq('id', p.id)
          .single();
          
        if (stockError) return { success: false, error: `Erro ao consultar estoque (Item ID ${p.id}): ${stockError.message}` };
          
        const newQty = Math.max(0, (currentStock?.quantidade || 0) - p.quantidade);
        
        const { error: updateError } = await supabase
          .from('estoque')
          .update({ quantidade: newQty })
          .eq('id', p.id);

        if (updateError) return { success: false, error: `Erro ao atualizar quantidade (Item ID ${p.id}): ${updateError.message}` };
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
      const { error: svcError } = await supabase.from('os_maodeobra').insert(servicosToInsert);
      if (svcError) return { success: false, error: `Erro ao inserir serviços: ${svcError.message}` };
    }

    // 4. Lançar no Caixa
    if (data.lancarCaixa) {
      const { error: caixaError } = await supabase.from('caixa').insert([{
        tipo: 'Entrada',
        valor: valor_final,
        descricao: `Recebimento Ref. OS #${osId}`,
        os_id: osId
      }]);
      if (caixaError) return { success: false, error: `Erro ao lançar no caixa: ${caixaError.message}` };
    }

    revalidatePath('/ordens-servico');
    revalidatePath('/ordens-servico/nova');
    revalidatePath('/estoque');
    revalidatePath('/caixa');
    revalidatePath('/');
    
    return { success: true, id: osId };
  } catch (err: any) {
    console.error('Exception in createOrdem:', err);
    return { success: false, error: `Erro interno: ${err.message}` };
  }
}

export async function deleteOrdem(id: number) {
  const supabase = await createClient();
  await supabase.from('ordens_servico').delete().eq('id', id);
  
  revalidatePath('/ordens-servico');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/');
}

export async function concluirOrdem(id: number) {
  const supabase = await createClient();
  
  // 1. Get OS info
  const { data: os } = await supabase
    .from('ordens_servico')
    .select('valor_final')
    .eq('id', id)
    .single();

  if (!os) return;

  // 2. Check if already in Caixa
  const { data: exists } = await supabase
    .from('caixa')
    .select('id')
    .eq('os_id', id)
    .maybeSingle();
  
  if (!exists) {
    const { error: caixaError } = await supabase.from('caixa').insert([{
      tipo: 'Entrada',
      valor: os.valor_final,
      descricao: `Recebimento Ref. OS #${id}`,
      os_id: id
    }]);
    if (caixaError) throw caixaError;
  }

  // 3. Update status
  const { error: statusError } = await supabase
    .from('ordens_servico')
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
    .from('os_itens')
    .select('estoque_id, quantidade')
    .eq('os_id', id);

  if (itensAntigos) {
    for (const item of itensAntigos) {
      const { data: stock } = await supabase.from('estoque').select('quantidade').eq('id', item.estoque_id).single();
      await supabase.from('estoque').update({ quantidade: (stock?.quantidade || 0) + item.quantidade }).eq('id', item.estoque_id);
    }
  }

  // 2. Deletar itens e serviços antigos
  await supabase.from('os_itens').delete().eq('os_id', id);
  await supabase.from('os_maodeobra').delete().eq('os_id', id);

  // 3. Recalcular e Atualizar OS
  const valor_pecas = data.pecas.reduce((acc, p) => acc + (p.quantidade * p.valor_venda), 0);
  const valor_maodeobra = data.servicos.reduce((acc, s) => acc + s.valor, 0);
  const valor_final = valor_pecas + valor_maodeobra;

  await supabase
    .from('ordens_servico')
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
      const { error: itemError } = await supabase.from('os_itens').insert([{ os_id: id, estoque_id: p.id, quantidade: p.quantidade, valor_unitario: p.valor_venda }]);
      if (itemError) throw itemError;
      
      const { data: stock, error: stockError } = await supabase.from('estoque').select('quantidade').eq('id', p.id).single();
      if (stockError) throw stockError;
      
      const { error: updateError } = await supabase.from('estoque').update({ quantidade: Math.max(0, (stock?.quantidade || 0) - p.quantidade) }).eq('id', p.id);
      if (updateError) throw updateError;
    }
  }

  if (data.servicos.length > 0) {
    const servicosToInsert = data.servicos
      .filter(s => s.descricao && s.valor > 0)
      .map(s => ({ os_id: id, descricao: s.descricao, valor: s.valor }));
    if (servicosToInsert.length > 0) {
      const { error: svcError } = await supabase.from('os_maodeobra').insert(servicosToInsert);
      if (svcError) throw svcError;
    }
  }

  revalidatePath('/ordens-servico');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/estoque');
  revalidatePath('/');
}
