import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Input, Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { formatarCnpj } from '@/compartilhado/utils/cpfCnpj';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { useCriarFilial, useEmpresa, useFiliais } from '../hooks/useSistema';

export function EmpresaDetalhePage() {
  const { id } = useParams();
  const empresaId = Number(id);
  const valido = Number.isFinite(empresaId);
  const { data: empresa, isLoading, isError } = useEmpresa(valido ? empresaId : undefined);
  const { data: filiais = [], isLoading: carregandoFiliais } = useFiliais(valido ? empresaId : undefined);

  const [nome, setNome] = useState('');
  const criarFilial = useCriarFilial(empresaId, { aoCriar: () => setNome('') });

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !empresa) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <DetailPage
      titulo={empresa.razaoSocial}
      subtitulo={empresa.nomeFantasia}
      statusTag={<StatusTag variante={empresa.ativo ? 'ativo' : 'inativo'} />}
      voltarPara="/sistema/empresas"
    >
      <SectionCard titulo="Dados">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-neutral-500">CNPJ</dt>
            <dd className="m-0 mono text-neutral-800">{formatarCnpj(empresa.documento)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Nome Fantasia</dt>
            <dd className="m-0 text-neutral-800">{empresa.nomeFantasia || '—'}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard titulo="Filiais">
        {carregandoFiliais ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : filiais.length === 0 ? (
          <EmptyState titulo="Nenhuma filial cadastrada" descricao="Adicione a primeira filial abaixo." />
        ) : (
          <ul className="m-0 mb-3 flex list-none flex-col gap-2 p-0">
            {filiais.map((f) => (
              <li
                key={f.id}
                className="rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-800"
              >
                {f.nome}
              </li>
            ))}
          </ul>
        )}

        <RequerPermissao chave={Permissoes.EmpresasGerenciar}>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (nome.trim()) criarFilial.mutate(nome.trim());
            }}
          >
            <Input
              className="sm:max-w-xs"
              placeholder="Nome da nova filial"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlusOutlined />}
              loading={criarFilial.isPending}
              disabled={!nome.trim()}
            >
              Adicionar filial
            </Button>
          </form>
        </RequerPermissao>
      </SectionCard>
    </DetailPage>
  );
}
