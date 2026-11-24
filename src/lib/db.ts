import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { DB, CasaOracao, Item, Conferencia, Transferencia } from "./types";

// Data layer simples baseado em arquivo JSON, pensado para rodar local e no Vercel
// (Vercel: o filesystem é somente leitura em produção, então escritas feitas em
// runtime serverless NÃO persistem entre invocações/deploys. Para produção real,
// troque este módulo por um cliente de banco de dados (ex: Postgres + Prisma),
// mantendo a mesma interface pública abaixo — todo o resto do app não muda.)

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function seedData(): DB {
  const administracao = "São José dos Pinhais";

  const casas: CasaOracao[] = [
    {
      id: "casa-jardim-independencia",
      codigo: "14-1525",
      nome: "Jardim Independência",
      administracao,
      endereco: "São José dos Pinhais - PR",
      latitude: -25.5347,
      longitude: -49.2064,
    },
    {
      id: "casa-centro",
      codigo: "14-0001",
      nome: "Centro",
      administracao,
      endereco: "São José dos Pinhais - PR",
      latitude: -25.5301,
      longitude: -49.2069,
    },
    {
      id: "casa-afonso-pena",
      codigo: "14-0212",
      nome: "Afonso Pena",
      administracao,
      endereco: "São José dos Pinhais - PR",
      latitude: -25.5423,
      longitude: -49.1764,
    },
    {
      id: "casa-aguas-belas",
      codigo: "14-0340",
      nome: "Águas Belas",
      administracao,
      endereco: "São José dos Pinhais - PR",
      latitude: -25.5789,
      longitude: -49.1532,
    },
    {
      id: "casa-campina-barro-preto",
      codigo: "14-0455",
      nome: "Campina do Barro Preto",
      administracao,
      endereco: "São José dos Pinhais - PR",
      latitude: -25.6102,
      longitude: -49.1098,
    },
    {
      id: "casa-guatupe",
      codigo: "14-0588",
      nome: "Guatupê",
      administracao,
      endereco: "São José dos Pinhais - PR",
      latitude: -25.4987,
      longitude: -49.2451,
    },
  ];

  const dependencias = [
    "ATRIO",
    "SALAO DE CULTO",
    "SECRETARIA",
    "FUNDO BIBLICO",
    "SANITARIO FEMININO",
    "SANITARIO MASCULINO",
    "ALMOXARIFADO",
  ];

  const catalogo: { descricao: string; fornecedor: string; faixaValor: [number, number] }[] = [
    { descricao: "CADEIRA DE PLASTICO", fornecedor: "Móveis Paraná Ltda", faixaValor: [80, 150] },
    { descricao: "MESA DE MADEIRA", fornecedor: "Marcenaria Bom Pastor", faixaValor: [400, 900] },
    { descricao: "VENTILADOR DE PAREDE", fornecedor: "Eletro Sul Comércio", faixaValor: [180, 320] },
    { descricao: "AMPLIFICADOR DE SOM", fornecedor: "Áudio Profissional SJP", faixaValor: [1200, 3500] },
    { descricao: "MICROFONE SEM FIO", fornecedor: "Áudio Profissional SJP", faixaValor: [350, 800] },
    { descricao: "ARMARIO DE ACO", fornecedor: "Metalúrgica Curitiba", faixaValor: [600, 1400] },
    { descricao: "BEBEDOURO ELETRICO", fornecedor: "Eletro Sul Comércio", faixaValor: [500, 1100] },
    { descricao: "EXTINTOR DE INCENDIO", fornecedor: "Segurança Total Equip.", faixaValor: [120, 260] },
    { descricao: "ESTANTE DE ACO", fornecedor: "Metalúrgica Curitiba", faixaValor: [250, 600] },
    { descricao: "PIANO DIGITAL", fornecedor: "Instrumentos Musicais BR", faixaValor: [2500, 6000] },
  ];

  const itens: Item[] = [];
  const now = new Date().toISOString();
  let seq = 1;

  casas.forEach((casa, casaIdx) => {
    // Casa "Guatupê" fica propositalmente sem itens ativos (para exemplificar marcador vermelho no mapa)
    if (casa.id === "casa-guatupe") return;

    const qtdItens = casaIdx === 0 ? 10 : 5 + (casaIdx % 3);
    for (let i = 0; i < qtdItens; i++) {
      const produto = catalogo[(i + casaIdx) % catalogo.length];
      const dependencia = dependencias[(i + casaIdx) % dependencias.length];
      const vlAquisicao = Math.round(
        (produto.faixaValor[0] + Math.random() * (produto.faixaValor[1] - produto.faixaValor[0])) * 100
      ) / 100;
      const vlDeprec = Math.round(vlAquisicao * 0.35 * 100) / 100;
      const vlAtual = Math.round((vlAquisicao - vlDeprec) * 100) / 100;
      const status = i % 9 === 0 ? "Baixado" : i % 5 === 0 ? "Depreciado" : "Ativo";

      itens.push({
        id: randomUUID(),
        codigo: `${casa.codigo} / ${String(seq).padStart(6, "0")}`,
        descricao: produto.descricao,
        fornecedor: produto.fornecedor,
        dependencia,
        conta: "IMOBILIZADO",
        numeroDocumento: `${1000 + seq}`,
        dtAquisicao: new Date(2018 + (seq % 7), seq % 12, 10).toISOString(),
        vlAquisicao,
        vlDeprec,
        vlAtual,
        status,
        casaOracaoId: casa.id,
        criadoEm: now,
        atualizadoEm: now,
      });
      seq++;
    }
  });

  return { casas, itens, conferencias: [], transferencias: [] };
}

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seeded = seedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), "utf-8");
  }
}

function readDB(): DB {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as DB;
}

function writeDB(db: DB): void {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// ---------- API pública do data layer ----------

export function listarCasas(): CasaOracao[] {
  return readDB().casas;
}

export function obterCasa(id: string): CasaOracao | undefined {
  return readDB().casas.find((c) => c.id === id);
}

export function criarCasa(input: Omit<CasaOracao, "id">): CasaOracao {
  const db = readDB();
  const nova: CasaOracao = { ...input, id: randomUUID() };
  db.casas.push(nova);
  writeDB(db);
  return nova;
}

export function listarItens(filtro?: { casaOracaoId?: string }): Item[] {
  const db = readDB();
  if (filtro?.casaOracaoId) {
    return db.itens.filter((i) => i.casaOracaoId === filtro.casaOracaoId);
  }
  return db.itens;
}

export function obterItem(id: string): Item | undefined {
  return readDB().itens.find((i) => i.id === id);
}

export function criarItem(
  input: Omit<Item, "id" | "criadoEm" | "atualizadoEm">
): Item {
  const db = readDB();
  const now = new Date().toISOString();
  const novo: Item = { ...input, id: randomUUID(), criadoEm: now, atualizadoEm: now };
  db.itens.push(novo);
  writeDB(db);
  return novo;
}

export function atualizarItem(id: string, patch: Partial<Item>): Item | undefined {
  const db = readDB();
  const idx = db.itens.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  db.itens[idx] = { ...db.itens[idx], ...patch, atualizadoEm: new Date().toISOString() };
  writeDB(db);
  return db.itens[idx];
}

export function listarConferencias(filtro?: { casaOracaoId?: string }): Conferencia[] {
  const db = readDB();
  if (filtro?.casaOracaoId) {
    return db.conferencias.filter((c) => c.casaOracaoId === filtro.casaOracaoId);
  }
  return db.conferencias;
}

export function registrarConferencia(
  input: Omit<Conferencia, "id">
): Conferencia {
  const db = readDB();
  const nova: Conferencia = { ...input, id: randomUUID() };
  db.conferencias.push(nova);
  writeDB(db);
  return nova;
}

export function listarTransferencias(): Transferencia[] {
  return readDB().transferencias;
}

export function criarTransferencia(
  input: Omit<Transferencia, "id" | "status" | "dataSolicitacao"> & { status?: Transferencia["status"] }
): Transferencia {
  const db = readDB();
  const nova: Transferencia = {
    ...input,
    id: randomUUID(),
    status: input.status ?? "Solicitada",
    dataSolicitacao: new Date().toISOString(),
  };
  db.transferencias.push(nova);
  writeDB(db);
  return nova;
}

export function concluirTransferencia(id: string): Transferencia | undefined {
  const db = readDB();
  const idx = db.transferencias.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  const transf = db.transferencias[idx];

  // Move o item fisicamente para a casa de destino
  const itemIdx = db.itens.findIndex((i) => i.id === transf.itemId);
  if (itemIdx !== -1) {
    db.itens[itemIdx] = {
      ...db.itens[itemIdx],
      casaOracaoId: transf.casaDestinoId,
      atualizadoEm: new Date().toISOString(),
    };
  }

  db.transferencias[idx] = {
    ...transf,
    status: "Concluída",
    dataConclusao: new Date().toISOString(),
  };
  writeDB(db);
  return db.transferencias[idx];
}

export function cancelarTransferencia(id: string): Transferencia | undefined {
  const db = readDB();
  const idx = db.transferencias.findIndex((t) => t.id === id);
  if (idx === -1) return undefined;
  db.transferencias[idx] = { ...db.transferencias[idx], status: "Cancelada" };
  writeDB(db);
  return db.transferencias[idx];
}

// Resumo de estoque por casa, usado pelo Mapa 3D (verde = tem item ativo, vermelho = vazio)
export function resumoEstoquePorCasa(): Array<{
  casa: CasaOracao;
  totalItens: number;
  itensAtivos: number;
  valorAtualTotal: number;
}> {
  const db = readDB();
  return db.casas.map((casa) => {
    const itensCasa = db.itens.filter((i) => i.casaOracaoId === casa.id);
    const itensAtivos = itensCasa.filter((i) => i.status === "Ativo");
    const valorAtualTotal = itensAtivos.reduce((acc, i) => acc + i.vlAtual, 0);
    return { casa, totalItens: itensCasa.length, itensAtivos: itensAtivos.length, valorAtualTotal };
  });
}
