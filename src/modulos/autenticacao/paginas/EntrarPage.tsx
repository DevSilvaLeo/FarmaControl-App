import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button } from 'antd';
import { Marca } from '@/compartilhado/ui/Marca';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { config } from '@/compartilhado/config';
import { normalizarErro } from '@/compartilhado/api/normalizarErro';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { loginSchema, type LoginForm } from '../validacao';
import { useLogin } from '../hooks/useAutenticacao';

function mensagemDeLogin(erro: unknown): string {
  const e = normalizarErro(erro);
  if (e.status === 401) return 'Login ou senha inválidos.';
  if (e.status === 423)
    return 'Conta bloqueada por tentativas excessivas. Tente novamente mais tarde.';
  if (e.status === 0) return e.mensagem;
  return e.mensagem || 'Não foi possível entrar. Tente novamente.';
}

/** Login (`/entrar`) — `.spec/06` §6.2, `.docs/06` §6.1. Fora do AppShell. */
export function EntrarPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const autenticado = useSessaoStore((s) => s.autenticado);
  const retorno = (location.state as { retorno?: string } | null)?.retorno ?? '/';

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: '', senha: '' },
  });

  const login = useLogin({
    aoReceberTokens: () => navigate(retorno, { replace: true }),
    aoReceberDesafio: (d) =>
      navigate('/entrar/dois-fatores', { state: { tokenDesafio: d.tokenDesafio, tipo: d.tipo } }),
  });

  useEffect(() => {
    if (autenticado) navigate(retorno, { replace: true });
  }, [autenticado, navigate, retorno]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-25 p-4">
      <form
        onSubmit={handleSubmit((v) => login.mutate(v))}
        className="flex w-full max-w-[400px] flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 shadow-md"
        noValidate
      >
        <div className="mb-2 flex justify-center">
          <Marca />
        </div>
        <h1 className="m-0 text-lg font-semibold text-neutral-800">Entrar</h1>

        <CampoTexto
          control={control}
          name="login"
          label="Login"
          obrigatorio
          autoComplete="username"
          autoFocus
        />
        <CampoTexto
          control={control}
          name="senha"
          label="Senha"
          obrigatorio
          tipo="password"
          autoComplete="current-password"
        />

        {login.isError && <Alert type="error" showIcon title={mensagemDeLogin(login.error)} />}

        <Button type="primary" htmlType="submit" block loading={login.isPending}>
          Entrar
        </Button>

        <p className="m-0 text-center text-xs text-neutral-400">{config.appNome}</p>
      </form>
    </div>
  );
}
