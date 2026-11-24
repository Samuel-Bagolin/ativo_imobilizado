import { listarCasas, listarItens, listarTransferencias } from "@/lib/db";
import TransferenciaClient from "./TransferenciaClient";

export const dynamic = "force-dynamic";

export default async function TransferenciaPage() {
  const casas = listarCasas();
  const itens = listarItens();
  const transferencias = listarTransferencias();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Transferência de estoque</h2>
        <p className="text-sm text-slate-500">
          Mova um item de uma casa de oração para outra que esteja precisando.
        </p>
      </div>
      <TransferenciaClient casas={casas} itensIniciais={itens} transferenciasIniciais={transferencias} />
    </div>
  );
}
