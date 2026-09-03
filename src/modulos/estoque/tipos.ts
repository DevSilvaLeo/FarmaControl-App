/** Contratos de Estoque — Swagger real (2026-09-03). */

export type TipoDeposito = 'Principal' | 'Reserva' | 'Terceiros';
export type SentidoMovimento = 'Entrada' | 'Saida';
export type MotivoAjuste =
  | 'Perda'
  | 'Quebra'
  | 'Vencimento'
  | 'Achado'
  | 'CorrecaoInventario'
  | 'Outro';

export interface DepositoDto {
  id: number;
  nome: string;
  codigo: string;
  tipo: string;
  padrao: boolean;
  ativo: boolean;
}

export interface PosicaoEstoqueDto {
  produtoId: number;
  produtoDescricao: string;
  depositoId: number;
  depositoNome: string;
  quantidadeTotal: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  abaixoDoMinimo: boolean;
}

export interface SaldoLoteDto {
  lote?: string | null;
  validadeUtc?: string | null;
  quantidade: number;
}

export interface PosicaoProdutoDepositoDto {
  depositoId: number;
  depositoNome: string;
  quantidadeTotal: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  abaixoDoMinimo: boolean;
  lotes?: SaldoLoteDto[];
}

export interface MovimentoEstoqueDto {
  id: number;
  dataMovimentoUtc: string;
  sentido: string;
  origem: string;
  motivoAjuste?: string | null;
  depositoId: number;
  depositoNome: string;
  lote?: string | null;
  validadeUtc?: string | null;
  quantidade: number;
  saldoApos: number;
  custoUnitario?: number | null;
  observacao?: string | null;
  usuarioId: number;
  usuarioNome: string;
}

export interface LoteAVencerDto {
  produtoId: number;
  produtoDescricao: string;
  depositoId: number;
  depositoNome: string;
  lote?: string | null;
  validadeUtc?: string | null;
  quantidade: number;
  diasParaVencer: number;
}

/**
 * Estoque mínimo/máximo efetivo de um produto num depósito. `personalizado=true`
 * quando existe uma linha própria (senão os valores vêm do cadastro do produto).
 */
export interface ParametroEstoqueDepositoDto {
  depositoId: number;
  depositoNome: string;
  estoqueMinimo: number;
  estoqueMaximo: number;
  personalizado: boolean;
}

export interface DefinirParametroEstoqueBody {
  produtoId: number;
  depositoId: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
}

export interface RegistrarEntradaBody {
  depositoId?: number | null;
  produtoId: number;
  lote?: string | null;
  validadeUtc?: string | null;
  quantidade: number;
  custoUnitario?: number | null;
  observacao?: string | null;
}
export interface RegistrarSaidaBody {
  depositoId?: number | null;
  produtoId: number;
  lote?: string | null;
  quantidade: number;
  observacao?: string | null;
}
export interface AjustarEstoqueBody {
  depositoId?: number | null;
  produtoId: number;
  lote?: string | null;
  validadeUtc?: string | null;
  sentido: SentidoMovimento;
  quantidade: number;
  motivo: MotivoAjuste;
  observacao?: string | null;
}
