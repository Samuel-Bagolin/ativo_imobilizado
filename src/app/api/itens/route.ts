import { NextRequest, NextResponse } from "next/server";
import { listarItens, criarItem } from "@/lib/db";

export async function GET(req: NextRequest) {
  const casaOracaoId = req.nextUrl.searchParams.get("casaOracaoId") ?? undefined;
  return NextResponse.json(listarItens(casaOracaoId ? { casaOracaoId } : undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const obrigatorios = ["descricao", "dependencia", "casaOracaoId"];
  for (const campo of obrigatorios) {
    if (!body?.[campo]) {
      return NextResponse.json({ error: `Campo obrigatório: ${campo}` }, { status: 400 });
    }
  }
  const vlAquisicao = Number(body.vlAquisicao ?? 0);
  const vlDeprec = Number(body.vlDeprec ?? 0);
  const item = criarItem({
    codigo: body.codigo ?? "",
    descricao: body.descricao,
    fornecedor: body.fornecedor,
    dependencia: body.dependencia,
    conta: body.conta,
    numeroDocumento: body.numeroDocumento,
    dtAquisicao: body.dtAquisicao,
    vlAquisicao,
    vlDeprec,
    vlAtual: vlAquisicao - vlDeprec,
    status: body.status ?? "Ativo",
    casaOracaoId: body.casaOracaoId,
  });
  return NextResponse.json(item, { status: 201 });
}
