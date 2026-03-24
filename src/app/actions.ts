'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getDashboardStats() {
  const supabase = await createClient();
  
  // 1. OS em Andamento
  const { count: osAtivas } = await supabase
    .from('OrdensServico')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Em Andamento');

  // 2. Faturamento Mensal (Concluídas no mês atual)
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const { data: ordensConcluidas } = await supabase
    .from('OrdensServico')
    .select('valor_final')
    .eq('status', 'Concluído')
    .gte('data_entrada', firstDayOfMonth.toISOString());

  const faturamento = ordensConcluidas?.reduce((acc, os) => acc + (os.valor_final || 0), 0) || 0;
  
  // 3. Alertas de estoque
  const { data: alertasEstoque } = await supabase
    .from('Estoque')
    .select('*')
    .lt('quantidade', 5);

  // 4. Saldo em Caixa
  const { data: caixaItems } = await supabase
    .from('Caixa')
    .select('tipo, valor');

  const saldoCaixa = caixaItems?.reduce((acc, item) => {
    return item.tipo === 'Entrada' ? acc + item.valor : acc - item.valor;
  }, 0) || 0;

  return {
    osAtivas: osAtivas || 0,
    faturamento,
    alertasEstoque: alertasEstoque || [],
    saldoCaixa
  };
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
