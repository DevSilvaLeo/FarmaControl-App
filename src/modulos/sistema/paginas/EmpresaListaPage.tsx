import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Modal, Switch } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { TagAtivo } from '@/compartilhado/ui/StatusTag';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';
import { usarListaComoPaged } from '@/compartilhado/hooks/usarListaComoPaged';
import { formatarCnpj } from '@/compartilhado/utils/cpfCnpj';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { empresaSchema, type EmpresaForm } from '../validacao';
import { useCriarEmpresa, useListarEmpresas } from '../hooks/useSistema';
import type { EmpresaResumoDto } from '../tipos';

export function EmpresaListaPage() {
  const navigate = useNavigate();
  const [incluirInativas, setIncluirInativas] = useState(false);
  const [criando, setCriando] = useState(false);
  const useConsulta = () => usarListaComoPaged(useListarEmpresas(incluirInativas));

  const form = useForm<EmpresaForm>({
    resolver: zodResolver(empresaSchema),
    defaultValues: { razaoSocial: '', nomeFantasia: '', documento: '' },
  });
  const criar = useCriarEmpresa({
    aoCriar: (id) => {
      setCriando(false);
      form.reset();
      navigate(`/sistema/empresas/${id}`);
    },
  });

  const colunas: ColunaResponsiva<EmpresaResumoDto>[] = [
    { title: 'Razão Social', dataIndex: 'razaoSocial' },
    { title: 'Nome Fantasia', dataIndex: 'nomeFantasia', apenasDesktop: true, render: (v) => v || '—' },
    {
      title: 'CNPJ',
      dataIndex: 'documento',
      render: (v: string) => <span className="mono">{formatarCnpj(v)}</span>,
    },
    { title: 'Status', dataIndex: 'ativa', render: (v: boolean) => <TagAtivo ativo={v} /> },
  ];

  return (
    <>
      <PageHeader titulo="Empresas e Filiais" descricao="Empresas do grupo e suas filiais." />
      <DataTable<EmpresaResumoDto>
        rowKey="id"
        semPaginacao
        usarConsulta={useConsulta}
        colunas={colunas}
        qtdFiltrosAtivos={incluirInativas ? 1 : 0}
        temFiltroAtivo={incluirInativas}
        aoLimparFiltros={() => setIncluirInativas(false)}
        aoClicarLinha={(e) => navigate(`/sistema/empresas/${e.id}`)}
        acaoPrincipal={{
          rotulo: 'Nova empresa',
          permissao: Permissoes.EmpresasGerenciar,
          aoClicar: () => setCriando(true),
        }}
        renderCardMobile={(e) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-neutral-800">{e.razaoSocial}</span>
              <TagAtivo ativo={e.ativa} />
            </div>
            <div className="mt-1 text-sm text-neutral-500">
              <span className="mono">{formatarCnpj(e.documento)}</span>
            </div>
          </>
        )}
        filtros={
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <Switch size="small" checked={incluirInativas} onChange={setIncluirInativas} />
            Incluir inativas
          </label>
        }
      />

      <RequerPermissao chave={Permissoes.EmpresasGerenciar}>
        <Modal
          open={criando}
          title="Nova empresa"
          okText="Criar"
          okButtonProps={{ loading: criar.isPending }}
          onOk={form.handleSubmit((v) =>
            criar.mutate({
              razaoSocial: v.razaoSocial,
              nomeFantasia: v.nomeFantasia || undefined,
              documento: v.documento.replace(/\D/g, ''),
            }),
          )}
          onCancel={() => setCriando(false)}
          destroyOnHidden
        >
          <div className="flex flex-col gap-3">
            <CampoTexto control={form.control} name="razaoSocial" label="Razão Social" obrigatorio />
            <CampoTexto control={form.control} name="nomeFantasia" label="Nome Fantasia" />
            <CampoTexto
              control={form.control}
              name="documento"
              label="CNPJ"
              obrigatorio
              mono
              placeholder="00.000.000/0000-00"
            />
          </div>
        </Modal>
      </RequerPermissao>
    </>
  );
}
