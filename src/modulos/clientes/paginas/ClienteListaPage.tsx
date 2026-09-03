import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Switch } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { useDebounce } from '@/compartilhado/hooks/useDebounce';
import { formatarCpfCnpj } from '@/compartilhado/utils/cpfCnpj';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useListarClientes, useSegmentos } from '../hooks/useClientes';
import type { ClienteResumoDto } from '../tipos';

export function ClienteListaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [segmentoId, setSegmentoId] = useState<number>();
  const [incluirInativos, setIncluirInativos] = useState(false);
  const buscaDeb = useDebounce(busca, 400);
  const { data: segmentos = [] } = useSegmentos();

  const useConsulta = () => {
    const { pagina, tamanhoPagina } = usePaginacao();
    return useListarClientes({
      pagina,
      tamanhoPagina,
      termoBusca: buscaDeb.trim() || undefined,
      segmentoId,
      incluirInativos,
    });
  };

  const qtdFiltros = (segmentoId ? 1 : 0) + (incluirInativos ? 1 : 0);

  const colunas: ColunaResponsiva<ClienteResumoDto>[] = [
    { title: 'Razão Social / Nome', dataIndex: 'razaoSocial' },
    { title: 'Nome Fantasia', dataIndex: 'nomeFantasia', apenasDesktop: true, render: (v) => v || '—' },
    {
      title: 'CPF / CNPJ',
      dataIndex: 'cpfCnpj',
      render: (v: string) => <span className="mono">{formatarCpfCnpj(v)}</span>,
    },
    {
      title: 'Bloqueado',
      dataIndex: 'bloqueado',
      align: 'center',
      render: (v: boolean) => (v ? <StatusTag variante="bloqueado" /> : <span className="text-neutral-300">—</span>),
    },
    { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
  ];

  return (
    <>
      <PageHeader titulo="Clientes" descricao="Hospitais, clínicas, farmácias e setor público." />
      <DataTable<ClienteResumoDto>
        rowKey="id"
        usarConsulta={useConsulta}
        colunas={colunas}
        buscaTextual={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar por nome ou CPF/CNPJ' }}
        qtdFiltrosAtivos={qtdFiltros}
        temFiltroAtivo={qtdFiltros > 0 || buscaDeb.trim().length > 0}
        aoLimparFiltros={() => {
          setBusca('');
          setSegmentoId(undefined);
          setIncluirInativos(false);
        }}
        aoClicarLinha={(c) => navigate(`/clientes/${c.id}`)}
        acaoPrincipal={{
          rotulo: 'Novo cliente',
          permissao: Permissoes.ClientesGerenciar,
          aoClicar: () => navigate('/clientes/novo'),
        }}
        renderCardMobile={(c) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{c.razaoSocial}</span>
              {c.bloqueado ? <StatusTag variante="bloqueado" /> : <TagAtivo ativo={c.ativo} />}
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              {c.nomeFantasia ? `${c.nomeFantasia} · ` : ''}
              <span className="mono">{formatarCpfCnpj(c.cpfCnpj)}</span>
            </div>
          </>
        )}
        filtros={
          <>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Segmento"
              className="min-w-[180px]"
              value={segmentoId}
              onChange={(v) => setSegmentoId(v ?? undefined)}
              options={segmentos.map((s) => ({ value: s.id, label: s.nome }))}
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
