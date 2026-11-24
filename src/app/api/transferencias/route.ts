import { NextRequest, NextResponse } from "next/server";
import { listarTransferencias, criarTransferencia, concluirTransferencia, cancelarTransferencia } from "@/lib/db";

export async function GET() {
  return NextResponse.json(listarTransferencias());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const obrigatorios = ["itemId", "casaOrigemId", "casaDestinoId", "responsavel"];
  for (const campo of obrigatorios) {
    if (!body?.[campo]) {
      return NextResponse.json({ error: `Campo obrigatório: ${campo}` }, { status: 400 });
    }
  }
  if (body.casaOrigemId === body.casaDestinoId) {
    return NextResponse.json({ error: "Casa de origem e destino não podem ser a mesma" }, { status: 400 });
  }
  const transferencia = criarTransferencia({
    itemId: body.itemId,
    casaOrigemId: body.casaOrigemId,
    casaDestinoId: body.casaDestinoId,
    responsavel: body.responsavel,
    motivo: body.motivo,
  });
  return NextResponse.json(transferencia, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  if (!body?.id || !body?.acao) {
    return NextResponse.json({ error: "Campos obrigatórios: id, acao ('concluir' | 'cancelar')" }, { status: 400 });
  }
  const resultado =
    body.acao === "concluir" ? concluirTransferencia(body.id) : cancelarTransferencia(body.id);
  if (!resultado) return NextResponse.json({ error: "Transferência não encontrada" }, { status: 404 });
  return NextResponse.json(resultado);
}
