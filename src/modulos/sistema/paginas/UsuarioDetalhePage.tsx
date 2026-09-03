import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Checkbox, Input, Modal, Skeleton, Transfer } from 'antd';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { useBreakpoint } from '@/compartilhado/hooks/useBreakpoint';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import {
  useAlterarStatusUsuario,
  useDefinirPerfisDoUsuario,
  useListarPerfis,
  useRedefinirSenhaUsuario,
  useUsuario,
} from '../hooks/useSistema';

function SeletorPerfis({ id, atuais }: { id: number; atuais: string[] }) {
  const { ehDesktop } = useBreakpoint();
  const { data: perfis = [] } = useListarPerfis();
  const [selecionados, setSelecionados] = useState<string[]>(atuais);
  useEffect(() => setSelecionados(atuais), [atuais]);

  const definir = useDefinirPerfisDoUsuario(id);
  const nomes = perfis.map((p) => p.nome);
  const mudou = JSON.stringify([...selecionados].sort()) !== JSON.stringify([...atuais].sort());

  return (
    <div className="flex flex-col gap-3">
      {ehDesktop ? (
        <Transfer
          dataSource={nomes.map((n) => ({ key: n, title: n }))}
          titles={['Disponíveis', 'Atribuídos']}
          targetKeys={selecionados}
          onChange={(keys) => setSelecionados(keys as string[])}
          render={(item) => item.title}
          listStyle={{ width: '100%', height: 260 }}
        />
      ) : (
        <Checkbox.Group
          className="flex flex-col gap-2"
          value={selecionados}
          onChange={(v) => setSelecionados(v as string[])}
          options={nomes.map((n) => ({ label: n, value: n }))}
        />
      )}
      <div>
        <Button
          type="primary"
          disabled={!mudou}
          loading={definir.isPending}
          onClick={() => definir.mutate(selecionados)}
        >
          Salvar perfis
        </Button>
      </div>
    </div>
  );
}

export function UsuarioDetalhePage() {
  const { id } = useParams();
  const usuarioId = Number(id);
  const { data: usuario, isLoading, isError } = useUsuario(Number.isFinite(usuarioId) ? usuarioId : undefined);

  const [redefinindo, setRedefinindo] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarStatus, setConfirmarStatus] = useState(false);

  const redefinir = useRedefinirSenhaUsuario(usuarioId, {
    aoRedefinir: () => {
      setRedefinindo(false);
      setNovaSenha('');
    },
  });
  const status = useAlterarStatusUsuario(usuarioId);

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !usuario) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return (
    <>
      <DetailPage
        titulo={usuario.nome}
        subtitulo={usuario.email}
        statusTag={<StatusTag variante={usuario.ativo ? 'ativo' : 'inativo'} />}
        voltarPara="/sistema/usuarios"
        acoes={[
          {
            chave: 'senha',
            rotulo: 'Redefinir senha',
            permissao: Permissoes.UsuariosGerenciar,
            aoClicar: () => setRedefinindo(true),
          },
          {
            chave: 'status',
            rotulo: usuario.ativo ? 'Inativar' : 'Reativar',
            perigo: usuario.ativo,
            permissao: Permissoes.UsuariosGerenciar,
            aoClicar: () => setConfirmarStatus(true),
          },
        ]}
      >
        <SectionCard titulo="Dados">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-neutral-500">Login</dt>
              <dd className="m-0 mono text-neutral-800">{usuario.login}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Dois fatores</dt>
              <dd className="m-0 text-neutral-800">
                {usuario.doisFatoresHabilitado ? 'Habilitado' : 'Não habilitado'}
              </dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard titulo="Perfis" descricao="Definem as permissões deste usuário.">
          <SeletorPerfis id={usuario.id} atuais={usuario.perfis ?? []} />
        </SectionCard>
      </DetailPage>

      <Modal
        open={redefinindo}
        title="Redefinir senha"
        okText="Redefinir"
        okButtonProps={{ loading: redefinir.isPending, disabled: !novaSenha }}
        onOk={() => redefinir.mutate(novaSenha)}
        onCancel={() => setRedefinindo(false)}
        destroyOnHidden
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-600">Nova senha *</span>
          <Input.Password value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
        </label>
        <p className="mt-2 mb-0 text-xs text-neutral-500">
          Uso administrativo — informe a nova senha ao usuário por um canal seguro.
        </p>
      </Modal>

      <ConfirmDialog
        aberto={confirmarStatus}
        titulo={usuario.ativo ? 'Inativar este usuário?' : 'Reativar este usuário?'}
        descricao={
          usuario.ativo
            ? 'O usuário não conseguirá mais entrar no sistema.'
            : 'O usuário poderá entrar no sistema novamente.'
        }
        rotuloConfirmar={usuario.ativo ? 'Inativar' : 'Reativar'}
        perigo={usuario.ativo}
        carregando={status.isPending}
        aoConfirmar={() =>
          status.mutate(!usuario.ativo, { onSuccess: () => setConfirmarStatus(false) })
        }
        aoCancelar={() => setConfirmarStatus(false)}
      />
    </>
  );
}
