import { Permissoes } from '@/compartilhado/auth/permissoes';

/**
 * Mapa rota → permissão exigida (`.spec/02` §2.3) — fonte única, nunca a chave
 * espalhada dentro de cada página. Cada `<Route>` privada aplica
 * `<GuardaPermissao chave={mapaDePermissoes['/rota']}>`.
 *
 * `undefined` = basta estar autenticado.
 */
export const mapaDePermissoes: Record<string, string | undefined> = {
  '/': undefined,
  '/minha-conta': undefined,
  '/diagnostico': undefined,

  '/sistema/usuarios': Permissoes.UsuariosConsultar,
  '/sistema/perfis': Permissoes.PerfisConsultar,
  '/sistema/empresas': Permissoes.EmpresasConsultar,

  '/produtos': Permissoes.ProdutosConsultar,
  '/cadastros/apoio': Permissoes.ProdutosConsultar,
  '/clientes': Permissoes.ClientesConsultar,
  '/fornecedores': Permissoes.FornecedoresConsultar,
  '/transportadoras': Permissoes.FornecedoresConsultar,
  '/representantes': Permissoes.FornecedoresConsultar,
  '/vendedores': Permissoes.VendedoresConsultar,

  '/estoque/depositos': Permissoes.EstoqueConsultar,
  '/estoque/centros-custo': Permissoes.CentrosCustoConsultar,
  '/estoque/parametros': Permissoes.EstoqueConsultar,
  '/estoque/posicao': Permissoes.EstoqueConsultar,
  '/estoque/kardex': Permissoes.EstoqueConsultar,
  '/estoque/lotes-a-vencer': Permissoes.EstoqueConsultar,
  '/estoque/entrada': Permissoes.EstoqueMovimentarEntrada,
  '/estoque/saida': Permissoes.EstoqueMovimentarSaida,
  '/estoque/ajuste': Permissoes.EstoqueAjustar,
};
