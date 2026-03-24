'use server'

import { createClient } from '@/utils/supabase/server';

export type Periodo = 'dia' | 'semana' | 'mes';

async function getRange(periodo: Periodo) {
  const now = new Date();
  const start = new Date(now);

  switch (periodo) {
    case 'dia':
      start.setHours(0, 0, 0, 0);
      break;
    case 'semana':
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;
    case 'mes':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
  }
  return start.toISOString();
}

export async function getRelatorio(periodo: Periodo) {
  const supabase = await createClient();
  const startDate = await getRange(periodo);

  // OS concluídas no período
  const { data: osConcluidas } = await supabase
    .from('OrdensServico')
    .select(`
      id,
      data_entrada,
      valor_final,
      valor_pecas,
      valor_maodeobra,
      status,
      Clientes (nome, placa, modelo)
    `)
    .eq('status', 'Concluído')
    .gte('data_entrada', startDate)
    .order('data_entrada', { ascending: false });

  const mappedOS = osConcluidas?.map((os: any) => ({
    ...os,
    cliente_nome: os.Clientes?.nome,
    placa: os.Clientes?.placa,
    modelo: os.Clientes?.modelo
  })) || [];

  const resumoOS = mappedOS.reduce((acc, os) => ({
    quantidade: acc.quantidade + 1,
    total: acc.total + (os.valor_final || 0),
    totalPecas: acc.totalPecas + (os.valor_pecas || 0),
    totalMaoDeObra: acc.totalMaoDeObra + (os.valor_maodeobra || 0)
  }), { quantidade: 0, total: 0, totalPecas: 0, totalMaoDeObra: 0 });

  // Transações do caixa no período
  const { data: transacoes } = await supabase
    .from('Caixa')
    .select('*')
    .gte('data', startDate)
    .order('data', { ascending: false });

  const resumoCaixa = (transacoes || []).reduce((acc, t) => {
    if (t.tipo === 'Entrada') acc.totalEntradas += t.valor;
    else acc.totalSaidas += t.valor;
    return acc;
  }, { totalEntradas: 0, totalSaidas: 0 });

  return {
    periodo,
    osConcluidas: mappedOS,
    resumoOS,
    transacoes: transacoes || [],
    resumoCaixa: {
      ...resumoCaixa,
      saldo: resumoCaixa.totalEntradas - resumoCaixa.totalSaidas,
    },
  };
}
