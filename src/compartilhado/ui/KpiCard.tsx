import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Card de indicador do Painel (`.docs/04` §4.2, `.docs/09` §9.6). Clicável para
 * a lista filtrada correspondente. Mobile: empilha; `lg:`: entra num grid.
 */
export type SeveridadeKpi = 'neutro' | 'positivo' | 'atencao' | 'critico';

const realce: Record<SeveridadeKpi, string> = {
  neutro: 'border-l-primary-600',
  positivo: 'border-l-sucesso',
  atencao: 'border-l-alerta',
  critico: 'border-l-erro',
};

export function KpiCard({
  rotulo,
  valor,
  detalhe,
  icone: Icone,
  severidade = 'neutro',
  para,
}: {
  rotulo: string;
  valor: ReactNode;
  detalhe?: ReactNode;
  icone?: ComponentType<{ className?: string }>;
  severidade?: SeveridadeKpi;
  para?: string;
}) {
  const conteudo = (
    <div
      className={`flex h-full items-start justify-between gap-3 rounded-lg border border-neutral-200 border-l-4 bg-white p-4 shadow-sm ${realce[severidade]}`}
    >
      <div className="min-w-0">
        <p className="m-0 text-sm text-neutral-500">{rotulo}</p>
        <p className="m-0 mt-1 text-2xl font-semibold text-neutral-800">{valor}</p>
        {detalhe != null && <p className="m-0 mt-1 text-xs text-neutral-500">{detalhe}</p>}
      </div>
      {Icone != null && <Icone className="shrink-0 text-xl text-neutral-300" />}
    </div>
  );

  if (para) {
    return (
      <Link to={para} className="block h-full no-underline">
        {conteudo}
      </Link>
    );
  }
  return conteudo;
}
