/**
 * Contratos transversais da API (`.spec/03` §3.5 e §3.9). Espelham os tipos
 * genéricos do backend (`ProblemDetails` estendido, `PagedResult<T>`,
 * `ParametrosPaginacao`). Os DTOs específicos de cada módulo vêm de
 * `src/tipos/api.gerado.ts` (openapi-typescript).
 */

/** Erro normalizado — toda resposta de erro da API vira isto antes da tela. */
export interface ErroApi {
  status: number;
  mensagem: string;
  codigoErro?: string;
  /** Erros de validação por campo (respostas 400). */
  erros?: Record<string, string[]>;
}

/** Página de resultados — 1-based, espelha `PagedResult<T>` do backend. */
export interface PagedResult<T> {
  itens: T[];
  paginaAtual: number;
  tamanhoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
}

/** Parâmetros de paginação — 1-based, padrão 20, máximo 100 (`.spec/03` §3.9). */
export interface ParametrosPaginacao {
  pagina: number;
  tamanhoPagina: number;
}

export const PAGINACAO_PADRAO: ParametrosPaginacao = {
  pagina: 1,
  tamanhoPagina: 20,
};

export const TAMANHO_PAGINA_MAXIMO = 100;
