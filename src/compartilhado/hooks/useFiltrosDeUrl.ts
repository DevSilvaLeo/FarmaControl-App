import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type ValorFiltro = string | number | boolean | undefined | null;

/**
 * Sincroniza um objeto de filtros de tela com a query string (`.spec/05` §5.7)
 * — mantém o filtro ao navegar e voltar. Chaves reservadas de paginação
 * (`pagina`, `tamanhoPagina`) são ignoradas aqui (ver `usePaginacao`).
 *
 * `padrao` define o formato e os valores default; só o que difere do default
 * vai para a URL (mantém o link limpo).
 */
export function useFiltrosDeUrl<T extends Record<string, ValorFiltro>>(
  padrao: T,
): [T, (parciais: Partial<T>) => void, () => void] {
  const [params, setParams] = useSearchParams();

  const filtros = useMemo(() => {
    const resultado = { ...padrao };
    for (const chave of Object.keys(padrao) as (keyof T)[]) {
      const bruto = params.get(String(chave));
      if (bruto == null) continue;
      const valorPadrao = padrao[chave];
      if (typeof valorPadrao === 'number') {
        resultado[chave] = (Number(bruto) as T[keyof T]) ?? valorPadrao;
      } else if (typeof valorPadrao === 'boolean') {
        resultado[chave] = (bruto === 'true') as T[keyof T];
      } else {
        resultado[chave] = bruto as T[keyof T];
      }
    }
    return resultado;
  }, [params, padrao]);

  const definirFiltros = useCallback(
    (parciais: Partial<T>) => {
      setParams(
        (atual) => {
          for (const [chave, valor] of Object.entries(parciais)) {
            const ehDefault =
              valor == null || valor === '' || valor === padrao[chave as keyof T];
            if (ehDefault) atual.delete(chave);
            else atual.set(chave, String(valor));
          }
          atual.set('pagina', '1');
          return atual;
        },
        { replace: true },
      );
    },
    [setParams, padrao],
  );

  const limparFiltros = useCallback(() => {
    setParams(
      (atual) => {
        for (const chave of Object.keys(padrao)) atual.delete(chave);
        atual.set('pagina', '1');
        return atual;
      },
      { replace: true },
    );
  }, [setParams, padrao]);

  return [filtros, definirFiltros, limparFiltros];
}
