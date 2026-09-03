import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Input, Modal, Skeleton, Tag } from 'antd';
import { PageHeader } from '@/compartilhado/ui/PageHeader';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { config } from '@/compartilhado/config';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { alterarSenhaSchema, type AlterarSenhaForm } from '../validacao';
import {
  useAlterarSenha,
  useDesativarDoisFatores,
  useLogout,
  useMinhaConta,
} from '../hooks/useAutenticacao';
import { ConfigurarDoisFatores } from '../componentes/ConfigurarDoisFatores';

/** Minha Conta (`/minha-conta`) — `.spec/06` §6.5, `.docs/06` §6.4. */
export function MinhaContaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const perfilStore = useSessaoStore((s) => s.perfil);
  const { data, isLoading } = useMinhaConta(perfilStore == null);
  const perfil = perfilStore ?? data;

  const [configurando, setConfigurando] = useState(false);
  const [desativando, setDesativando] = useState(false);
  const [senhaDesativar, setSenhaDesativar] = useState('');

  const form = useForm<AlterarSenhaForm>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: { senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' },
  });
  const alterarSenha = useAlterarSenha();
  const desativar2fa = useDesativarDoisFatores({
    aoDesativar: () => {
      setDesativando(false);
      setSenhaDesativar('');
      void queryClient.invalidateQueries({ queryKey: ['minha-conta'] });
    },
  });
  const logout = useLogout();

  const recarregarConta = () => queryClient.invalidateQueries({ queryKey: ['minha-conta'] });

  if (isLoading && !perfil) {
    return (
      <>
        <PageHeader titulo="Minha Conta" />
        <Skeleton active paragraph={{ rows: 4 }} />
      </>
    );
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6">
      <PageHeader titulo="Minha Conta" />

      <SectionCard titulo="Perfil">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-neutral-500">Nome</dt>
            <dd className="m-0 text-neutral-800">{perfil?.nome ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Login</dt>
            <dd className="m-0 text-neutral-800">{perfil?.login ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Email</dt>
            <dd className="m-0 text-neutral-800">{perfil?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Empresa · Filial</dt>
            <dd className="m-0 text-neutral-800">
              {perfil?.empresaNome ?? '—'}
              {perfil?.filialNome ? ` · ${perfil.filialNome}` : ''}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-neutral-500">Perfis</dt>
            <dd className="m-0 mt-1 flex flex-wrap gap-1">
              {(perfil?.perfis ?? []).length > 0
                ? perfil!.perfis.map((p) => <Tag key={p}>{p}</Tag>)
                : '—'}
            </dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard titulo="Alterar senha">
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit((v) =>
            alterarSenha.mutate(
              { senhaAtual: v.senhaAtual, novaSenha: v.novaSenha },
              { onSuccess: () => form.reset() },
            ),
          )}
        >
          <CampoTexto
            control={form.control}
            name="senhaAtual"
            label="Senha atual"
            tipo="password"
            autoComplete="current-password"
          />
          <CampoTexto
            control={form.control}
            name="novaSenha"
            label="Nova senha"
            tipo="password"
            autoComplete="new-password"
          />
          <CampoTexto
            control={form.control}
            name="confirmarNovaSenha"
            label="Confirmar nova senha"
            tipo="password"
            autoComplete="new-password"
          />
          <div>
            <Button type="primary" htmlType="submit" loading={alterarSenha.isPending}>
              Alterar senha
            </Button>
          </div>
        </form>
      </SectionCard>

      {(config.doisFatoresVisivel || perfil?.doisFatoresHabilitado) && (
        <SectionCard titulo="Verificação em duas etapas">
          {perfil?.doisFatoresHabilitado ? (
            <div className="flex flex-col gap-3">
              <div>
                <StatusTag variante="ativo" rotulo="Ativada" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button danger onClick={() => setDesativando(true)}>
                  Desativar
                </Button>
                <Button
                  onClick={() => logout.mutate(true, { onSuccess: () => navigate('/entrar') })}
                >
                  Sair de todos os dispositivos
                </Button>
              </div>
            </div>
          ) : configurando ? (
            <ConfigurarDoisFatores
              aoConcluir={() => {
                setConfigurando(false);
                void recarregarConta();
              }}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm text-neutral-600">
                Adicione uma camada extra de segurança usando um aplicativo autenticador.
              </p>
              <div>
                <Button type="primary" onClick={() => setConfigurando(true)}>
                  Configurar
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      <Modal
        open={desativando}
        title="Desativar verificação em duas etapas?"
        okText="Desativar"
        okButtonProps={{ danger: true, loading: desativar2fa.isPending, disabled: !senhaDesativar }}
        cancelButtonProps={{ disabled: desativar2fa.isPending }}
        onOk={() => desativar2fa.mutate(senhaDesativar)}
        onCancel={() => setDesativando(false)}
        destroyOnHidden
      >
        <Alert
          className="mb-3"
          type="warning"
          showIcon
          title="Isso reduz a segurança da sua conta."
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-600">Senha atual *</span>
          <Input.Password
            value={senhaDesativar}
            onChange={(e) => setSenhaDesativar(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {desativar2fa.isError && (
          <span className="mt-1 block text-xs text-erro">Senha incorreta.</span>
        )}
      </Modal>
    </div>
  );
}
