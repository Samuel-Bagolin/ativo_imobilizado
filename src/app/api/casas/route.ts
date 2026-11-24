import { NextRequest, NextResponse } from "next/server";
import { listarCasas, criarCasa, resumoEstoquePorCasa } from "@/lib/db";

export async function GET(req: NextRequest) {
  const resumo = req.nextUrl.searchParams.get("resumo");
  if (resumo === "1") {
    return NextResponse.json(resumoEstoquePorCasa());
  }
  return NextResponse.json(listarCasas());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.nome || typeof body.latitude !== "number" || typeof body.longitude !== "number") {
    return NextResponse.json(
      { error: "Campos obrigatórios: nome, codigo, administracao, latitude, longitude" },
      { status: 400 }
    );
  }
  const casa = criarCasa({
    codigo: body.codigo ?? "",
    nome: body.nome,
    administracao: body.administracao ?? "São José dos Pinhais",
    endereco: body.endereco,
    latitude: body.latitude,
    longitude: body.longitude,
  });
  return NextResponse.json(casa, { status: 201 });
}
