/** Contratos de Vendedor — Swagger real. */

export interface VendedorResumoDto {
  id: number;
  nome: string;
  interno: boolean;
  externo: boolean;
  recebeComissao: boolean;
  ativo: boolean;
}

/** Meta como o backend devolve (`GET /vendedores/{id}` → `metas`). */
export interface MetaComissaoDto {
  metaInicioUtc: string;
  metaFimUtc: string;
  valorMeta: number;
  percentualComissao: number;
}

/** Faixa como o backend recebe (`PUT /vendedores/{id}/metas`). */
export interface FaixaMetaEntrada {
  inicioUtc: string;
  fimUtc: string;
  valorMeta: number;
  percentualComissao: number;
}

export interface VendedorDto {
  id: number;
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  interno: boolean;
  externo: boolean;
  recebeComissao: boolean;
  comissaoPercentualFixo?: number | null;
  comissaoPorMargem: boolean;
  usuarioId?: number | null;
  ativo: boolean;
  metas?: MetaComissaoDto[];
}

export interface DadosVendedor {
  nome: string;
  cpf?: string | null;
  email?: string | null;
  telefone?: string | null;
  interno?: boolean;
  externo?: boolean;
  recebeComissao?: boolean;
  comissaoPercentualFixo?: number | null;
  comissaoPorMargem?: boolean;
  usuarioId?: number | null;
}

export interface DebitoVendedorDto {
  id: number;
  competenciaUtc: string;
  valor: number;
  motivo: string;
}
