import { NextRequest, NextResponse } from "next/server";
import { listarConferencias, registrarConferencia, atualizarItem } from "@/lib/db";

export async function GET(req: NextRequest) {
  const casaOracaoId = req.nextUrl.searchParams.get("casaOracaoId") ?? undefined;
  return NextResponse.json(listarConferencias(casaOracaoId ? { casaOracaoId } : undefined));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const obrigatorios = ["itemId", "casaOracaoId", "conferente", "resultado"];
  for (const campo of obrigatorios) {
    if (!body?.[campo]) {
      return NextResponse.json({ error: `Campo obrigatório: ${campo}` }, { status: 400 });
    }
  }
  const conferencia = registrarConferencia({
    itemId: body.itemId,
    casaOracaoId: body.casaOracaoId,
    dataConferencia: new Date().toISOString(),
    conferente: body.conferente,
    resultado: body.resultado,
    observacao: body.observacao,
  });

  // Se o item não foi localizado, sinaliza no próprio cadastro do item
  if (body.resultado === "Não localizado") {
    atualizarItem(body.itemId, { status: "Baixado" });
  }

  return NextResponse.json(conferencia, { status: 201 });
}
