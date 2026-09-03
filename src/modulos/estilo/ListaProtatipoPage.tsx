import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Select, Switch } from 'antd';
import type { UseQueryResult } from '@tanstack/react-query';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { TagAtivo } from '@/compartilhado/ui/StatusTag';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { useDebounce } from '@/compartilhado/hooks/useDebounce';
import { formatarMoeda } from '@/compartilhado/utils/formatarMoeda';
import type { PagedResult } from '@/compartilhado/api/tipos';

interface LinhaFake {
  id: number;
  descricao: string;
  codigoBarras: string;
  grupo: string;
  preco: number;
  ativo: boolean;
}

const GRUPOS = ['Analgésicos', 'Antibióticos', 'Dermocosméticos', 'Perfumaria'];

const DADOS: LinhaFake[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  descricao: `Produto exemplo ${String(i + 1).padStart(2, '0')}`,
  codigoBarras: `789${String(1000000000 + i * 7).slice(0, 10)}`,
  grupo: GRUPOS[i % GRUPOS.length],
  preco: 5 + ((i * 37) % 240) + 0.9,
  ativo: i % 6 !== 0,
}));

/**
 * Protótipo de LISTA (`.docs/05` §5.4 critério de pronto). Demonstra os 3
 * breakpoints do `DataTable` (cards → tabela essencial → tabela completa),
 * busca sempre visível e filtros em bottom sheet no mobile — sem código
 * específico de tela de negócio.
 */
export function ListaProtatipoPage() {
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState<string>();
  const [incluirInativos, setIncluirInativos] = useState(false);
  const buscaDeb = useDebounce(busca, 300);

  const qtdFiltros = (grupo ? 1 : 0) + (incluirInativos ? 1 : 0);
  const temFiltroAtivo = qtdFiltros > 0 || buscaDeb.trim().length > 0;

  const limpar = () => {
    setGrupo(undefined);
    setIncluirInativos(false);
    setBusca('');
  };

  const useConsultaFake = (): UseQueryResult<PagedResult<LinhaFake>> => {
    const { pagina, tamanhoPagina } = usePaginacao();
    const filtrados = DADOS.filter(
      (d) =>
        (incluirInativos || d.ativo) &&
        (!grupo || d.grupo === grupo) &&
        (buscaDeb.trim() === '' ||
          d.descricao.toLowerCase().includes(buscaDeb.toLowerCase()) ||
          d.codigoBarras.includes(buscaDeb)),
    );
    const inicio = (pagina - 1) * tamanhoPagina;
    return {
      data: {
        itens: filtrados.slice(inicio, inicio + tamanhoPagina),
        paginaAtual: pagina,
        tamanhoPagina,
        totalRegistros: filtrados.length,
        totalPaginas: Math.max(1, Math.ceil(filtrados.length / tamanhoPagina)),
      },
      isLoading: false,
    } as UseQueryResult<PagedResult<LinhaFake>>;
  };

  const colunas: ColunaResponsiva<LinhaFake>[] = [
    { title: 'Descrição', dataIndex: 'descricao' },
    { title: 'Cód. barras', dataIndex: 'codigoBarras', render: (v) => <span className="mono">{v}</span> },
    { title: 'Grupo', dataIndex: 'grupo', apenasDesktop: true },
    {
      title: 'Preço',
      dataIndex: 'preco',
      align: 'right',
      render: (v: number) => formatarMoeda(v),
    },
    {
      title: 'Status',
      dataIndex: 'ativo',
      apenasDesktop: true,
      render: (v: boolean) => <TagAtivo ativo={v} />,
    },
  ];

  return (
    <>
      <PageHeader
        titulo="Protótipo — Lista"
        descricao={
          <>
            Redimensione a janela: &lt;768 cards · 768–1024 tabela essencial · ≥1024 completa.{' '}
            <Link to="/estilo">voltar ao showcase</Link>
          </>
        }
      />
      <DataTable<LinhaFake>
        rowKey="id"
        usarConsulta={useConsultaFake}
        colunas={colunas}
        buscaTextual={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar por descrição ou código de barras',
        }}
        qtdFiltrosAtivos={qtdFiltros}
        temFiltroAtivo={temFiltroAtivo}
        aoLimparFiltros={limpar}
        acaoPrincipal={{ rotulo: 'Novo', aoClicar: () => undefined }}
        renderCardMobile={(r) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{r.descricao}</span>
              <TagAtivo ativo={r.ativo} />
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              <span className="mono">{r.codigoBarras}</span> · {r.grupo} · {formatarMoeda(r.preco)}
            </div>
          </>
        )}
        filtros={
          <>
            <Select
              allowClear
              placeholder="Grupo"
              className="min-w-[180px]"
              value={grupo}
              onChange={(v) => setGrupo(v ?? undefined)}
              options={GRUPOS.map((g) => ({ value: g, label: g }))}
            />
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <Switch checked={incluirInativos} onChange={setIncluirInativos} size="small" />
              Incluir inativos
            </label>
          </>
        }
      />
    </>
  );
}
