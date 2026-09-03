import { formatarData, formatarDataHora } from '@/compartilhado/utils/datas';

/**
 * Componente de EXIBIÇÃO de data/hora (`.spec/03` §3.7). Converte o ISO/UTC da
 * API para `America/Sao_Paulo`. Proibido formatar data à mão na tela.
 */
export function DataHora({
  valorUtc,
  somenteData = false,
}: {
  valorUtc: string | null | undefined;
  somenteData?: boolean;
}) {
  const texto = somenteData ? formatarData(valorUtc) : formatarDataHora(valorUtc);
  return (
    <time dateTime={valorUtc ?? undefined} className="mono whitespace-nowrap">
      {texto}
    </time>
  );
}
