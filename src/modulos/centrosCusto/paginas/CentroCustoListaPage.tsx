import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dropdown, Modal, Skeleton, Switch, Table } from 'antd';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { TagAtivo } from '@/compartilhado/ui/StatusTag';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { centroCustoSchema, type CentroCustoForm } from '../validacao';
import { useAcaoCentroCusto, useCentrosCusto, useSalvarCentroCusto } from '../hooks/useCentrosCusto';
import type { CentroCustoDto } from '../api';

function ModalCentroCusto({
  editando,
  aoFechar,
}: {
  editando: CentroCustoDto | 'novo' | null;
  aoFechar: () => void;
}) {
  const id = editando && editando !== 'novo' ? editando.id : undefined;
  const form = useForm<CentroCustoForm>({
    resolver: zodResolver(centroCustoSchema),
    defaultValues: { nome: '', codigo: '' },
  });
  useEffect(() => {
    if (editando && editando !== 'novo') {
      form.reset({ nome: editando.nome, codigo: editando.codigo });
    } else {
      form.reset({ nome: '', codigo: '' });
    }
  }, [editando, form]);

  const salvar = useSalvarCentroCusto(id, { aoSalvar: aoFechar });

  return (
    <Modal
      open={editando != null}
      title={id != null ? 'Editar centro de custo' : 'Novo centro de custo'}
      okText="Salvar"
      okButtonProps={{ loading: salvar.isPending }}
      onOk={form.handleSubmit((v) => salvar.mutate(v))}
      onCancel={aoFechar}
      destroyOnHidden
    >
      <div className="flex flex-col gap-3">
        <CampoTexto control={form.control} name="nome" label="Nome" obrigatorio />
        <CampoTexto control={form.control} name="codigo" label="Código" obrigatorio mono />
      </div>
    </Modal>
  );
}

function AcoesLinha({ c }: { c: CentroCustoDto }) {
  const [editando, setEditando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const acao = useAcaoCentroCusto(c.id);

  return (
    <>
      <RequerPermissao chave={Permissoes.CentrosCustoGerenciar}>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'editar', label: 'Editar', onClick: () => setEditando(true) },
              {
                key: 'status',
                label: c.ativo ? 'Inativar' : 'Reativar',
                danger: c.ativo,
                onClick: () => setConfirmar(true),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} aria-label="Ações" onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      </RequerPermissao>

      {editando && <ModalCentroCusto editando={c} aoFechar={() => setEditando(false)} />}

      <ConfirmDialog
        aberto={confirmar}
        titulo={c.ativo ? 'Inativar este centro de custo?' : 'Reativar este centro de custo?'}
        rotuloConfirmar={c.ativo ? 'Inativar' : 'Reativar'}
        perigo={c.ativo}
        carregando={acao.alterarStatus.isPending}
        aoConfirmar={() => acao.alterarStatus.mutate(!c.ativo, { onSuccess: () => setConfirmar(false) })}
        aoCancelar={() => setConfirmar(false)}
      />
    </>
  );
}

export function CentroCustoListaPage() {
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [modal, setModal] = useState<CentroCustoDto | 'novo' | null>(null);
  const { data: centros = [], isLoading } = useCentrosCusto(incluirInativos);

  return (
    <>
      <PageHeader
        titulo="Centros de custo"
        descricao="Setores para imputar ajustes e perdas de estoque."
        acoes={
          <>
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <Switch size="small" checked={incluirInativos} onChange={setIncluirInativos} />
              Incluir inativos
            </label>
            <RequerPermissao chave={Permissoes.CentrosCustoGerenciar}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal('novo')}>
                Novo centro de custo
              </Button>
            </RequerPermissao>
          </>
        }
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : centros.length === 0 ? (
        <EmptyState
          titulo="Nenhum centro de custo cadastrado"
          descricao="Cadastre ao menos um centro de custo para vincular aos ajustes de estoque."
          acao={
            <RequerPermissao chave={Permissoes.CentrosCustoGerenciar}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal('novo')}>
                Cadastrar centro de custo
              </Button>
            </RequerPermissao>
          }
        />
      ) : (
        <Table<CentroCustoDto>
          rowKey="id"
          dataSource={centros}
          pagination={false}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: 'Nome', dataIndex: 'nome' },
            { title: 'Código', dataIndex: 'codigo', render: (v) => <span className="mono">{v}</span> },
            { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
            { title: '', key: 'acoes', width: 48, render: (_: unknown, c) => <AcoesLinha c={c} /> },
          ]}
        />
      )}

      {modal != null && modal === 'novo' && (
        <ModalCentroCusto editando="novo" aoFechar={() => setModal(null)} />
      )}
    </>
  );
}
