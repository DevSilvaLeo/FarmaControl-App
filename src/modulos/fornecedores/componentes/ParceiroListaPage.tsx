import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import type { UseQueryResult } from '@tanstack/react-query';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { useDebounce } from '@/compartilhado/hooks/useDebounce';
import { formatarCpfCnpj } from '@/compartilhado/utils/cpfCnpj';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import type { PagedResult } from '@/compartilhado/api/tipos';
import type { ParceiroResumoDto } from '../tipos';

/** Lista genérica para Fornecedor / Transportadora / Representante (`.spec/08` §8.1). */
export function ParceiroListaPage({
  titulo,
  descricao,
  rotaBase,
  semPaginacao = false,
  usarConsulta,
  colunasExtra = [],
}: {
  titulo: string;
  descricao: string;
  rotaBase: string;
  semPaginacao?: boolean;
  usarConsulta: (params: {
    pagina: number;
    tamanhoPagina: number;
    termoBusca?: string;
    incluirInativos: boolean;
  }) => UseQueryResult<PagedResult<ParceiroResumoDto>>;
  colunasExtra?: ColunaResponsiva<ParceiroResumoDto>[];
}) {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);
  const buscaDeb = useDebounce(busca, 400);

  const useConsulta = () => {
    const { pagina, tamanhoPagina } = usePaginacao();
    return usarConsulta({
      pagina,
      tamanhoPagina,
      termoBusca: buscaDeb.trim() || undefined,
      incluirInativos,
    });
  };

  const colunas: ColunaResponsiva<ParceiroResumoDto>[] = [
    { title: 'Razão Social / Nome', dataIndex: 'razaoSocial' },
    { title: 'Nome Fantasia', dataIndex: 'nomeFantasia', apenasDesktop: true, render: (v) => v || '—' },
    {
      title: 'CPF / CNPJ',
      dataIndex: 'cpfCnpj',
      render: (v: string) => <span className="mono">{formatarCpfCnpj(v)}</span>,
    },
    ...colunasExtra,
    { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
  ];

  return (
    <>
      <PageHeader titulo={titulo} descricao={descricao} />
      <DataTable<ParceiroResumoDto>
        rowKey="id"
        semPaginacao={semPaginacao}
        usarConsulta={useConsulta}
        colunas={colunas}
        buscaTextual={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar por nome ou CPF/CNPJ' }}
        qtdFiltrosAtivos={incluirInativos ? 1 : 0}
        temFiltroAtivo={incluirInativos || buscaDeb.trim().length > 0}
        aoLimparFiltros={() => {
          setBusca('');
          setIncluirInativos(false);
        }}
        aoClicarLinha={(p) => navigate(`${rotaBase}/${p.id}`)}
        acaoPrincipal={{
          rotulo: `Novo ${titulo.toLowerCase().replace(/s$/, '')}`,
          permissao: Permissoes.FornecedoresGerenciar,
          aoClicar: () => navigate(`${rotaBase}/novo`),
        }}
        renderCardMobile={(p) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{p.razaoSocial}</span>
              <StatusTag variante={p.ativo ? 'ativo' : 'inativo'} />
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              {p.nomeFantasia ? `${p.nomeFantasia} · ` : ''}
              <span className="mono">{formatarCpfCnpj(p.cpfCnpj)}</span>
            </div>
          </>
        )}
        filtros={
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <Switch size="small" checked={incluirInativos} onChange={setIncluirInativos} />
            Incluir inativos
          </label>
        }
      />
    </>
  );
}
