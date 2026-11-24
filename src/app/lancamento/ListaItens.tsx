"use client";

import { useMemo, useState } from "react";
import type { CasaOracao, Item } from "@/lib/types";

function statusBadge(status: Item["status"]) {
  if (status === "Ativo") return <span className="badge badge-green">Ativo</span>;
  if (status === "Depreciado") return <span className="badge badge-amber">Depreciado</span>;
  return <span className="badge badge-slate">Baixado</span>;
}

export default function ListaItens({
  itensIniciais,
  casas,
}: {
  itensIniciais: Item[];
  casas: CasaOracao[];
}) {
  const [filtroCasa, setFiltroCasa] = useState("");
  const casasPorId = useMemo(() => Object.fromEntries(casas.map((c) => [c.id, c])), [casas]);

  const itensFiltrados = filtroCasa
    ? itensIniciais.filter((i) => i.casaOracaoId === filtroCasa)
    : itensIniciais;

  return (
    <div className="flex flex-col gap-3">
      <select
        className="input max-w-xs"
        value={filtroCasa}
        onChange={(e) => setFiltroCasa(e.target.value)}
      >
        <option value="">Todas as casas</option>
        {casas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Dependência</th>
              <th>Casa</th>
              <th>Vl. Atual</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {itensFiltrados.map((item) => (
              <tr key={item.id}>
                <td className="font-mono text-xs">{item.codigo || "—"}</td>
                <td>{item.descricao}</td>
                <td>{item.dependencia}</td>
                <td>{casasPorId[item.casaOracaoId]?.nome ?? "—"}</td>
                <td>{item.vlAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                <td>{statusBadge(item.status)}</td>
              </tr>
            ))}
            {itensFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 py-6">
                  Nenhum item lançado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
