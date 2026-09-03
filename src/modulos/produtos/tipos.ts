/** Contratos de Produto — conferidos com o Swagger real (2026-09-03). */

export type TipoMedicamento = 'NaoMedicamento' | 'Etico' | 'Generico' | 'Similar' | 'Otc';

export type OrigemMercadoria =
  | 'Nacional'
  | 'EstrangeiraImportacaoDireta'
  | 'EstrangeiraAdquiridaNoMercadoInterno'
  | 'NacionalConteudoImportacaoSuperior40'
  | 'NacionalProcessosProdutivosBasicos'
  | 'NacionalConteudoImportacaoInferiorOuIgual40'
  | 'EstrangeiraImportacaoDiretaSemSimilar'
  | 'EstrangeiraMercadoInternoSemSimilar'
  | 'NacionalConteudoImportacaoSuperior70';

export interface ProdutoResumoDto {
  id: number;
  descricao: string;
  codigoBarras?: string | null;
  precoVenda: number;
  controlaLote: boolean;
  ativo: boolean;
}

export interface ProdutoUnidadeDto {
  unidadeId: number;
  fator: number;
  ehUnidadeCompra: boolean;
  ehUnidadeVenda: boolean;
}

export interface ProdutoDto {
  id: number;
  descricao: string;
  descricaoEtiqueta?: string | null;
  codigoBarras?: string | null;
  codigoBarras2?: string | null;
  codigoReferencia?: string | null;
  departamentoId?: number;
  grupoId?: number;
  subgrupoId?: number | null;
  marcaId?: number | null;
  laboratorioId?: number | null;
  fornecedorPrincipalId?: number | null;
  precoCusto: number;
  custoMedio: number;
  precoVenda: number;
  margemPadrao?: number | null;
  percentualComissao?: number | null;
  unidadeEstoqueId?: number;
  quantidadePorEmbalagem: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  controlaLote: boolean;
  controlaSerie: boolean;
  validadeMinimaDias?: number | null;
  consideraEstoqueInteiro: boolean;
  controlado: boolean;
  monitoradoSngpc: boolean;
  exigeReceita: boolean;
  registroMs?: string | null;
  validadeRegistroMsUtc?: string | null;
  bloqueiaVendaSeRegistroVencido: boolean;
  principioAtivo?: string | null;
  dcb?: string | null;
  tipoMedicamento: TipoMedicamento;
  ncm?: string | null;
  cest?: string | null;
  origemMercadoria: OrigemMercadoria;
  ativo: boolean;
  unidadesAlternativas?: ProdutoUnidadeDto[];
}

/** `DadosProduto` — payload de criação (dentro de `{ dados }`) e de `PUT /produtos/{id}`. */
export interface DadosProduto {
  descricao: string;
  descricaoEtiqueta?: string | null;
  codigoBarras?: string | null;
  codigoBarras2?: string | null;
  codigoReferencia?: string | null;
  departamentoId?: number;
  grupoId?: number;
  subgrupoId?: number | null;
  marcaId?: number | null;
  laboratorioId?: number | null;
  fornecedorPrincipalId?: number | null;
  unidadeEstoqueId?: number;
  quantidadePorEmbalagem?: number;
  estoqueMinimo?: number;
  estoqueMaximo?: number;
  controlaLote?: boolean;
  controlaSerie?: boolean;
  validadeMinimaDias?: number | null;
  consideraEstoqueInteiro?: boolean;
  controlado?: boolean;
  monitoradoSngpc?: boolean;
  exigeReceita?: boolean;
  registroMs?: string | null;
  validadeRegistroMsUtc?: string | null;
  bloqueiaVendaSeRegistroVencido?: boolean;
  principioAtivo?: string | null;
  dcb?: string | null;
  tipoMedicamento?: TipoMedicamento;
  ncm?: string | null;
  cest?: string | null;
  origemMercadoria?: OrigemMercadoria;
  precoCusto?: number;
  precoVenda?: number;
  margemPadrao?: number | null;
  percentualComissao?: number | null;
}

// --- Cadastros de apoio ---
export interface ItemApoioDto {
  id: number;
  nome: string;
  ativo: boolean;
}
export interface SubgrupoDto extends ItemApoioDto {
  grupoId: number;
}
export interface LaboratorioDto extends ItemApoioDto {
  cnpj?: string | null;
}
export interface UnidadeDto {
  id: number;
  sigla: string;
  descricao: string;
  permiteFracionar: boolean;
  ativo: boolean;
}
