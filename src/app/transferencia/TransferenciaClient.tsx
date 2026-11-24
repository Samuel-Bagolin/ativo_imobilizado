"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CasaOracao, Item, Transferencia } from "@/lib/types";

function statusBadge(status: Transferencia["status"]) {
  if (status === "Concluída") return <span className="badge badge-green">Concluída</span>;
  if (status === "Em trânsito") return <span className="badge badge-amber">Em trânsito</span>;
  if (status === "Cancelada") return <span className="badge badge-slate">Cancelada</span>;
  return <span className="badge badge-amber">Solicitada</span>;
}

export default function TransferenciaClient({
  casas,
  itensIniciais,
  transferenciasIniciais,
}: {
  casas: CasaOracao[];
  itensIniciais: Item[];
  transferenciasIniciais: Transferencia[];
}) {
  const router = useRouter();
  const casasPorId = useMemo(() => Object.fromEntries(casas.map((c) => [c.id, c])), [casas]);
  const itensPorId = useMemo(() => Object.fromEntries(itensIniciais.map((i) => [i.id, i])), [itensIniciais]);

  const [casaOrigemId, setCasaOrigemId] = useState(casas[0]?.id ?? "");
  const [itemId, setItemId] = useState("");
  const [casaDestinoId, setCasaDestinoId] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const itensDaOrigem = itensIniciais.filter(
    (i) => i.casaOracaoId === casaOrigemId && i.status !== "Baixado"
  );

  async function solicitarTransferencia(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!itemId || !casaDestinoId || !responsavel.trim()) {
      setErro("Preencha item, casa de destino e responsável.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/transferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, casaOrigemId, casaDestinoId, responsavel, motivo }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Falha ao solicitar transferência");
      }
      setItemId("");
      setCasaDestinoId("");
      setMotivo("");
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setEnviando(false);
    }
  }

  async function processar(id: string, acao: "concluir" | "cancelar") {
    setProcessandoId(id);
    try {
      const res = await fetch("/api/transferencias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, acao }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar transferência");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="card h-fit">
        <h3 className="font-bold mb-3">Nova transferência</h3>
        <form onSubmit={solicitarTransferencia} className="flex flex-col gap-3">
          <div>
            <label className="field-label">Casa de origem</label>
            <select
              className="input"
              value={casaOrigemId}
              onChange={(e) => {
                setCasaOrigemId(e.target.value);
                setItemId("");
              }}
            >
              {casas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Item a transferir</label>
            <select className="input" value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">Selecione...</option>
              {itensDaOrigem.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.descricao} ({i.codigo || "sem código"})
                </option>
              ))}
            </select>
            {itensDaOrigem.length === 0 && (
              <p className="text-xs text-zinc-400 mt-1">Esta casa não tem itens disponíveis para transferir.</p>
            )}
          </div>

          <div>
            <label className="field-label">Casa de destino (precisando do item)</label>
            <select className="input" value={casaDestinoId} onChange={(e) => setCasaDestinoId(e.target.value)}>
              <option value="">Selecione...</option>
              {casas
                .filter((c) => c.id !== casaOrigemId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="field-label">Responsável</label>
            <input className="input" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </div>

          <div>
            <label className="field-label">Motivo (opcional)</label>
            <textarea
              className="input"
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: casa destino está sem ventilador"
            />
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button type="submit" disabled={enviando} className="btn btn-primary">
            {enviando ? "Enviando..." : "Solicitar transferência"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-bold mb-3">Transferências ({transferenciasIniciais.length})</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>De</th>
                <th>Para</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {transferenciasIniciais
                .slice()
                .reverse()
                .map((t) => (
                  <tr key={t.id}>
                    <td>{itensPorId[t.itemId]?.descricao ?? "—"}</td>
                    <td>{casasPorId[t.casaOrigemId]?.nome ?? "—"}</td>
                    <td>{casasPorId[t.casaDestinoId]?.nome ?? "—"}</td>
                    <td>{t.responsavel}</td>
                    <td>{statusBadge(t.status)}</td>
                    <td>
                      {(t.status === "Solicitada" || t.status === "Em trânsito") && (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-outline !px-2 !py-1 text-xs"
                            disabled={processandoId === t.id}
                            onClick={() => processar(t.id, "concluir")}
                          >
                            Concluir
                          </button>
                          <button
                            className="btn btn-outline !px-2 !py-1 text-xs"
                            disabled={processandoId === t.id}
                            onClick={() => processar(t.id, "cancelar")}
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              {transferenciasIniciais.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-zinc-400 py-6">
                    Nenhuma transferência registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
