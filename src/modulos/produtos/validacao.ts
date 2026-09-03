import { z } from 'zod';

/**
 * Espelha `DadosProdutoValidator` do backend
 * (`FarmaControl.Application/Produtos/GerenciarProdutos.cs`):
 *   Descricao NotEmpty max 120 · Departamento/Grupo/UnidadeEstoque > 0 ·
 *   PrecoVenda > 0 · PrecoCusto >= 0 · QuantidadePorEmbalagem > 0 ·
 *   CodigoBarras max 50 · Ncm ^\d{8}$ quando informado ·
 *   ValidadeMinimaDias > 0 quando informado.
 */
const textoOpcional = (max: number) =>
  z.string().max(max, `Máximo de ${max} caracteres`).optional().or(z.literal(''));

export const produtoSchema = z.object({
  // Dados gerais
  descricao: z.string().min(1, 'Informe a descrição').max(120, 'Máximo de 120 caracteres'),
  descricaoEtiqueta: textoOpcional(60),
  codigoBarras: textoOpcional(50),
  codigoBarras2: textoOpcional(50),
  codigoReferencia: textoOpcional(50),

  // Classificação
  departamentoId: z.number({ message: 'Selecione o departamento' }).positive('Selecione o departamento'),
  grupoId: z.number({ message: 'Selecione o grupo' }).positive('Selecione o grupo'),
  subgrupoId: z.number().positive().nullable().optional(),
  marcaId: z.number().positive().nullable().optional(),
  laboratorioId: z.number().positive().nullable().optional(),
  fornecedorPrincipalId: z.number().positive().nullable().optional(),
  tipoMedicamento: z.enum(['NaoMedicamento', 'Etico', 'Generico', 'Similar', 'Otc']),

  // Estoque
  unidadeEstoqueId: z.number({ message: 'Selecione a unidade' }).positive('Selecione a unidade'),
  quantidadePorEmbalagem: z.number().positive('Deve ser maior que zero'),
  estoqueMinimo: z.number().nonnegative().optional(),
  estoqueMaximo: z.number().nonnegative().optional(),
  controlaLote: z.boolean().optional(),
  controlaSerie: z.boolean().optional(),
  validadeMinimaDias: z.number().positive('Deve ser maior que zero').nullable().optional(),
  consideraEstoqueInteiro: z.boolean().optional(),

  // Preços
  precoCusto: z.number().nonnegative('Não pode ser negativo'),
  precoVenda: z.number().positive('Preço de venda deve ser maior que zero'),
  margemPadrao: z.number().nonnegative().nullable().optional(),
  percentualComissao: z.number().nonnegative().nullable().optional(),

  // Regulatório
  controlado: z.boolean().optional(),
  monitoradoSngpc: z.boolean().optional(),
  exigeReceita: z.boolean().optional(),
  registroMs: textoOpcional(40),
  validadeRegistroMsUtc: z.string().nullable().optional(),
  bloqueiaVendaSeRegistroVencido: z.boolean().optional(),
  principioAtivo: textoOpcional(120),
  dcb: textoOpcional(20),

  // Fiscal
  ncm: z
    .string()
    .regex(/^\d{8}$/, 'NCM deve ter 8 dígitos')
    .optional()
    .or(z.literal('')),
  cest: textoOpcional(9),
  origemMercadoria: z.enum([
    'Nacional',
    'EstrangeiraImportacaoDireta',
    'EstrangeiraAdquiridaNoMercadoInterno',
    'NacionalConteudoImportacaoSuperior40',
    'NacionalProcessosProdutivosBasicos',
    'NacionalConteudoImportacaoInferiorOuIgual40',
    'EstrangeiraImportacaoDiretaSemSimilar',
    'EstrangeiraMercadoInternoSemSimilar',
    'NacionalConteudoImportacaoSuperior70',
  ]),
});

export type ProdutoForm = z.infer<typeof produtoSchema>;

export const precosSchema = z.object({
  precoCusto: z.number().nonnegative('Não pode ser negativo'),
  precoVenda: z.number().positive('Deve ser maior que zero'),
  margemPadrao: z.number().nonnegative().nullable().optional(),
  percentualComissao: z.number().nonnegative().nullable().optional(),
});
export type PrecosForm = z.infer<typeof precosSchema>;
