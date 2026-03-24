'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getEstoque() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('Estoque')
    .select('*')
    .order('nome', { ascending: true });
  return data || [];
}

export async function addPeca(formData: FormData) {
  const nome = formData.get('nome') as string;
  const quantidade = parseInt(formData.get('quantidade') as string);
  const valor_custo = parseFloat(formData.get('valor_custo') as string);
  const valor_venda = parseFloat(formData.get('valor_venda') as string);

  if (!nome || isNaN(quantidade) || isNaN(valor_custo) || isNaN(valor_venda)) return;

  const supabase = await createClient();
  await supabase
    .from('Estoque')
    .insert([{ nome, quantidade, valor_custo, valor_venda }]);

  revalidatePath('/estoque');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/'); // update dashboard alerts
}

export async function deletePeca(id: number) {
  const supabase = await createClient();
  await supabase
    .from('Estoque')
    .delete()
    .eq('id', id);
    
  revalidatePath('/estoque');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/');
}

export async function addQuantidade(id: number, atual: number, adicionar: number) {
  const supabase = await createClient();
  await supabase
    .from('Estoque')
    .update({ quantidade: atual + adicionar })
    .eq('id', id);
    
  revalidatePath('/estoque');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/');
}
