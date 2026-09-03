import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PAGINACAO_PADRAO,
  TAMANHO_PAGINA_MAXIMO,
  type ParametrosPaginacao,
} from '@/compartilhado/api/tipos';

/**
 * Lê/escreve `pagina` e `tamanhoPagina` na query string (`.spec/05` §5.7,
 * `.spec/03` §3.9) — permite compartilhar o link e voltar sem perder a página.
 * 1-based, padrão 20, máximo 100.
 */
export function usePaginacao(): ParametrosPaginacao & {
  irParaPagina: (pagina: number) => void;
  definirTamanhoPagina: (tamanho: number) => void;
} {
  const [params, setParams] = useSearchParams();

  const pagina = Math.max(1, Number.parseInt(params.get('pagina') ?? '', 10) || PAGINACAO_PADRAO.pagina);
  const tamanhoPagina = Math.min(
    TAMANHO_PAGINA_MAXIMO,
    Math.max(
      1,
      Number.parseInt(params.get('tamanhoPagina') ?? '', 10) || PAGINACAO_PADRAO.tamanhoPagina,
    ),
  );

  const irParaPagina = useCallback(
    (novaPagina: number) => {
      setParams(
        (atual) => {
          atual.set('pagina', String(Math.max(1, novaPagina)));
          return atual;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const definirTamanhoPagina = useCallback(
    (tamanho: number) => {
      setParams(
        (atual) => {
          atual.set('tamanhoPagina', String(Math.min(TAMANHO_PAGINA_MAXIMO, Math.max(1, tamanho))));
          atual.set('pagina', '1');
          return atual;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return useMemo(
    () => ({ pagina, tamanhoPagina, irParaPagina, definirTamanhoPagina }),
    [pagina, tamanhoPagina, irParaPagina, definirTamanhoPagina],
  );
}
