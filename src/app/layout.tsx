import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Wrench, LayoutDashboard, Package, FileText, WalletCards, Users, BarChart2, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { signOut } from './actions';

export const metadata: Metadata = {
  title: 'AutoRepair Pro - Gestão de Oficina',
  description: 'Sistema completo para gestão de oficinas',
};

// Sidebar component extracted to simplify layout
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Wrench size={28} color="var(--primary)" />
        AutoRepair<span>Pro</span>
      </div>
      <nav className="sidebar-nav">
        <Link href="/" className="nav-item">
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link href="/ordens-servico" className="nav-item">
          <FileText size={20} />
          Ordens de Serviço
        </Link>
        <Link href="/estoque" className="nav-item">
          <Package size={20} />
          Estoque
        </Link>
        <Link href="/clientes" className="nav-item">
          <Users size={20} />
          Clientes
        </Link>
        <Link href="/caixa" className="nav-item">
          <WalletCards size={20} />
          Controle de Caixa
        </Link>
        <Link href="/relatorio" className="nav-item">
          <BarChart2 size={20} />
          Relatórios
        </Link>
      </nav>
      
      <div className="sidebar-footer">
        <form action={signOut}>
          <button type="submit" className="logout-button">
            <LogOut size={20} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="pt-BR">
      <body>
        <div className="app-layout">
          {user && <Sidebar />}
          <main className={user ? "main-content" : "auth-content"}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
