'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getClientes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('Clientes')
    .select('*')
    .order('nome', { ascending: true });
  return data || [];
}

export async function addCliente(formData: FormData) {
  const nome = formData.get('nome') as string;
  const telefone = formData.get('telefone') as string;
  const placa = formData.get('placa') as string;
  const modelo = formData.get('modelo') as string;

  if (!nome) return;

  const supabase = await createClient();
  await supabase
    .from('Clientes')
    .insert([{ nome, telefone, placa, modelo }]);

  revalidatePath('/clientes');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/ordens-servico');
}

export async function addClienteDirect(nome: string, telefone: string, placa: string, modelo: string) {
  if (!nome) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('Clientes')
    .insert([{ nome, telefone, placa, modelo }])
    .select()
    .single();

  if (error) return null;

  revalidatePath('/clientes');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/ordens-servico');

  return data;
}

export async function deleteCliente(id: number) {
  const supabase = await createClient();
  await supabase
    .from('Clientes')
    .delete()
    .eq('id', id);
    
  revalidatePath('/clientes');
  revalidatePath('/ordens-servico/nova');
  revalidatePath('/ordens-servico');
}
