import type { UseQueryResult } from '@tanstack/react-query';
import type { PagedResult } from '@/compartilhado/api/tipos';

/**
 * Adapta o resultado de uma query que devolve `T[]` (endpoints `IReadOnlyList`
 * do backend — Perfis, Empresas, Depósitos…) para o formato `PagedResult<T>`
 * que o `DataTable` espera. Use com `<DataTable semPaginacao>`.
 */
export function usarListaComoPaged<T>(
  q: UseQueryResult<T[]>,
): UseQueryResult<PagedResult<T>> {
  return {
    ...q,
    data: q.data
      ? {
          itens: q.data,
          paginaAtual: 1,
          tamanhoPagina: q.data.length || 1,
          totalRegistros: q.data.length,
          totalPaginas: 1,
        }
      : undefined,
  } as UseQueryResult<PagedResult<T>>;
}
