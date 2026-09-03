import { Timeline } from 'antd';
import { formatarDataHora } from '@/compartilhado/utils/datas';

/**
 * Linha do tempo de transições de status (`.docs/04` §4.2). ANTECIPADO na
 * Etapa 1 sem uso imediato: Pedido (Fase 6) e OS (Fase 8+) precisam do mesmo
 * padrão visual — recomendação de `.spec/10` §10.2.
 */
export interface EventoStatus {
  status: string;
  usuario?: string;
  dataHoraUtc: string;
  observacao?: string;
  cor?: string;
}

export function LinhaDoTempoDeStatus({ eventos }: { eventos: EventoStatus[] }) {
  if (eventos.length === 0) {
    return <p className="text-sm text-neutral-500">Sem histórico de status.</p>;
  }

  return (
    <Timeline
      items={eventos.map((e) => ({
        color: e.cor ?? 'blue',
        children: (
          <div>
            <p className="m-0 font-medium text-neutral-800">{e.status}</p>
            <p className="m-0 text-xs text-neutral-500">
              {formatarDataHora(e.dataHoraUtc)}
              {e.usuario ? ` · ${e.usuario}` : ''}
            </p>
            {e.observacao ? (
              <p className="m-0 mt-1 text-sm text-neutral-600">{e.observacao}</p>
            ) : null}
          </div>
        ),
      }))}
    />
  );
}
