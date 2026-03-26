const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('--- Inspecting Constraints for os_itens ---');
  // We can't query information_schema directly via REST API easily without a custom RPC
  // But we can try to "peek" by doing a select that might fail and show info, 
  // or by trying to insert a dummy record
  
  const { data: cols, error: colErr } = await supabase.from('os_itens').select('*').limit(0);
  if (colErr) console.log('Error accessing os_itens:', colErr.message);
  else console.log('os_itens columns are accessible');

  const { data: osCols, error: osColErr } = await supabase.from('ordens_servico').select('*').limit(0);
  if (osColErr) console.log('Error accessing ordens_servico:', osColErr.message);
  else console.log('ordens_servico columns are accessible');

  console.log('--- Testing small insert into ordens_servico ---');
  // Need a valid cliente_id. Let's find one.
  const { data: client } = await supabase.from('clientes').select('id').limit(1).single();
  if (!client) {
    console.log('No client found to test with');
    return;
  }

  const { data: newOS, error: insertError } = await supabase
    .from('ordens_servico')
    .insert([{ cliente_id: client.id, status: 'Teste' }])
    .select()
    .single();

  if (insertError) {
    console.log('Insert OS failed:', insertError.message);
  } else {
    console.log('Insert OS Success. ID:', newOS.id);
    console.log('Testing insert into os_itens with this ID...');
    const { error: itemErr } = await supabase
      .from('os_itens')
      .insert([{ os_id: newOS.id, quantidade: 1, valor_unitario: 10 }]);
    
    if (itemErr) {
      console.log('Insert item FAILED:', itemErr.message);
    } else {
      console.log('Insert item SUCCESS');
      // Cleanup
      await supabase.from('os_itens').delete().eq('os_id', newOS.id);
      await supabase.from('ordens_servico').delete().eq('id', newOS.id);
    }
  }
}

inspect();
