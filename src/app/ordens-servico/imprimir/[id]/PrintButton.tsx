'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button className="btn btn-primary" onClick={() => window.print()} style={{ cursor: 'pointer' }}>
      <Printer size={18} /> Imprimir
    </button>
  );
}
