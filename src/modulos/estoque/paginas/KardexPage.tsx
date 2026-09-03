import { useState } from 'react';
import { Alert, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { DataHora } from '@/compartilhado/ui/DataHora';
import { RangePickerBr } from '@/compartilhado/ui/DatePickerBr';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { normalizarErro } from '@/compartilhado/api/normalizarErro';
import { formatarMoeda, formatarQuantidade } from '@/compartilhado/utils/formatarMoeda';
import { rotular, rotulosOrigemMovimento, rotulosSentidoMovimento } from '@/compartilhado/utils/rotulosEnum';
import { useKardex } from '../hooks/useEstoque';
import { SelectDeposito } from '../componentes/SelectDeposito';
import { SelectProduto } from '../componentes/SelectProduto';
import type { MovimentoEstoqueDto } from '../tipos';

export function KardexPage() {
  const [produtoId, setProdutoId] = useState<number>();
  const [produtoNome, setProdutoNome] = useState('');
  const [depositoId, setDepositoId] = useState<number>();
  const [origem, setOrigem] = useState<string>();
  const [periodo, setPeriodo] = useState<[string | null, string | null] | null>(null);
  const { pagina, tamanhoPagina, irParaPagina } = usePaginacao();

  const params =
    produtoId && periodo?.[0] && periodo?.[1]
      ? {
          produtoId,
          depositoId,
          origem,
          deUtc: periodo[0],
          ateUtc: periodo[1],
          pagina,
          tamanhoPagina,
        }
      : null;

  const { data, isLoading, isError, error } = useKardex(params);
  const erro404 = isError && normalizarErro(error).status === 404;

  const colunas: ColumnsType<MovimentoEstoqueDto> = [
    {
      title: 'Data/hora',
      dataIndex: 'dataMovimentoUtc',
      fixed: 'left',
      render: (v: string) => <DataHora valorUtc={v} />,
    },
    {
      title: 'Sentido',
      dataIndex: 'sentido',
      render: (v: string) => (
        <Tag color={v === 'Entrada' ? 'success' : 'error'}>{rotular(rotulosSentidoMovimento, v)}</Tag>
      ),
    },
    { title: 'Origem', dataIndex: 'origem', render: (v: string) => <Tag>{rotular(rotulosOrigemMovimento, v)}</Tag> },
    { title: 'Motivo', dataIndex: 'motivoAjuste', render: (v: string | null) => v || '—' },
    { title: 'Depósito', dataIndex: 'depositoNome' },
    { title: 'Lote', dataIndex: 'lote', render: (v: string | null) => <span className="mono">{v || '—'}</span> },
    { title: 'Validade', dataIndex: 'validadeUtc', render: (v: string | null) => (v ? <DataHora valorUtc={v} somenteData /> : '—') },
    {
      title: 'Quantidade',
      dataIndex: 'quantidade',
      align: 'right',
      render: (v: number) => <span className="tabular-nums">{formatarQuantidade(v)}</span>,
    },
    {
      title: 'Saldo após',
      dataIndex: 'saldoApos',
      align: 'right',
      fixed: 'right',
      render: (v: number) => (
        <span className="tabular-nums font-semibold text-neutral-800">{formatarQuantidade(v)}</span>
      ),
    },
    {
      title: 'Custo unit.',
      dataIndex: 'custoUnitario',
      align: 'right',
      render: (v: number | null) => (v != null ? formatarMoeda(v) : '—'),
    },
    { title: 'Observação', dataIndex: 'observacao', render: (v: string | null) => v || '—' },
    { title: 'Usuário', dataIndex: 'usuarioNome' },
  ];

  return (
    <>
      <PageHeader titulo="Kardex" descricao="Livro-razão de movimentações de estoque." />

      <SectionCard titulo="Filtros" className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">
              Produto <span className="text-erro">*</span>
            </span>
            <SelectProduto
              value={produtoId ?? null}
              onChange={(id, p) => {
                setProdutoId(id ?? undefined);
                setProdutoNome(p?.descricao ?? '');
              }}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">
              Período <span className="text-erro">*</span>
            </span>
            <RangePickerBr value={periodo} onChange={setPeriodo} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">Depósito</span>
            <SelectDeposito value={depositoId ?? null} onChange={(v) => setDepositoId(v ?? undefined)} permitirVazio />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">Origem</span>
            <Select
              className="w-full"
              allowClear
              placeholder="Todas"
              value={origem}
              onChange={(v) => setOrigem(v)}
              options={[
                { value: 'Avulso', label: rotular(rotulosOrigemMovimento, 'Avulso') },
                { value: 'Ajuste', label: rotular(rotulosOrigemMovimento, 'Ajuste') },
                { value: 'Inventario', label: rotular(rotulosOrigemMovimento, 'Inventario') },
              ]}
            />
          </label>
        </div>
      </SectionCard>

      {params == null ? (
        <EmptyState
          variante="semResultado"
          titulo="Selecione um produto e um período"
          descricao="O Kardex exige produto e intervalo de datas."
        />
      ) : erro404 ? (
        <Alert
          type="warning"
          showIcon
          title="Produto não encontrado"
          description="O produto selecionado não existe mais ou não pertence a esta empresa. Escolha outro produto."
        />
      ) : (
        <>
          <div className="text-sm text-neutral-500">
            {produtoNome} — {data?.totalRegistros ?? 0} movimento(s)
          </div>
          <Table<MovimentoEstoqueDto>
            className="mt-2"
            rowKey="id"
            columns={colunas}
            dataSource={data?.itens ?? []}
            loading={isLoading}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagina,
              pageSize: tamanhoPagina,
              total: data?.totalRegistros ?? 0,
              onChange: irParaPagina,
              showSizeChanger: false,
            }}
          />
        </>
      )}
    </>
  );
}
