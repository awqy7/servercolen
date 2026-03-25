import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const periodo = (searchParams.get('periodo') || 'mes') as 'dia' | 'semana' | 'mes';

  try {
    const supabase = await createClient();

    const now = new Date();
    const start = new Date(now);
    if (periodo === 'dia') start.setHours(0, 0, 0, 0);
    else if (periodo === 'semana') start.setDate(now.getDate() - 6);
    else start.setDate(1);
    
    const startDate = start.toISOString();

    // Fetch Orders
    const { data: ordensRaw } = await supabase
      .from('ordens_servico')
      .select('id, created_at, status, valor_pecas, valor_maodeobra, valor_final, clientes (nome, placa, modelo)')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    const ordens = (ordensRaw || []).map((os: any) => ({
      "OS#": os.id,
      "Data/Hora": new Date(os.created_at).toLocaleString('pt-BR'),
      "Cliente": os.clientes?.nome,
      "Placa": os.clientes?.placa,
      "Veículo": os.clientes?.modelo,
      "Status": os.status,
      "Total Peças (R$)": os.valor_pecas,
      "Mão de Obra (R$)": os.valor_maodeobra,
      "Total Final (R$)": os.valor_final
    }));

    // Fetch Cash register
    const { data: caixaRaw } = await supabase
      .from('caixa')
      .select('*')
      .gte('data', startDate)
      .order('data', { ascending: false });

    const caixa = (caixaRaw || []).map((c: any) => ({
      "Data/Hora": new Date(c.data).toLocaleString('pt-BR'),
      "Tipo": c.tipo,
      "Descrição": c.descricao,
      "Valor (R$)": c.valor,
      "OS Ref.": c.os_id
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1 - Ordens de Serviço
    const wsOS = ordens.length > 0 ? XLSX.utils.json_to_sheet(ordens) : XLSX.utils.aoa_to_sheet([['Nenhuma OS no período']]);
    XLSX.utils.book_append_sheet(wb, wsOS, 'Ordens de Serviço');

    // Sheet 2 - Caixa
    const wsCaixa = caixa.length > 0 ? XLSX.utils.json_to_sheet(caixa) : XLSX.utils.aoa_to_sheet([['Nenhuma transação no período']]);
    XLSX.utils.book_append_sheet(wb, wsCaixa, 'Caixa');

    // Sheet 3 - Estoque
    const { data: estoqueRaw } = await supabase.from('estoque').select('*').order('nome', { ascending: true });
    const estoque = (estoqueRaw || []).map((e: any) => ({
      "Peça/Produto": e.nome,
      "Quantidade": e.quantidade,
      "Custo (R$)": e.valor_custo,
      "Venda (R$)": e.valor_venda
    }));
    const wsEstoque = estoque.length > 0 ? XLSX.utils.json_to_sheet(estoque) : XLSX.utils.aoa_to_sheet([['Estoque vazio']]);
    XLSX.utils.book_append_sheet(wb, wsEstoque, 'Estoque Atual');

    // Generate filename
    const dateStr = now.toLocaleDateString('pt-BR').replace(/\//g, '-');
    const periodoLabel = { dia: 'diario', semana: 'semanal', mes: 'mensal' }[periodo] || 'mensal';
    const filename = `relatorio_${periodoLabel}_${dateStr}.xlsx`;

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('[EXPORT ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
