'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getEstoque() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('estoque')
    .select('*')
    .order('nome', { ascending: true });
  return data || [];
}

export async function addPeca(formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const quantidade = parseInt(formData.get('quantidade') as string);
    const valor_custo = parseFloat(formData.get('valor_custo') as string);
    const valor_venda = parseFloat(formData.get('valor_venda') as string);

    if (!nome || isNaN(quantidade) || isNaN(valor_custo) || isNaN(valor_venda)) {
      return { success: false, error: 'Dados inválidos. Verifique os campos.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('estoque')
      .insert([{ nome, quantidade, valor_custo, valor_venda }]);

    if (error) {
      console.error('Erro ao adicionar peça:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/estoque');
    revalidatePath('/ordens-servico/nova');
    revalidatePath('/'); // update dashboard alerts
    return { success: true };
  } catch (error: any) {
    console.error('Exception in addPeca:', error);
    return { success: false, error: 'Erro interno ao processar a solicitação.' };
  }
}

export async function deletePeca(id: number) {
  const supabase = await createClient();
  await supabase
    .from('estoque')
    .delete()
    .eq('id', id);
    
  revalidatePath('/estoque');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/');
}

export async function addQuantidade(id: number, atual: number, adicionar: number) {
  const supabase = await createClient();
  await supabase
    .from('estoque')
    .update({ quantidade: atual + adicionar })
    .eq('id', id);
    
  revalidatePath('/estoque');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/');
}
export async function addPecaDirect(nome: string, quantidade: number, valor_custo: number, valor_venda: number) {
  if (!nome || isNaN(quantidade) || isNaN(valor_custo) || isNaN(valor_venda)) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('estoque')
      .insert([{ nome, quantidade, valor_custo, valor_venda }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar peça direta:', error);
      return null;
    }

    revalidatePath('/estoque');
    revalidatePath('/ordens-servico/nova');
    revalidatePath('/');

    return data;
  } catch (e) {
    console.error('Exception in addPecaDirect:', e);
    return null;
  }
}
