import { useEffect, useState } from 'react';

/**
 * Retorna `valor` com atraso de `ms` (`.spec/05` §5.7). Usado por
 * `SelectAutocomplete` e por qualquer campo de busca textual (debounce de
 * 400ms — `.spec/03` §3.9).
 */
export function useDebounce<T>(valor: T, ms = 400): T {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);

  return debounced;
}
