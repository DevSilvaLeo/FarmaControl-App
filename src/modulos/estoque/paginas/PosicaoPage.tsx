import { useState } from 'react';
import { Drawer, Switch, Tag } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { SemaforoValidade } from '@/compartilhado/ui/SemaforoValidade';
import { DataHora } from '@/compartilhado/ui/DataHora';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { useDebounce } from '@/compartilhado/hooks/useDebounce';
import { formatarQuantidade } from '@/compartilhado/utils/formatarMoeda';
import { usePosicao, usePosicaoPorLote } from '../hooks/useEstoque';
import { SelectDeposito } from '../componentes/SelectDeposito';
import type { PosicaoEstoqueDto } from '../tipos';

function DrawerLotes({
  aberto,
  produto,
  aoFechar,
}: {
  aberto: boolean;
  produto: { id: number; descricao: string; depositoId: number } | null;
  aoFechar: () => void;
}) {
  const { data = [], isLoading } = usePosicaoPorLote(produto?.id, produto?.depositoId);
  const doDeposito = data.find((d) => d.depositoId === produto?.depositoId) ?? data[0];

  return (
    <Drawer title={produto?.descricao ?? 'Posição por lote'} placement="right" size="large" open={aberto} onClose={aoFechar}>
      {isLoading ? (
        <p className="text-neutral-500">Carregando…</p>
      ) : !doDeposito?.lotes?.length ? (
        <p className="text-neutral-500">Sem saldo por lote neste depósito.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {[...doDeposito.lotes]
            .sort((a, b) => (a.validadeUtc ?? '').localeCompare(b.validadeUtc ?? ''))
            .map((l, i) => (
              <div key={i} className="rounded-md border border-neutral-200 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="mono font-medium text-neutral-800">{l.lote || 's/ lote'}</span>
                  <span className="tabular-nums">{formatarQuantidade(l.quantidade)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-neutral-500">
                  {l.validadeUtc ? <DataHora valorUtc={l.validadeUtc} somenteData /> : '—'}
                  {l.validadeUtc && <SemaforoValidade validadeUtc={l.validadeUtc} />}
                </div>
              </div>
            ))}
        </div>
      )}
    </Drawer>
  );
}

export function PosicaoPage() {
  const [busca, setBusca] = useState('');
  const [depositoId, setDepositoId] = useState<number>();
  const [apenasAbaixo, setApenasAbaixo] = useState(false);
  const buscaDeb = useDebounce(busca, 400);
  const [drawer, setDrawer] = useState<{ id: number; descricao: string; depositoId: number } | null>(null);

  const useConsulta = () => {
    const { pagina, tamanhoPagina } = usePaginacao();
    return usePosicao({
      pagina,
      tamanhoPagina,
      depositoId,
      apenasAbaixoDoMinimo: apenasAbaixo || undefined,
      termoBusca: buscaDeb.trim() || undefined,
    });
  };

  const colunas: ColunaResponsiva<PosicaoEstoqueDto>[] = [
    { title: 'Produto', dataIndex: 'produtoDescricao' },
    { title: 'Depósito', dataIndex: 'depositoNome' },
    {
      title: 'Quantidade',
      dataIndex: 'quantidadeTotal',
      align: 'right',
      render: (v: number) => <span className="tabular-nums">{formatarQuantidade(v)}</span>,
    },
    {
      title: 'Mínimo',
      dataIndex: 'estoqueMinimo',
      align: 'right',
      apenasDesktop: true,
      render: (v: number) => formatarQuantidade(v),
    },
    {
      title: 'Máximo',
      dataIndex: 'estoqueMaximo',
      align: 'right',
      apenasDesktop: true,
      render: (v: number) => formatarQuantidade(v),
    },
    {
      title: '',
      dataIndex: 'abaixoDoMinimo',
      render: (v: boolean) => (v ? <Tag color="error">Abaixo do mínimo</Tag> : null),
    },
  ];

  const qtdFiltros = (depositoId ? 1 : 0) + (apenasAbaixo ? 1 : 0);

  return (
    <>
      <PageHeader titulo="Posição de Estoque" descricao="Saldo consolidado por produto e depósito." />
      <DataTable<PosicaoEstoqueDto>
        rowKey={(r) => `${r.produtoId}-${r.depositoId}`}
        usarConsulta={useConsulta}
        colunas={colunas}
        buscaTextual={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar produto' }}
        qtdFiltrosAtivos={qtdFiltros}
        temFiltroAtivo={qtdFiltros > 0 || buscaDeb.trim().length > 0}
        aoLimparFiltros={() => {
          setBusca('');
          setDepositoId(undefined);
          setApenasAbaixo(false);
        }}
        aoClicarLinha={(r) =>
          setDrawer({ id: r.produtoId, descricao: r.produtoDescricao, depositoId: r.depositoId })
        }
        renderCardMobile={(r) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{r.produtoDescricao}</span>
              {r.abaixoDoMinimo && <Tag color="error">Abaixo do mínimo</Tag>}
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              {r.depositoNome} · <span className="tabular-nums">{formatarQuantidade(r.quantidadeTotal)}</span>
            </div>
          </>
        )}
        filtros={
          <>
            <div className="min-w-[200px]">
              <SelectDeposito value={depositoId ?? null} onChange={(v) => setDepositoId(v ?? undefined)} permitirVazio />
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <Switch size="small" checked={apenasAbaixo} onChange={setApenasAbaixo} />
              Apenas abaixo do mínimo
            </label>
          </>
        }
      />

      <DrawerLotes aberto={drawer != null} produto={drawer} aoFechar={() => setDrawer(null)} />
    </>
  );
}
