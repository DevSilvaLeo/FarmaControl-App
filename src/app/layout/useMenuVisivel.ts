import { useMemo } from 'react';
import { usePermissao } from '@/compartilhado/auth/usePermissao';
import { menuPrincipal, type ItemMenu } from './menuConfig';

/**
 * Menu filtrado por permissão (`.spec/06` §6.9). Um item aparece se não exige
 * permissão ou se o usuário a tem; um grupo aparece se tiver ≥ 1 filho visível.
 */
export function useMenuVisivel(): ItemMenu[] {
  const { tem } = usePermissao();

  return useMemo(() => {
    const podeVer = (item: ItemMenu): boolean => !item.permissao || tem(item.permissao);

    const filtrar = (itens: ItemMenu[]): ItemMenu[] =>
      itens
        .map((item) => {
          if (!item.filhos) return podeVer(item) ? item : null;
          const filhos = filtrar(item.filhos);
          return filhos.length > 0 ? { ...item, filhos } : null;
        })
        .filter((x): x is ItemMenu => x != null);

    return filtrar(menuPrincipal);
  }, [tem]);
}
