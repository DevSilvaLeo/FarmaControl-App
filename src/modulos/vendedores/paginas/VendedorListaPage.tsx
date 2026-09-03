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
import { useListarVendedores } from '../hooks/useVendedores';
import type { VendedorResumoDto } from '../tipos';

const sim = (v: boolean) =>
  v ? <CheckOutlined className="text-sucesso" /> : <MinusOutlined className="text-neutral-300" />;

export function VendedorListaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);
  const buscaDeb = useDebounce(busca, 400);

  const useConsulta = () => {
    const { pagina, tamanhoPagina } = usePaginacao();
    return useListarVendedores({
      pagina,
      tamanhoPagina,
      termoBusca: buscaDeb.trim() || undefined,
      incluirInativos,
    });
  };

  const colunas: ColunaResponsiva<VendedorResumoDto>[] = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'Interno', dataIndex: 'interno', align: 'center', apenasDesktop: true, render: sim },
    { title: 'Externo', dataIndex: 'externo', align: 'center', apenasDesktop: true, render: sim },
    {
      title: 'Recebe comissão',
      dataIndex: 'recebeComissao',
      align: 'center',
      apenasDesktop: true,
      render: sim,
    },
    { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
  ];

  return (
    <>
      <PageHeader titulo="Vendedores" descricao="Força de vendas interna e externa." />
      <DataTable<VendedorResumoDto>
        rowKey="id"
        usarConsulta={useConsulta}
        colunas={colunas}
        buscaTextual={{ valor: busca, aoMudar: setBusca, placeholder: 'Buscar por nome' }}
        qtdFiltrosAtivos={incluirInativos ? 1 : 0}
        temFiltroAtivo={incluirInativos || buscaDeb.trim().length > 0}
        aoLimparFiltros={() => {
          setBusca('');
          setIncluirInativos(false);
        }}
        aoClicarLinha={(v) => navigate(`/vendedores/${v.id}`)}
        acaoPrincipal={{
          rotulo: 'Novo vendedor',
          permissao: Permissoes.VendedoresGerenciar,
          aoClicar: () => navigate('/vendedores/novo'),
        }}
        renderCardMobile={(v) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{v.nome}</span>
              <StatusTag variante={v.ativo ? 'ativo' : 'inativo'} />
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              {[v.interno && 'Interno', v.externo && 'Externo', v.recebeComissao && 'Comissão']
                .filter(Boolean)
                .join(' · ') || '—'}
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
