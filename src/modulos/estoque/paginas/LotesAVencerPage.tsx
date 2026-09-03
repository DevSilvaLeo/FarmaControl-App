import { useState } from 'react';
import { Segmented, Skeleton, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { SemaforoValidade } from '@/compartilhado/ui/SemaforoValidade';
import { DataHora } from '@/compartilhado/ui/DataHora';
import { useBreakpoint } from '@/compartilhado/hooks/useBreakpoint';
import { formatarQuantidade } from '@/compartilhado/utils/formatarMoeda';
import { useLotesAVencer } from '../hooks/useEstoque';
import { SelectDeposito } from '../componentes/SelectDeposito';
import type { LoteAVencerDto } from '../tipos';

const JANELAS = [30, 60, 90, 180];

export function LotesAVencerPage() {
  const { ehDesktop } = useBreakpoint();
  const [dias, setDias] = useState(90);
  const [depositoId, setDepositoId] = useState<number>();
  const { data = [], isLoading } = useLotesAVencer(dias, depositoId);

  const colunas: ColumnsType<LoteAVencerDto> = [
    { title: 'Produto', dataIndex: 'produtoDescricao' },
    { title: 'Depósito', dataIndex: 'depositoNome' },
    { title: 'Lote', dataIndex: 'lote', render: (v: string | null) => <span className="mono">{v || '—'}</span> },
    {
      title: 'Validade',
      dataIndex: 'validadeUtc',
      render: (v: string | null) => (v ? <DataHora valorUtc={v} somenteData /> : '—'),
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      align: 'right',
      render: (v: number) => <span className="tabular-nums">{formatarQuantidade(v)}</span>,
    },
    {
      title: 'Dias para vencer',
      dataIndex: 'diasParaVencer',
      render: (v: number) => <SemaforoValidade dias={v} />,
    },
  ];

  return (
    <>
      <PageHeader titulo="Lotes a Vencer" descricao="Semáforo de validade por lote e depósito." />

      <SectionCard titulo="Janela" className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Segmented
            value={dias}
            onChange={(v) => setDias(Number(v))}
            options={JANELAS.map((d) => ({ label: `${d} dias`, value: d }))}
          />
          <div className="sm:max-w-xs sm:flex-1">
            <SelectDeposito value={depositoId ?? null} onChange={(v) => setDepositoId(v ?? undefined)} permitirVazio />
          </div>
        </div>
      </SectionCard>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : data.length === 0 ? (
        <EmptyState titulo="Nenhum lote vencendo nesta janela" />
      ) : ehDesktop ? (
        <Table<LoteAVencerDto>
          rowKey={(r) => `${r.produtoId}-${r.depositoId}-${r.lote ?? ''}`}
          columns={colunas}
          dataSource={data}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((l) => (
            <div
              key={`${l.produtoId}-${l.depositoId}-${l.lote ?? ''}`}
              className="rounded-lg border border-neutral-200 bg-white p-3 text-sm shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-neutral-800">{l.produtoDescricao}</span>
                <SemaforoValidade dias={l.diasParaVencer} />
              </div>
              <div className="mt-1 text-neutral-500">
                {l.depositoNome} · <span className="mono">{l.lote || 's/ lote'}</span> ·{' '}
                <span className="tabular-nums">{formatarQuantidade(l.quantidade)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
