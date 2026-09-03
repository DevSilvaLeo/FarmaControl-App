import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dropdown, Modal, Skeleton, Switch, Table } from 'antd';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { CampoSelect } from '@/compartilhado/ui/campos';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { opcoesDe, rotular, rotulosTipoDeposito } from '@/compartilhado/utils/rotulosEnum';
import { depositoSchema, type DepositoForm } from '../validacao';
import { useAcaoDeposito, useDepositos, useSalvarDeposito } from '../hooks/useEstoque';
import type { DepositoDto } from '../tipos';

function ModalDeposito({
  editando,
  aoFechar,
}: {
  editando: DepositoDto | 'novo' | null;
  aoFechar: () => void;
}) {
  const id = editando && editando !== 'novo' ? editando.id : undefined;
  const form = useForm<DepositoForm>({
    resolver: zodResolver(depositoSchema),
    defaultValues: { nome: '', codigo: '', tipo: 'Principal' },
  });
  useEffect(() => {
    if (editando && editando !== 'novo')
      form.reset({
        nome: editando.nome,
        codigo: editando.codigo,
        tipo: (editando.tipo as DepositoForm['tipo']) ?? 'Principal',
      });
    else form.reset({ nome: '', codigo: '', tipo: 'Principal' });
  }, [editando, form]);

  const salvar = useSalvarDeposito(id, { aoSalvar: aoFechar });

  return (
    <Modal
      open={editando != null}
      title={id != null ? 'Editar depósito' : 'Novo depósito'}
      okText="Salvar"
      okButtonProps={{ loading: salvar.isPending }}
      onOk={form.handleSubmit((v) => salvar.mutate(v))}
      onCancel={aoFechar}
      destroyOnHidden
    >
      <div className="flex flex-col gap-3">
        <CampoTexto control={form.control} name="nome" label="Nome" obrigatorio />
        <CampoTexto control={form.control} name="codigo" label="Código" obrigatorio mono />
        <CampoSelect
          control={form.control}
          name="tipo"
          label="Tipo"
          obrigatorio
          options={opcoesDe(rotulosTipoDeposito)}
        />
      </div>
    </Modal>
  );
}

function AcoesLinha({ d }: { d: DepositoDto }) {
  const [editando, setEditando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const acao = useAcaoDeposito(d.id);

  return (
    <>
      <RequerPermissao chave={Permissoes.EstoqueGerenciarDepositos}>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'editar', label: 'Editar', onClick: () => setEditando(true) },
              !d.padrao && d.ativo
                ? { key: 'padrao', label: 'Definir como padrão', onClick: () => acao.definirPadrao.mutate() }
                : null,
              {
                key: 'status',
                label: d.ativo ? 'Inativar' : 'Reativar',
                danger: d.ativo,
                onClick: () => setConfirmar(true),
              },
            ].filter(Boolean) as { key: string; label: string; onClick: () => void }[],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} aria-label="Ações" onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      </RequerPermissao>

      {editando && <ModalDeposito editando={d} aoFechar={() => setEditando(false)} />}

      <ConfirmDialog
        aberto={confirmar}
        titulo={d.ativo ? 'Inativar este depósito?' : 'Reativar este depósito?'}
        rotuloConfirmar={d.ativo ? 'Inativar' : 'Reativar'}
        perigo={d.ativo}
        carregando={acao.alterarStatus.isPending}
        aoConfirmar={() => acao.alterarStatus.mutate(!d.ativo, { onSuccess: () => setConfirmar(false) })}
        aoCancelar={() => setConfirmar(false)}
      />
    </>
  );
}

export function DepositoListaPage() {
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [modal, setModal] = useState<DepositoDto | 'novo' | null>(null);
  const { data: depositos = [], isLoading } = useDepositos(incluirInativos);

  return (
    <>
      <PageHeader
        titulo="Depósitos"
        descricao="Locais físicos de armazenamento."
        acoes={
          <>
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <Switch size="small" checked={incluirInativos} onChange={setIncluirInativos} />
              Incluir inativos
            </label>
            <RequerPermissao chave={Permissoes.EstoqueGerenciarDepositos}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal('novo')}>
                Novo depósito
              </Button>
            </RequerPermissao>
          </>
        }
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : depositos.length === 0 ? (
        <EmptyState
          titulo="Nenhum depósito cadastrado"
          descricao="Cadastre o depósito principal para começar a movimentar estoque."
          acao={
            <RequerPermissao chave={Permissoes.EstoqueGerenciarDepositos}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal('novo')}>
                Cadastrar depósito
              </Button>
            </RequerPermissao>
          }
        />
      ) : (
        <Table<DepositoDto>
          rowKey="id"
          dataSource={depositos}
          pagination={false}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: 'Nome', dataIndex: 'nome' },
            { title: 'Código', dataIndex: 'codigo', render: (v) => <span className="mono">{v}</span> },
            {
              title: 'Tipo',
              dataIndex: 'tipo',
              render: (v: string) => rotular(rotulosTipoDeposito, v),
            },
            {
              title: 'Padrão',
              dataIndex: 'padrao',
              align: 'center',
              render: (v: boolean) => (v ? <StatusTag variante="padrao" /> : '—'),
            },
            { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
            {
              title: '',
              key: 'acoes',
              width: 48,
              render: (_: unknown, d) => <AcoesLinha d={d} />,
            },
          ]}
        />
      )}

      {modal != null && modal === 'novo' && (
        <ModalDeposito editando="novo" aoFechar={() => setModal(null)} />
      )}
    </>
  );
}
