import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { usarListaComoPaged } from '@/compartilhado/hooks/usarListaComoPaged';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useListarPerfis } from '../hooks/useSistema';
import type { PerfilResumoDto } from '../tipos';

export function PerfilListaPage() {
  const navigate = useNavigate();
  const [incluirInativos, setIncluirInativos] = useState(false);
  const useConsulta = () => usarListaComoPaged(useListarPerfis(incluirInativos));

  const colunas: ColunaResponsiva<PerfilResumoDto>[] = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'Descrição', dataIndex: 'descricao', apenasDesktop: true, render: (v) => v || '—' },
    {
      title: 'Tipo',
      dataIndex: 'sistema',
      render: (v: boolean) => (v ? <StatusTag variante="sistema" /> : <span className="text-neutral-400">—</span>),
    },
    { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
  ];

  return (
    <>
      <PageHeader titulo="Perfis e Permissões" descricao="Conjuntos de permissões atribuíveis a usuários." />
      <DataTable<PerfilResumoDto>
        rowKey="id"
        semPaginacao
        usarConsulta={useConsulta}
        colunas={colunas}
        qtdFiltrosAtivos={incluirInativos ? 1 : 0}
        temFiltroAtivo={incluirInativos}
        aoLimparFiltros={() => setIncluirInativos(false)}
        aoClicarLinha={(p) => navigate(`/sistema/perfis/${p.id}`)}
        acaoPrincipal={{
          rotulo: 'Novo perfil',
          permissao: Permissoes.PerfisGerenciar,
          aoClicar: () => navigate('/sistema/perfis/novo'),
        }}
        renderCardMobile={(p) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{p.nome}</span>
              <TagAtivo ativo={p.ativo} />
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              {p.descricao || 'Sem descrição'}
              {p.sistema ? ' · perfil de sistema' : ''}
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
