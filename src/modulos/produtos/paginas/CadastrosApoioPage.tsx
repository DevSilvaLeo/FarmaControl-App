import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input, Modal, Select, Switch, Table, Tabs } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { TagAtivo } from '@/compartilhado/ui/StatusTag';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import { usePermissao } from '@/compartilhado/auth/usePermissao';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { apoioApi } from '../api';
import {
  useDepartamentos,
  useGrupos,
  useLaboratorios,
  useMarcas,
  useSubgrupos,
  useUnidades,
} from '../hooks/useProdutos';

function useInvalidarApoio() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['apoio'] });
}

interface ItemNomeAtivo {
  id: number;
  nome: string;
  ativo: boolean;
}

/** Lista + "novo" para os cadastros de apoio de nome único (Marca, Departamento, Grupo). */
function AbaNome({
  itens,
  carregando,
  aoCriar,
  rotuloSingular,
  podeGerenciar,
}: {
  itens: ItemNomeAtivo[];
  carregando: boolean;
  aoCriar: (nome: string) => Promise<unknown>;
  rotuloSingular: string;
  podeGerenciar: boolean;
}) {
  const invalidar = useInvalidarApoio();
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const criar = useMutacaoComErro((n: string) => aoCriar(n), {
    mensagemSucesso: `${rotuloSingular} criado.`,
    onSuccess: () => {
      void invalidar();
      setAberto(false);
      setNome('');
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {podeGerenciar && (
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAberto(true)}>
            Novo {rotuloSingular.toLowerCase()}
          </Button>
        </div>
      )}
      <Table<ItemNomeAtivo>
        rowKey="id"
        loading={carregando}
        dataSource={itens}
        pagination={false}
        scroll={{ x: 'max-content' }}
        columns={[
          { title: 'Nome', dataIndex: 'nome' },
          { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
        ]}
      />
      <Modal
        open={aberto}
        title={`Novo ${rotuloSingular.toLowerCase()}`}
        okText="Salvar"
        okButtonProps={{ loading: criar.isPending, disabled: !nome.trim() }}
        onOk={() => criar.mutate(nome.trim())}
        onCancel={() => setAberto(false)}
        destroyOnHidden
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-600">Nome *</span>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />
        </label>
      </Modal>
    </div>
  );
}

function AbaSubgrupos({ podeGerenciar }: { podeGerenciar: boolean }) {
  const invalidar = useInvalidarApoio();
  const { data: grupos = [] } = useGrupos();
  const [grupoId, setGrupoId] = useState<number>();
  const { data: subgrupos = [], isLoading } = useSubgrupos(grupoId);
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const criar = useMutacaoComErro(
    (n: string) => apoioApi.criarSubgrupo(grupoId!, n),
    {
      mensagemSucesso: 'Subgrupo criado.',
      onSuccess: () => {
        void invalidar();
        setAberto(false);
        setNome('');
      },
    },
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="max-w-xs">
        <span className="mb-1 block text-sm font-medium text-neutral-600">Grupo</span>
        <Select
          className="w-full"
          placeholder="Selecione o grupo"
          value={grupoId}
          onChange={setGrupoId}
          options={grupos.map((g) => ({ value: g.id, label: g.nome }))}
        />
      </div>
      {podeGerenciar && grupoId != null && (
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAberto(true)}>
            Novo subgrupo
          </Button>
        </div>
      )}
      {grupoId != null && (
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={subgrupos}
          pagination={false}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: 'Nome', dataIndex: 'nome' },
            { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
          ]}
        />
      )}
      <Modal
        open={aberto}
        title="Novo subgrupo"
        okText="Salvar"
        okButtonProps={{ loading: criar.isPending, disabled: !nome.trim() }}
        onOk={() => criar.mutate(nome.trim())}
        onCancel={() => setAberto(false)}
        destroyOnHidden
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-600">Nome *</span>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />
        </label>
      </Modal>
    </div>
  );
}

function AbaUnidades({ podeGerenciar }: { podeGerenciar: boolean }) {
  const invalidar = useInvalidarApoio();
  const { data: unidades = [], isLoading } = useUnidades();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ sigla: '', descricao: '', permiteFracionar: false });
  const criar = useMutacaoComErro(
    () => apoioApi.criarUnidade(form),
    {
      mensagemSucesso: 'Unidade criada.',
      onSuccess: () => {
        void invalidar();
        setAberto(false);
        setForm({ sigla: '', descricao: '', permiteFracionar: false });
      },
    },
  );

  return (
    <div className="flex flex-col gap-3">
      {podeGerenciar && (
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAberto(true)}>
            Nova unidade
          </Button>
        </div>
      )}
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={unidades}
        pagination={false}
        scroll={{ x: 'max-content' }}
        columns={[
          { title: 'Sigla', dataIndex: 'sigla', render: (v) => <span className="mono">{v}</span> },
          { title: 'Descrição', dataIndex: 'descricao' },
          {
            title: 'Fraciona?',
            dataIndex: 'permiteFracionar',
            render: (v: boolean) => (v ? 'Sim' : 'Não'),
          },
          { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
        ]}
      />
      <Modal
        open={aberto}
        title="Nova unidade"
        okText="Salvar"
        okButtonProps={{ loading: criar.isPending, disabled: !form.sigla.trim() || !form.descricao.trim() }}
        onOk={() => criar.mutate()}
        onCancel={() => setAberto(false)}
        destroyOnHidden
      >
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">Sigla *</span>
            <Input
              className="mono"
              value={form.sigla}
              onChange={(e) => setForm((f) => ({ ...f, sigla: e.target.value }))}
              maxLength={10}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">Descrição *</span>
            <Input
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              maxLength={40}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <Switch
              checked={form.permiteFracionar}
              onChange={(v) => setForm((f) => ({ ...f, permiteFracionar: v }))}
            />
            Permite fracionar
          </label>
        </div>
      </Modal>
    </div>
  );
}

function AbaLaboratorios({ podeGerenciar }: { podeGerenciar: boolean }) {
  const invalidar = useInvalidarApoio();
  const { data: labs = [], isLoading } = useLaboratorios();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', cnpj: '' });
  const criar = useMutacaoComErro(
    () => apoioApi.criarLaboratorio(form.nome, form.cnpj || undefined),
    {
      mensagemSucesso: 'Laboratório criado.',
      onSuccess: () => {
        void invalidar();
        setAberto(false);
        setForm({ nome: '', cnpj: '' });
      },
    },
  );

  return (
    <div className="flex flex-col gap-3">
      {podeGerenciar && (
        <div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAberto(true)}>
            Novo laboratório
          </Button>
        </div>
      )}
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={labs}
        pagination={false}
        scroll={{ x: 'max-content' }}
        columns={[
          { title: 'Nome', dataIndex: 'nome' },
          { title: 'CNPJ', dataIndex: 'cnpj', render: (v) => v || '—' },
          { title: 'Status', dataIndex: 'ativo', render: (v: boolean) => <TagAtivo ativo={v} /> },
        ]}
      />
      <Modal
        open={aberto}
        title="Novo laboratório"
        okText="Salvar"
        okButtonProps={{ loading: criar.isPending, disabled: !form.nome.trim() }}
        onOk={() => criar.mutate()}
        onCancel={() => setAberto(false)}
        destroyOnHidden
      >
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">Nome *</span>
            <Input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              maxLength={80}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-600">CNPJ</span>
            <Input
              value={form.cnpj}
              onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
              maxLength={18}
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}

/**
 * Cadastros de apoio da operação (`/cadastros/apoio`) — visão stand-alone dos
 * cadastros que também são criados por modais dentro do formulário de Produto.
 * Backend hoje: criar + listar (edição/inativação entram num passe futuro).
 */
export function CadastrosApoioPage() {
  const { tem } = usePermissao();
  const podeGerenciar = tem(Permissoes.CadastrosApoioGerenciar);
  const marcas = useMarcas();
  const departamentos = useDepartamentos();
  const grupos = useGrupos();

  return (
    <>
      <PageHeader
        titulo="Cadastros de apoio"
        descricao="Marcas, departamentos, grupos, subgrupos, unidades e laboratórios."
      />
      <SectionCard>
        <Tabs
          items={[
            {
              key: 'marcas',
              label: 'Marcas',
              children: (
                <AbaNome
                  itens={marcas.data ?? []}
                  carregando={marcas.isLoading}
                  aoCriar={apoioApi.criarMarca}
                  rotuloSingular="Marca"
                  podeGerenciar={podeGerenciar}
                />
              ),
            },
            {
              key: 'departamentos',
              label: 'Departamentos',
              children: (
                <AbaNome
                  itens={departamentos.data ?? []}
                  carregando={departamentos.isLoading}
                  aoCriar={apoioApi.criarDepartamento}
                  rotuloSingular="Departamento"
                  podeGerenciar={podeGerenciar}
                />
              ),
            },
            {
              key: 'grupos',
              label: 'Grupos',
              children: (
                <AbaNome
                  itens={grupos.data ?? []}
                  carregando={grupos.isLoading}
                  aoCriar={apoioApi.criarGrupo}
                  rotuloSingular="Grupo"
                  podeGerenciar={podeGerenciar}
                />
              ),
            },
            { key: 'subgrupos', label: 'Subgrupos', children: <AbaSubgrupos podeGerenciar={podeGerenciar} /> },
            { key: 'unidades', label: 'Unidades', children: <AbaUnidades podeGerenciar={podeGerenciar} /> },
            {
              key: 'laboratorios',
              label: 'Laboratórios',
              children: <AbaLaboratorios podeGerenciar={podeGerenciar} />,
            },
          ]}
        />
      </SectionCard>
      {!podeGerenciar && (
        <p className="mt-2 text-sm text-neutral-500">Você tem acesso apenas de leitura.</p>
      )}
    </>
  );
}
