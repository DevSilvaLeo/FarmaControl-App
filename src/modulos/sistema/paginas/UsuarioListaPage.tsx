import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import { CheckOutlined, MinusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { usePaginacao } from '@/compartilhado/hooks/usePaginacao';
import { useDebounce } from '@/compartilhado/hooks/useDebounce';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useListarUsuarios } from '../hooks/useSistema';
import type { UsuarioResumoDto } from '../tipos';

export function UsuarioListaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);
  const buscaDeb = useDebounce(busca, 400);

  const useConsulta = () => {
    const { pagina, tamanhoPagina } = usePaginacao();
    return useListarUsuarios({
      pagina,
      tamanhoPagina,
      termoBusca: buscaDeb.trim() || undefined,
      incluirInativos,
    });
  };

  const colunas: ColunaResponsiva<UsuarioResumoDto>[] = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'Login', dataIndex: 'login', render: (v) => <span className="mono">{v}</span> },
    { title: 'Email', dataIndex: 'email', apenasDesktop: true },
    { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
    {
      title: '2FA',
      dataIndex: 'doisFatoresHabilitado',
      align: 'center',
      apenasDesktop: true,
      render: (v: boolean) =>
        v ? <CheckOutlined className="text-sucesso" /> : <MinusOutlined className="text-neutral-300" />,
    },
  ];

  return (
    <>
      <PageHeader titulo="Usuários" descricao="Contas de acesso ao sistema." />
      <DataTable<UsuarioResumoDto>
        rowKey="id"
        usarConsulta={useConsulta}
        colunas={colunas}
        buscaTextual={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar por nome, login ou email' }}
        qtdFiltrosAtivos={incluirInativos ? 1 : 0}
        temFiltroAtivo={incluirInativos || buscaDeb.trim().length > 0}
        aoLimparFiltros={() => {
          setBusca('');
          setIncluirInativos(false);
        }}
        aoClicarLinha={(u) => navigate(`/sistema/usuarios/${u.id}`)}
        acaoPrincipal={{
          rotulo: 'Novo usuário',
          permissao: Permissoes.UsuariosGerenciar,
          aoClicar: () => navigate('/sistema/usuarios/novo'),
        }}
        renderCardMobile={(u) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{u.nome}</span>
              <StatusTag variante={u.ativo ? 'ativo' : 'inativo'} />
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              <span className="mono">{u.login}</span> · {u.email}
              {u.doisFatoresHabilitado ? ' · 2FA' : ''}
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
