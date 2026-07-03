'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench, LayoutDashboard, Package, FileText, WalletCards, Users, BarChart2, Menu, X } from 'lucide-react';
import { signOut } from '../actions';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ordens-servico', label: 'Ordens de Serviço', icon: FileText },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/caixa', label: 'Controle de Caixa', icon: WalletCards },
  { href: '/relatorio', label: 'Relatórios', icon: BarChart2 },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mobile-menu-btn"
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>

      {open && (
        <div className="mobile-overlay" onClick={() => setOpen(false)}>
          <aside className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="mobile-logo">
                <Wrench size={24} color="var(--primary)" />
                AutoRepair<span>Pro</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="mobile-close-btn"
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mobile-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mobile-drawer-footer">
              <form action={signOut}>
                <button type="submit" className="mobile-logout-btn">
                  Sair
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
