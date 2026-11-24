import { listarCasas, listarItens, listarConferencias } from "@/lib/db";
import ConferenciaClient from "./ConferenciaClient";

export const dynamic = "force-dynamic";

export default async function ConferenciaPage() {
  const casas = listarCasas();
  const itens = listarItens();
  const conferencias = listarConferencias();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Conferência de patrimônio</h2>
        <p className="text-sm text-zinc-500">
          Confira item a item seguindo o padrão do Relatório de Bens Imobilizado: Código, Descrição,
          Dependência e Status. Marque se confere, está divergente ou não foi localizado.
        </p>
      </div>
      <ConferenciaClient casas={casas} itensIniciais={itens} conferenciasIniciais={conferencias} />
    </div>
  );
}
