'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCaixaTransacoes() {
  const supabase = await createClient();
  const { data: transacoes } = await supabase
    .from('Caixa')
    .select('*')
    .order('data', { ascending: false })
    .limit(100);
  return transacoes || [];
}

export async function addTransacao(formData: FormData) {
  const tipo = formData.get('tipo') as string;
  const valor = parseFloat(formData.get('valor') as string);
  const descricao = formData.get('descricao') as string;

  if (!tipo || isNaN(valor) || !descricao) return;

  const supabase = await createClient();
  await supabase
    .from('Caixa')
    .insert([{ tipo, valor, descricao }]);

  revalidatePath('/caixa');
  revalidatePath('/'); // update dashboard
}

export async function deleteTransacao(id: number) {
  const supabase = await createClient();
  await supabase
    .from('Caixa')
    .delete()
    .eq('id', id);
    
  revalidatePath('/caixa');
  revalidatePath('/');
}
