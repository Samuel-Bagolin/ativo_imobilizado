// Tipos do domínio "Ativo Imobilizado" (controle de patrimônio das Casas de Oração)
// Baseado nas colunas do Relatório de Bens Imobilizado (CCB/SIGA)

export type StatusItem = "Ativo" | "Depreciado" | "Baixado";

export interface CasaOracao {
  id: string;
  codigo: string; // ex: "14-1525"
  nome: string; // ex: "JARDIM INDEPENDÊNCIA"
  administracao: string; // ex: "São José dos Pinhais"
  endereco?: string;
  latitude: number;
  longitude: number;
}

export interface Item {
  id: string;
  codigo: string; // ex: "14-1525 / 000003"
  descricao: string; // Produto
  fornecedor?: string;
  dependencia: string; // ATRIO, SALAO DE CULTO, SECRETARIA, FUNDO BIBLICO, SANITARIO FEMININO, etc.
  conta?: string;
  numeroDocumento?: string;
  dtAquisicao?: string; // ISO date
  vlAquisicao: number;
  vlDeprec: number;
  vlAtual: number;
  status: StatusItem;
  casaOracaoId: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type ResultadoConferencia = "Confere" | "Divergente" | "Não localizado";

export interface Conferencia {
  id: string;
  itemId: string;
  casaOracaoId: string;
  dataConferencia: string; // ISO
  conferente: string;
  resultado: ResultadoConferencia;
  observacao?: string;
}

export type StatusTransferencia = "Solicitada" | "Em trânsito" | "Concluída" | "Cancelada";

export interface Transferencia {
  id: string;
  itemId: string;
  casaOrigemId: string;
  casaDestinoId: string;
  dataSolicitacao: string;
  dataConclusao?: string;
  responsavel: string;
  motivo?: string;
  status: StatusTransferencia;
}

export interface DB {
  casas: CasaOracao[];
  itens: Item[];
  conferencias: Conferencia[];
  transferencias: Transferencia[];
}
