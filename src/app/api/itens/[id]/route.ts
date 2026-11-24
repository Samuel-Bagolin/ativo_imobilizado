import { NextRequest, NextResponse } from "next/server";
import { atualizarItem, obterItem } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = obterItem(id);
  if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const atualizado = atualizarItem(id, body);
  if (!atualizado) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  return NextResponse.json(atualizado);
}
