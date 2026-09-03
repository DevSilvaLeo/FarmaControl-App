import type { ReactNode } from 'react';
import { usePermissao } from './usePermissao';
import { AcessoNegadoPage } from '@/app/paginas/AcessoNegadoPage';

/**
 * Guarda de rota por permissão (`.spec/06` §6.10). Se o usuário não tem a
 * permissão, renderiza a página "Acesso negado" — **não** redireciona em
 * silêncio (o usuário precisa entender que o link existe mas ele não tem
 * acesso).
 */
export function GuardaPermissao({
  chave,
  algumaDe,
  children,
}: {
  chave?: string;
  algumaDe?: string[];
  children: ReactNode;
}) {
  const { tem, temAlgumaDe } = usePermissao();
  const liberado = chave ? tem(chave) : algumaDe ? temAlgumaDe(algumaDe) : true;

  return liberado ? <>{children}</> : <AcessoNegadoPage />;
}
