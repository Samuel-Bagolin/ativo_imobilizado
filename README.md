# Ativo Imobilizado — Controle de patrimônio das Casas de Oração

Plataforma web (Next.js + React) para controlar o ativo imobilizado (bens patrimoniais) das
casas de oração de uma Administração (ex.: São José dos Pinhais). **Sistema totalmente
separado** do sistema de RA/auditoria de não conformidades — este é sobre estoque/patrimônio.

## Módulos

- **Lançamento** (`/lancamento`) — cadastra os itens (bens imobilizados) presentes em cada
  casa de oração: código, descrição, fornecedor, dependência (sala), conta, nº documento,
  valores de aquisição/depreciação/atual e status (Ativo/Depreciado/Baixado) — seguindo as
  mesmas colunas do Relatório de Bens Imobilizado (CCB/SIGA).
- **Conferência** (`/conferencia`) — audita os itens já lançados: para cada item é possível
  marcar "Confere", "Divergente" ou "Não localizado", registrando quem conferiu e quando.
- **Mapa 3D** (`/mapa`) — mapa geográfico real (estilo Google Maps) com cada casa de oração
  representada por um marcador 3D: **verde** quando há item ativo em estoque, **vermelho**
  quando a casa está sem nenhum item ativo.
- **Transferência** (`/transferencia`) — solicita, conclui ou cancela a transferência de um
  item de uma casa de oração para outra que esteja precisando.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS
- Mapa: MapLibre GL JS (`react-map-gl`) com basemap gratuito (CARTO), sem necessidade de API key
- Dados: camada própria em `src/lib/db.ts`

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Na primeira execução, o arquivo `data/db.json` é criado
automaticamente com dados de exemplo (seed) de 6 casas de oração de São José dos Pinhais
e seus itens — incluindo uma casa propositalmente sem itens ativos, para já aparecer
vermelha no mapa.

## ⚠️ Importante sobre persistência em produção (Vercel)

O armazenamento atual (`src/lib/db.ts`) grava os dados em um arquivo JSON local
(`data/db.json`). Isso funciona perfeitamente em desenvolvimento e também localmente com
`npm run build && npm start`. **Porém, no Vercel (ambiente serverless), o sistema de
arquivos é somente leitura em produção** — ou seja, lançamentos, conferências e
transferências feitos através do site publicado não serão salvos de forma permanente
entre uma invocação e outra.

Para produção real, é necessário trocar o data layer por um banco de dados de verdade,
por exemplo:

- **Vercel Postgres** / **Neon** / **Supabase** (Postgres) + [Prisma](https://www.prisma.io)
- **Turso** (SQLite distribuído) via `@libsql/client`

Toda a aplicação já está organizada para isso: basta reimplementar as funções exportadas
em `src/lib/db.ts` (mesma assinatura) apontando para o banco escolhido — nenhuma página ou
rota de API precisa mudar.

> Nota: durante o desenvolvimento deste projeto, a tentativa de usar Prisma com SQLite
> localmente esbarrou num bloqueio de rede do ambiente de build (download do engine do
> Prisma via `binaries.prisma.sh`), por isso o MVP usa o data layer simples acima. Isso
> não é uma limitação do Vercel — lá o download funciona normalmente durante o build.

## Estrutura

```
src/
  app/
    page.tsx              → Painel (visão geral)
    lancamento/            → Módulo Lançamento
    conferencia/           → Módulo Conferência
    mapa/                  → Módulo Mapa 3D
    transferencia/         → Módulo Transferência
    api/                   → Rotas de API (casas, itens, conferencias, transferencias)
  lib/
    types.ts               → Tipos do domínio
    db.ts                  → Camada de dados (trocar por um banco real em produção)
```

## Deploy no Vercel

1. Importe este repositório em https://vercel.com/new
2. Framework preset: Next.js (detectado automaticamente)
3. Deploy — sem variáveis de ambiente obrigatórias para rodar o MVP
4. (Recomendado) Configure um banco de dados real antes de usar em produção, conforme
   a seção acima.
