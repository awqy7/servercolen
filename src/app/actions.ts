'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getDashboardStats() {
  const supabase = await createClient();

  // 1. OS em Andamento
  const { count: osAtivas } = await supabase
    .from('ordens_servico')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Em Andamento');

  // 2. OS Concluídas no mês
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const { count: osConcluidasMes } = await supabase
    .from('ordens_servico')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Concluído')
    .gte('created_at', firstDayOfMonth.toISOString());

  // 3. Faturamento Mensal
  const { data: ordensConcluidas } = await supabase
    .from('ordens_servico')
    .select('valor_final')
    .eq('status', 'Concluído')
    .gte('created_at', firstDayOfMonth.toISOString());

  const faturamento = ordensConcluidas?.reduce((acc, os) => acc + (os.valor_final || 0), 0) || 0;

  // 4. Entradas e Saídas do mês (Caixa)
  const { data: caixaMes } = await supabase
    .from('caixa')
    .select('tipo, valor')
    .gte('data', firstDayOfMonth.toISOString());

  const entradasMes = caixaMes?.filter(c => c.tipo === 'Entrada').reduce((acc, c) => acc + c.valor, 0) || 0;
  const saidasMes = caixaMes?.filter(c => c.tipo !== 'Entrada').reduce((acc, c) => acc + c.valor, 0) || 0;

  // 5. Saldo Total em Caixa
  const { data: caixaItems } = await supabase
    .from('caixa')
    .select('tipo, valor');

  const saldoCaixa = caixaItems?.reduce((acc, item) => {
    return item.tipo === 'Entrada' ? acc + item.valor : acc - item.valor;
  }, 0) || 0;

  // 6. Alertas de estoque
  const { data: alertasEstoque } = await supabase
    .from('estoque')
    .select('*')
    .lt('quantidade', 5);

  // 7. Total de Clientes
  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  // 8. Últimas 5 OS
  const { data: ultimasOS } = await supabase
    .from('ordens_servico')
    .select(`
      id, created_at, status, valor_final,
      clientes (nome, placa)
    `)
    .order('id', { ascending: false })
    .limit(5);

  const ultimasAtividades = (ultimasOS || []).map((os: any) => ({
    id: os.id,
    data: os.created_at,
    status: os.status,
    valor: os.valor_final,
    cliente: os.clientes?.nome,
    placa: os.clientes?.placa
  }));

  // 9. Faturamento últimos 6 meses
  const meses: { label: string; valor: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);

    const dEnd = new Date(d);
    dEnd.setMonth(dEnd.getMonth() + 1);

    const { data: mesData } = await supabase
      .from('ordens_servico')
      .select('valor_final')
      .eq('status', 'Concluído')
      .gte('created_at', d.toISOString())
      .lt('created_at', dEnd.toISOString());

    const total = mesData?.reduce((acc, os) => acc + (os.valor_final || 0), 0) || 0;

    meses.push({
      label: d.toLocaleDateString('pt-BR', { month: 'short' }),
      valor: total
    });
  }

  return {
    osAtivas: osAtivas || 0,
    osConcluidasMes: osConcluidasMes || 0,
    faturamento,
    saldoCaixa,
    entradasMes,
    saidasMes,
    alertasEstoque: alertasEstoque || [],
    totalClientes: totalClientes || 0,
    ultimasAtividades,
    faturamentoMensal: meses
  };
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
