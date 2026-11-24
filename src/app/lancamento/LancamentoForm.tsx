"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CasaOracao } from "@/lib/types";

const DEPENDENCIAS = [
  "ATRIO",
  "SALAO DE CULTO",
  "SECRETARIA",
  "FUNDO BIBLICO",
  "SANITARIO FEMININO",
  "SANITARIO MASCULINO",
  "ALMOXARIFADO",
  "COZINHA",
  "ESTACIONAMENTO",
];

export default function LancamentoForm({ casas }: { casas: CasaOracao[] }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      casaOracaoId: form.get("casaOracaoId"),
      codigo: form.get("codigo"),
      descricao: form.get("descricao"),
      fornecedor: form.get("fornecedor"),
      dependencia: form.get("dependencia"),
      conta: form.get("conta"),
      numeroDocumento: form.get("numeroDocumento"),
      dtAquisicao: form.get("dtAquisicao"),
      vlAquisicao: Number(form.get("vlAquisicao") || 0),
      vlDeprec: Number(form.get("vlDeprec") || 0),
      status: form.get("status"),
    };

    try {
      const res = await fetch("/api/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Falha ao salvar");
      }
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="field-label">Casa de oração</label>
        <select name="casaOracaoId" required className="input" defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          {casas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Código do bem</label>
        <input name="codigo" className="input" placeholder="14-1525 / 000003" />
      </div>

      <div>
        <label className="field-label">Descrição / Produto</label>
        <input name="descricao" required className="input" placeholder="Ex: CADEIRA DE PLASTICO" />
      </div>

      <div>
        <label className="field-label">Fornecedor</label>
        <input name="fornecedor" className="input" />
      </div>

      <div>
        <label className="field-label">Dependência (local)</label>
        <select name="dependencia" required className="input" defaultValue="">
          <option value="" disabled>
            Selecione...
          </option>
          {DEPENDENCIAS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label">Conta</label>
          <input name="conta" className="input" defaultValue="IMOBILIZADO" />
        </div>
        <div>
          <label className="field-label">Nº Documento</label>
          <input name="numeroDocumento" className="input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label">Dt. Aquisição</label>
          <input type="date" name="dtAquisicao" className="input" />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select name="status" className="input" defaultValue="Ativo">
            <option value="Ativo">Ativo</option>
            <option value="Depreciado">Depreciado</option>
            <option value="Baixado">Baixado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label">Vl. Aquisição (R$)</label>
          <input type="number" step="0.01" name="vlAquisicao" className="input" required />
        </div>
        <div>
          <label className="field-label">Vl. Depreciado (R$)</label>
          <input type="number" step="0.01" name="vlDeprec" className="input" defaultValue={0} />
        </div>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <button type="submit" disabled={enviando} className="btn btn-primary mt-2">
        {enviando ? "Salvando..." : "Lançar item"}
      </button>
    </form>
  );
}
