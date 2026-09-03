import { Tag } from 'antd';
import { semaforoValidade } from '@/compartilhado/tema/tokens';
import { diasParaVencer } from '@/compartilhado/utils/datas';

/**
 * Semáforo de validade/vencimento (`.docs/01` §1.5). Uso único para Lotes a
 * Vencer, validade de alvará e de registro MS.
 *
 * A cor NUNCA é o único indicador — o texto sempre mostra o número de dias.
 */

type Faixa = 'vencido' | 'ate7' | 'ate30' | 'ate90' | 'acima90';

function faixaDe(dias: number): Faixa {
  if (dias <= 0) return 'vencido';
  if (dias <= 7) return 'ate7';
  if (dias <= 30) return 'ate30';
  if (dias <= 90) return 'ate90';
  return 'acima90';
}

const textoFaixa: Record<Faixa, string> = {
  ate90: '#1E293B', // amarelo exige texto escuro (contraste AA — .docs/01 §1.7)
  vencido: '#FFFFFF',
  ate7: '#FFFFFF',
  ate30: '#FFFFFF',
  acima90: '#FFFFFF',
};

function rotularDias(dias: number): string {
  if (dias === 0) return 'vence hoje';
  if (dias < 0) return `venceu há ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'}`;
  return `faltam ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

export function SemaforoValidade({
  dias,
  validadeUtc,
}: {
  dias?: number | null;
  validadeUtc?: string | null;
}) {
  const n = dias ?? (validadeUtc != null ? diasParaVencer(validadeUtc) : null);
  if (n == null) return <span className="text-neutral-400">—</span>;

  const faixa = faixaDe(n);
  return (
    <Tag
      style={{
        backgroundColor: semaforoValidade[faixa],
        color: textoFaixa[faixa],
        borderColor: 'transparent',
        marginInlineEnd: 0,
      }}
    >
      {rotularDias(n)}
    </Tag>
  );
}
