import type { ReactNode } from 'react';
import { usePermissao } from './usePermissao';

/**
 * Envolve qualquer ação/botão sensível (`.spec/03` §3.6). Se o usuário não tem
 * a permissão, o conteúdo simplesmente **não renderiza** — nunca `disabled`
 * sem explicação, nunca esconder só com CSS.
 *
 * Regra (`.spec/12` D-07): isto é espelho do que a API já impõe — nunca a
 * única barreira. Se uma ação precisa ser escondida e o endpoint não tem
 * policy, é bug de especificação do backend a reportar.
 */
export function RequerPermissao({
  chave,
  algumaDe,
  children,
  fallback = null,
}: {
  chave?: string;
  algumaDe?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { tem, temAlgumaDe } = usePermissao();

  const liberado = chave ? tem(chave) : algumaDe ? temAlgumaDe(algumaDe) : true;

  return <>{liberado ? children : fallback}</>;
}
