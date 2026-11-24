import { listarCasas, listarItens } from "@/lib/db";
import LancamentoForm from "./LancamentoForm";
import ListaItens from "./ListaItens";

export const dynamic = "force-dynamic";

export default async function LancamentoPage() {
  const casas = listarCasas();
  const itens = listarItens();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Lançamento de patrimônio</h2>
        <p className="text-sm text-zinc-500">
          Registre os itens (bens imobilizados) existentes em cada casa de oração.
        </p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="card h-fit">
          <h3 className="font-bold mb-3">Novo item</h3>
          <LancamentoForm casas={casas} />
        </div>
        <div className="card">
          <h3 className="font-bold mb-3">Itens lançados ({itens.length})</h3>
          <ListaItens itensIniciais={itens} casas={casas} />
        </div>
      </div>
    </div>
  );
}
