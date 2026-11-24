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
      <body className="min-h-full flex flex-col bg-zinc-100 text-zinc-800">
        <header className="bg-zinc-800 sticky top-0 z-10 border-b border-zinc-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-500 flex items-center justify-center text-zinc-100 font-bold text-sm shrink-0">
                AI
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">Ativo Imobilizado</h1>
                <p className="text-xs text-zinc-400">Controle de patrimônio das Casas de Oração</p>
              </div>
            </div>
            <nav className="flex gap-1 flex-wrap">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-zinc-300 bg-zinc-100 py-4 text-center text-xs text-zinc-400">
          Sistema independente de controle de ativo imobilizado — não relacionado ao sistema de RA/auditoria
        </footer>
      </body>
    </html>
  );
}
