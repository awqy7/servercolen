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
  try {
    const tipo = formData.get('tipo') as string;
    const valor = parseFloat(formData.get('valor') as string);
    const descricao = formData.get('descricao') as string;

    if (!tipo || isNaN(valor) || !descricao) {
      return { success: false, error: 'Dados inválidos. Preencha todos os campos.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('Caixa')
      .insert([{ tipo, valor, descricao }]);

    if (error) {
      console.error('Erro ao adicionar transação:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/caixa');
    revalidatePath('/'); // update dashboard
    return { success: true };
  } catch (error: any) {
    console.error('Exception in addTransacao:', error);
    return { success: false, error: 'Erro interno ao processar a solicitação.' };
  }
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
