/**
 * Chaves de permissão — **as mesmas strings** que `PermissoesConhecidas` define
 * no backend (`.spec/03` §3.6, `agents.md` §14.4). Nunca usar string solta de
 * permissão espalhada nas telas — sempre uma constante daqui.
 *
 * Valor inicial documentado a partir do que se conhece hoje; na Etapa 3 esta
 * lista é conferida contra `GET /api/permissoes`.
 */
export const Permissoes = {
  // Sistema / RBAC
  UsuariosConsultar: 'Usuarios.Consultar',
  UsuariosGerenciar: 'Usuarios.Gerenciar',
  PerfisConsultar: 'Perfis.Consultar',
  PerfisGerenciar: 'Perfis.Gerenciar',
  EmpresasConsultar: 'Empresas.Consultar',
  EmpresasGerenciar: 'Empresas.Gerenciar',

  // Geografia
  GeografiaConsultar: 'Geografia.Consultar',
  GeografiaGerenciar: 'Geografia.Gerenciar',

  // Cadastros
  ProdutosConsultar: 'Produtos.Consultar',
  ProdutosGerenciar: 'Produtos.Gerenciar',
  ClientesConsultar: 'Clientes.Consultar',
  ClientesGerenciar: 'Clientes.Gerenciar',
  CadastrosApoioGerenciar: 'CadastrosApoio.Gerenciar',

  // Fornecedores e força de vendas
  FornecedoresConsultar: 'Fornecedores.Consultar',
  FornecedoresGerenciar: 'Fornecedores.Gerenciar',
  VendedoresConsultar: 'Vendedores.Consultar',
  VendedoresGerenciar: 'Vendedores.Gerenciar',

  // Estoque
  EstoqueConsultar: 'Estoque.Consultar',
  EstoqueGerenciarDepositos: 'Estoque.GerenciarDepositos',
  EstoqueGerenciarParametros: 'Estoque.GerenciarParametros',
  EstoqueMovimentarEntrada: 'Estoque.MovimentarEntrada',
  EstoqueMovimentarSaida: 'Estoque.MovimentarSaida',
  EstoqueAjustar: 'Estoque.Ajustar',
  EstoqueInventariar: 'Estoque.Inventariar',

  // Centros de custo
  CentrosCustoConsultar: 'CentrosCusto.Consultar',
  CentrosCustoGerenciar: 'CentrosCusto.Gerenciar',
} as const;

export type ChavePermissao = (typeof Permissoes)[keyof typeof Permissoes];

/** Perfil que sempre tem acesso a tudo (espelha o handler do backend). */
export const PERFIL_ADMINISTRADOR = 'Administrador';
