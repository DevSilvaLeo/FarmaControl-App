import { useMemo } from 'react';
import { useSessaoStore } from './sessaoStore';
import { PERFIL_ADMINISTRADOR } from './permissoes';

/**
 * `.spec/03` §3.6 / `.spec/05` §5.6. Lê `perfil.permissoes` da sessão.
 *
 * Etapa 1: sem login real, o `perfil` do store é `null` — para permitir
 * construir e revisar as telas das próximas etapas, um **mock de
 * desenvolvimento** libera tudo quando `VITE_PERMISSOES_MOCK !== 'off'` e o
 * app está em `import.meta.env.DEV`. Em produção, sem perfil ⇒ sem permissão.
 */
export function usePermissao() {
  const perfil = useSessaoStore((s) => s.perfil);

  return useMemo(() => {
    const ehAdmin = perfil?.perfis?.includes(PERFIL_ADMINISTRADOR) ?? false;
    const conjunto = new Set(perfil?.permissoes ?? []);

    const mockLiberado =
      import.meta.env.DEV &&
      perfil == null &&
      import.meta.env.VITE_PERMISSOES_MOCK !== 'off';

    const tem = (chave: string): boolean => {
      if (mockLiberado || ehAdmin) return true;
      return conjunto.has(chave);
    };

    const temAlgumaDe = (chaves: string[]): boolean => {
      if (mockLiberado || ehAdmin) return true;
      return chaves.some((c) => conjunto.has(c));
    };

    return { tem, temAlgumaDe, ehAdmin, autenticado: perfil != null, mockLiberado };
  }, [perfil]);
}
