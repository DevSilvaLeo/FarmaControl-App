import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Switch } from 'antd';
import { CheckOutlined, MinusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { useDebounce } from '@/compartilhado/hooks/useDebounce';
import { formatarMoeda } from '@/compartilhado/utils/formatarMoeda';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useListarProdutos, useGrupos } from '../hooks/useProdutos';
import type { ProdutoResumoDto } from '../tipos';

export function ProdutoListaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [grupoId, setGrupoId] = useState<number>();
  const [incluirInativos, setIncluirInativos] = useState(false);
  const buscaDeb = useDebounce(busca, 400);
  const { data: grupos = [] } = useGrupos();

  const useConsulta = () => {
    const { pagina, tamanhoPagina } = usePaginacao();
    return useListarProdutos({
      pagina,
      tamanhoPagina,
      termoBusca: buscaDeb.trim() || undefined,
      grupoId,
      incluirInativos,
    });
  };

  const qtdFiltros = (grupoId ? 1 : 0) + (incluirInativos ? 1 : 0);

  const colunas: ColunaResponsiva<ProdutoResumoDto>[] = [
    { title: 'Descrição', dataIndex: 'descricao' },
    {
      title: 'Cód. barras',
      dataIndex: 'codigoBarras',
      render: (v) => <span className="mono">{v || '—'}</span>,
    },
    {
      title: 'Preço de venda',
      dataIndex: 'precoVenda',
      align: 'right',
      render: (v: number) => formatarMoeda(v),
    },
    {
      title: 'Controla lote',
      dataIndex: 'controlaLote',
      align: 'center',
      apenasDesktop: true,
      render: (v: boolean) =>
        v ? <CheckOutlined className="text-sucesso" /> : <MinusOutlined className="text-neutral-300" />,
    },
    { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
  ];

  return (
    <>
      <PageHeader titulo="Produtos" descricao="Medicamentos, perfumaria e dermocosméticos." />
      <DataTable<ProdutoResumoDto>
        rowKey="id"
        usarConsulta={useConsulta}
        colunas={colunas}
        buscaTextual={{
          valor: busca,
          aoMudar: setBusca,
          placeholder: 'Buscar por descrição ou código de barras',
        }}
        qtdFiltrosAtivos={qtdFiltros}
        temFiltroAtivo={qtdFiltros > 0 || buscaDeb.trim().length > 0}
        aoLimparFiltros={() => {
          setBusca('');
          setGrupoId(undefined);
          setIncluirInativos(false);
        }}
        aoClicarLinha={(p) => navigate(`/produtos/${p.id}`)}
        acaoPrincipal={{
          rotulo: 'Novo produto',
          permissao: Permissoes.ProdutosGerenciar,
          aoClicar: () => navigate('/produtos/novo'),
        }}
        renderCardMobile={(p) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{p.descricao}</span>
              <StatusTag variante={p.ativo ? 'ativo' : 'inativo'} />
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              <span className="mono">{p.codigoBarras || 's/ código'}</span> ·{' '}
              {formatarMoeda(p.precoVenda)}
              {p.controlaLote ? ' · controla lote' : ''}
            </div>
          </>
        )}
        filtros={
          <>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Grupo"
              className="min-w-[180px]"
              value={grupoId}
              onChange={(v) => setGrupoId(v ?? undefined)}
              options={grupos.map((g) => ({ value: g.id, label: g.nome }))}
            />
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <Switch size="small" checked={incluirInativos} onChange={setIncluirInativos} />
              Incluir inativos
            </label>
          </>
        }
      />
    </>
  );
}
