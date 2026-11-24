"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CasaOracao, Conferencia, Item, ResultadoConferencia } from "@/lib/types";

function resultadoBadge(resultado: ResultadoConferencia) {
  if (resultado === "Confere") return <span className="badge badge-green">Confere</span>;
  if (resultado === "Divergente") return <span className="badge badge-amber">Divergente</span>;
  return <span className="badge badge-red">Não localizado</span>;
}

export default function ConferenciaClient({
  casas,
  itensIniciais,
  conferenciasIniciais,
}: {
  casas: CasaOracao[];
  itensIniciais: Item[];
  conferenciasIniciais: Conferencia[];
}) {
  const router = useRouter();
  const [casaId, setCasaId] = useState(casas[0]?.id ?? "");
  const [conferente, setConferente] = useState("");
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  const ultimaConferenciaPorItem = useMemo(() => {
    const map = new Map<string, Conferencia>();
    for (const c of conferenciasIniciais) {
      const atual = map.get(c.itemId);
      if (!atual || new Date(c.dataConferencia) > new Date(atual.dataConferencia)) {
        map.set(c.itemId, c);
      }
    }
    return map;
  }, [conferenciasIniciais]);

  const itensDaCasa = itensIniciais.filter((i) => i.casaOracaoId === casaId);

  async function registrar(item: Item, resultado: ResultadoConferencia) {
    if (!conferente.trim()) {
      alert("Informe o nome de quem está conferindo antes de registrar.");
      return;
    }
    setSalvandoId(item.id);
    try {
      const res = await fetch("/api/conferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          casaOracaoId: item.casaOracaoId,
          conferente,
          resultado,
        }),
      });
      if (!res.ok) throw new Error("Falha ao registrar conferência");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setSalvandoId(null);
    }
  }

  const totalConferidos = itensDaCasa.filter((i) => ultimaConferenciaPorItem.has(i.id)).length;

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[220px]">
          <label className="field-label">Casa de oração</label>
          <select className="input" value={casaId} onChange={(e) => setCasaId(e.target.value)}>
            {casas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[220px]">
          <label className="field-label">Conferente (quem está conferindo)</label>
          <input
            className="input"
            value={conferente}
            onChange={(e) => setConferente(e.target.value)}
            placeholder="Nome do responsável"
          />
        </div>
        <div className="text-sm text-slate-500">
          {totalConferidos} de {itensDaCasa.length} itens conferidos nesta visita
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Dependência</th>
              <th>Vl. Atual</th>
              <th>Status cadastro</th>
              <th>Última conferência</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {itensDaCasa.map((item) => {
              const ultima = ultimaConferenciaPorItem.get(item.id);
              return (
                <tr key={item.id}>
                  <td className="font-mono text-xs">{item.codigo || "—"}</td>
                  <td>{item.descricao}</td>
                  <td>{item.dependencia}</td>
                  <td>{item.vlAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td>{item.status}</td>
                  <td>{ultima ? resultadoBadge(ultima.resultado) : <span className="text-slate-400">—</span>}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      <button
                        className="btn btn-outline !px-2 !py-1 text-xs"
                        disabled={salvandoId === item.id}
                        onClick={() => registrar(item, "Confere")}
                      >
                        Confere
                      </button>
                      <button
                        className="btn btn-outline !px-2 !py-1 text-xs"
                        disabled={salvandoId === item.id}
                        onClick={() => registrar(item, "Divergente")}
                      >
                        Divergente
                      </button>
                      <button
                        className="btn btn-outline !px-2 !py-1 text-xs"
                        disabled={salvandoId === item.id}
                        onClick={() => registrar(item, "Não localizado")}
                      >
                        Não localizado
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {itensDaCasa.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-slate-400 py-6">
                  Nenhum item lançado para esta casa. Use o módulo de Lançamento primeiro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
