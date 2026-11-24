import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ativo Imobilizado — Casas de Oração",
  description: "Controle de patrimônio (ativo imobilizado) das casas de oração por Administração",
};

const NAV = [
  { href: "/", label: "Painel" },
  { href: "/lancamento", label: "Lançamento" },
  { href: "/conferencia", label: "Conferência" },
  { href: "/mapa", label: "Mapa 3D" },
  { href: "/transferencia", label: "Transferência" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-lg font-bold tracking-tight">Ativo Imobilizado</h1>
              <p className="text-xs text-slate-500">Controle de patrimônio das Casas de Oração</p>
            </div>
            <nav className="flex gap-1 flex-wrap">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          Sistema independente de controle de ativo imobilizado — não relacionado ao sistema de RA/auditoria
        </footer>
      </body>
    </html>
  );
}
