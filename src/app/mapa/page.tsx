import { resumoEstoquePorCasa } from "@/lib/db";
import MapaClient from "./MapaClient";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const resumo = resumoEstoquePorCasa();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold">Mapa 3D de estoque</h2>
        <p className="text-sm text-zinc-500">
          Cada casa de oração aparece como um marcador 3D: base <span className="text-green-700 font-semibold">verde</span> quando há
          item ativo em estoque, <span className="text-red-700 font-semibold">vermelho</span> quando está vazia. Clique em uma casa
          para ver todos os itens disponíveis nela.
        </p>
      </div>
      <MapaClient resumo={resumo} />
    </div>
  );
}
