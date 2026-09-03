/** Contratos de Parceiros (Fornecedor/Transportadora/Representante) — Swagger real. */

export type TipoPessoa = 'Fisica' | 'Juridica';
export type TipoFrete = 'Cif' | 'Fob';

export interface ParceiroResumoDto {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cpfCnpj: string;
  ativo: boolean;
}

/** Bloco de identificação comum (`.spec/08` §8.2). */
export interface DadosParceiro {
  tipoPessoa?: TipoPessoa;
  cpfCnpjDigitos: string;
  inscricaoEstadualRg?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  ramo?: string | null;
  segmentoId?: number | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidadeId?: number | null;
  email?: string | null;
  telefone?: string | null;
  alvara?: string | null;
  validadeAlvaraUtc?: string | null;
  responsavelTecnico?: string | null;
  registroConselho?: string | null;
}

export interface FornecedorDto extends Omit<DadosParceiro, 'cpfCnpjDigitos'> {
  id: number;
  cpfCnpj: string;
  prazoEntregaDias: number;
  tipoFrete: string;
  participaCotacaoFrete: boolean;
  condicaoPagamentoPadrao?: string | null;
  ativo: boolean;
}

export interface TransportadoraDto extends Omit<DadosParceiro, 'cpfCnpjDigitos'> {
  id: number;
  cpfCnpj: string;
  registroAntt?: string | null;
  tipoFretePadrao: string;
  ativo: boolean;
}

export interface RepresentanteDto {
  id: number;
  tipoPessoa: string;
  cpfCnpj: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  habilitadoAssinarLicitacao: boolean;
  email?: string | null;
  telefone?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidadeId?: number | null;
  ativo: boolean;
}

export interface CriarFornecedorBody {
  dados: DadosParceiro;
  prazoEntregaDias?: number;
  tipoFrete?: TipoFrete;
  participaCotacaoFrete?: boolean;
  condicaoPagamentoPadrao?: string | null;
}
export interface CriarTransportadoraBody {
  dados: DadosParceiro;
  registroAntt?: string | null;
  tipoFretePadrao?: TipoFrete;
}
export interface CriarRepresentanteBody {
  dados: DadosParceiro;
  habilitadoAssinarLicitacao?: boolean;
}
