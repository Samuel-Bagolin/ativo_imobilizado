import Link from "next/link";
import { resumoEstoquePorCasa, listarItens, listarTransferencias } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const resumo = resumoEstoquePorCasa();
  const itens = listarItens();
  const transferencias = listarTransferencias();

  const casasComEstoque = resumo.filter((r) => r.itensAtivos > 0).length;
  const casasSemEstoque = resumo.length - casasComEstoque;
  const valorTotalAtivo = itens
    .filter((i) => i.status === "Ativo")
    .reduce((acc, i) => acc + i.vlAtual, 0);
  const transferenciasAbertas = transferencias.filter(
    (t) => t.status === "Solicitada" || t.status === "Em trânsito"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Visão geral — São José dos Pinhais</h2>
        <p className="text-sm text-zinc-500">
          Resumo do patrimônio registrado em todas as casas de oração da Administração.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Casas de oração</p>
          <p className="text-2xl font-bold mt-1">{resumo.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Com estoque (verde)</p>
          <p className="text-2xl font-bold mt-1 text-green-700">{casasComEstoque}</p>
        </div>
        <div className="card">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Sem estoque (vermelho)</p>
          <p className="text-2xl font-bold mt-1 text-red-700">{casasSemEstoque}</p>
        </div>
        <div className="card">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Valor atual total</p>
          <p className="text-2xl font-bold mt-1">
            {valorTotalAtivo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card flex flex-col gap-3">
          <h3 className="font-bold">Módulos</h3>
          <Link href="/lancamento" className="btn btn-outline justify-start">
            📋 Lançamento — cadastrar itens por casa de oração
          </Link>
          <Link href="/conferencia" className="btn btn-outline justify-start">
            ✅ Conferência — auditar itens do Relatório de Bens
          </Link>
          <Link href="/mapa" className="btn btn-outline justify-start">
            🗺️ Mapa 3D — estoque geográfico verde/vermelho
          </Link>
          <Link href="/transferencia" className="btn btn-outline justify-start">
            🔄 Transferência — mover itens entre casas
          </Link>
        </div>

        <div className="card">
          <h3 className="font-bold mb-2">Casas sem estoque ativo</h3>
          {casasSemEstoque === 0 ? (
            <p className="text-sm text-zinc-500">Todas as casas possuem ao menos um item ativo.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {resumo
                .filter((r) => r.itensAtivos === 0)
                .map((r) => (
                  <li key={r.casa.id} className="flex items-center justify-between text-sm">
                    <span>{r.casa.nome}</span>
                    <span className="badge badge-red">sem itens ativos</span>
                  </li>
                ))}
            </ul>
          )}
          <h3 className="font-bold mt-4 mb-2">Transferências em aberto</h3>
          <p className="text-2xl font-bold">{transferenciasAbertas}</p>
        </div>
      </div>
    </div>
  );
}
