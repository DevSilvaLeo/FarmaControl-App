import { Link } from 'react-router-dom';
import { Alert, Button, Descriptions, Skeleton, Tag } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { useDiagnostico } from '../hooks/useDiagnostico';

function formatarHora(valor: string | undefined): string {
  if (!valor) return '—';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: 'America/Sao_Paulo',
  }).format(data);
}

/**
 * Prova de integração ponta a ponta (`.spec/04` §4.3 item 7): consome
 * `GET /api/diagnostico` via TanStack Query e mostra os dados reais do
 * servidor antes de existir qualquer tela de negócio.
 */
export function DiagnosticoPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useDiagnostico();

  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5138/api';

  return (
    <>
      <PageHeader
        titulo="Diagnóstico"
        descricao={
          <>
            Smoke test da integração com a API. Base: <span className="mono">{baseUrl}</span>
          </>
        }
        acoes={
          <Button onClick={() => void refetch()} loading={isFetching}>
            Atualizar
          </Button>
        }
      />

      {isPending && <Skeleton active paragraph={{ rows: 4 }} />}

      {isError && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível consultar a API"
          description={
            <>
              <p className="mb-1">
                Verifique se a API está no ar em <span className="mono">{baseUrl}</span> e se o CORS
                libera a origem do frontend (<span className="mono">http://localhost:5173</span>).
              </p>
              <p className="mb-0 text-neutral-500">{(error as Error).message}</p>
            </>
          }
        />
      )}

      {data && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 lg:p-6">
          <div className="mb-3">
            <Tag color="success">API respondendo</Tag>
          </div>
          <Descriptions
            column={{ xs: 1, sm: 1, md: 2 }}
            size="small"
            items={[
              {
                key: 'aplicacao',
                label: 'Aplicação',
                children: data.aplicacao ?? data.nome ?? '—',
              },
              { key: 'versao', label: 'Versão', children: data.versao ?? '—' },
              { key: 'ambiente', label: 'Ambiente', children: data.ambiente ?? '—' },
              {
                key: 'hora',
                label: 'Hora do servidor (America/Sao_Paulo)',
                children: formatarHora(data.horaUtc ?? data.dataHoraUtc),
              },
            ]}
          />

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-neutral-500">Resposta bruta</summary>
            <pre className="mono mt-2 overflow-x-auto rounded-md bg-neutral-50 p-3 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <p className="mt-6 text-xs text-neutral-400">
        UI Kit / tokens: <Link to="/estilo">/estilo</Link> (showcase interno — Etapa 1)
      </p>
    </>
  );
}
