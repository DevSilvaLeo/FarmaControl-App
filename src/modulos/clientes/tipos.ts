/** Contratos de Cliente — conferidos com o Swagger real (2026-09-03). */

export type TipoPessoa = 'Fisica' | 'Juridica';

export interface ClienteResumoDto {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cpfCnpj: string;
  bloqueado: boolean;
  ativo: boolean;
}

export interface ContatoDto {
  id: number;
  nome: string;
  cargo?: string | null;
  email?: string | null;
  telefone?: string | null;
}

export interface EnderecoEntregaDto {
  id: number;
  destinatario?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidadeId?: number | null;
  ehPadrao: boolean;
}

export type EnderecoCobrancaDto = Omit<EnderecoEntregaDto, 'destinatario'>;

export interface ClienteDto {
  id: number;
  tipoPessoa: string;
  cpfCnpj: string;
  inscricaoEstadualRg?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  ramo?: string | null;
  simplesNacional: boolean;
  orgaoPublico: boolean;
  nascimentoUtc?: string | null;
  segmentoId?: number | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidadeId?: number | null;
  email?: string | null;
  emailFinanceiro?: string | null;
  telefone?: string | null;
  prazoMedioDias?: number | null;
  limiteCredito: number;
  operaSomenteAVista: boolean;
  descontoPadrao?: number | null;
  bloqueado: boolean;
  motivoBloqueio?: string | null;
  alvara?: string | null;
  validadeAlvaraUtc?: string | null;
  responsavelTecnico?: string | null;
  registroConselho?: string | null;
  validadeMinimaProdutoDias?: number | null;
  retemPis: boolean;
  retemCofins: boolean;
  retemIr: boolean;
  retemCsll: boolean;
  retemInss: boolean;
  obsEntrega?: string | null;
  obsFaturamento?: string | null;
  obsAlmoxarifado?: string | null;
  obsNotaFiscal?: string | null;
  obsGeral?: string | null;
  ativo: boolean;
  enderecosEntrega?: EnderecoEntregaDto[];
  enderecosCobranca?: EnderecoCobrancaDto[];
  contatos?: ContatoDto[];
}

/** `DadosCliente` — payload de criação (dentro de `{ dados }`) e de `PUT /clientes/{id}`. */
export interface DadosCliente {
  tipoPessoa?: TipoPessoa;
  cpfCnpjDigitos: string;
  inscricaoEstadualRg?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  ramo?: string | null;
  simplesNacional?: boolean;
  orgaoPublico?: boolean;
  nascimentoUtc?: string | null;
  segmentoId?: number | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidadeId?: number | null;
  email?: string | null;
  emailFinanceiro?: string | null;
  telefone?: string | null;
  prazoMedioDias?: number | null;
  limiteCredito?: number;
  operaSomenteAVista?: boolean;
  descontoPadrao?: number | null;
  alvara?: string | null;
  validadeAlvaraUtc?: string | null;
  responsavelTecnico?: string | null;
  registroConselho?: string | null;
  validadeMinimaProdutoDias?: number | null;
  retemPis?: boolean;
  retemCofins?: boolean;
  retemIr?: boolean;
  retemCsll?: boolean;
  retemInss?: boolean;
  obsEntrega?: string | null;
  obsFaturamento?: string | null;
  obsAlmoxarifado?: string | null;
  obsNotaFiscal?: string | null;
  obsGeral?: string | null;
}

export interface SegmentoDto {
  id: number;
  nome: string;
  orgaoPublico: boolean;
  ativo: boolean;
}
