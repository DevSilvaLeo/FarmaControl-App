import type { ReactNode } from 'react';
import { AxiosError, type AxiosResponse } from 'axios';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const login = vi.fn();
const minhaConta = vi.fn();
vi.mock('@/modulos/autenticacao/api', () => ({
  autenticacaoApi: {
    login: (...a: unknown[]) => login(...a),
    minhaConta: (...a: unknown[]) => minhaConta(...a),
  },
}));

import { EntrarPage } from '@/modulos/autenticacao/paginas/EntrarPage';
import { CampoCodigoTotp } from '@/modulos/autenticacao/componentes/CampoCodigoTotp';
import { GuardaAutenticacao } from '@/compartilhado/auth/GuardaAutenticacao';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { alterarSenhaSchema } from '@/modulos/autenticacao/validacao';

function Wrap({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <ConfigProvider>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

function renderLogin() {
  return render(
    <Wrap>
      <MemoryRouter initialEntries={['/entrar']}>
        <Routes>
          <Route path="/entrar" element={<EntrarPage />} />
          <Route path="/" element={<div>PAINEL</div>} />
          <Route path="/entrar/dois-fatores" element={<div>DESAFIO</div>} />
        </Routes>
      </MemoryRouter>
    </Wrap>,
  );
}

const erro401 = new AxiosError('x', 'x', undefined, {}, { status: 401, data: {} } as AxiosResponse);

beforeEach(() => {
  login.mockReset();
  minhaConta.mockReset();
  useSessaoStore.getState().limpar();
});

describe('EntrarPage', () => {
  it('login com tokens → carrega perfil e vai para o Painel', async () => {
    login.mockResolvedValue({ tokens: { accessToken: 'a', refreshToken: 'r' } });
    minhaConta.mockResolvedValue({
      id: 1,
      nome: 'Fulano',
      login: 'fulano',
      email: 'f@f.com',
      perfis: [],
      permissoes: [],
    });

    const { container } = renderLogin();
    await userEvent.type(container.querySelector('input[name="login"]')!, 'fulano');
    await userEvent.type(container.querySelector('input[name="senha"]')!, 'segredo');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('PAINEL')).toBeInTheDocument();
    expect(useSessaoStore.getState().autenticado).toBe(true);
  });

  it('login com desafio → vai para a tela de dois fatores', async () => {
    login.mockResolvedValue({ desafio: { tokenDesafio: 't', tipo: 'DesafioTotp' } });

    const { container } = renderLogin();
    await userEvent.type(container.querySelector('input[name="login"]')!, 'fulano');
    await userEvent.type(container.querySelector('input[name="senha"]')!, 'segredo');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('DESAFIO')).toBeInTheDocument();
  });

  it('401 → mensagem "Login ou senha inválidos."', async () => {
    login.mockRejectedValue(erro401);

    const { container } = renderLogin();
    await userEvent.type(container.querySelector('input[name="login"]')!, 'fulano');
    await userEvent.type(container.querySelector('input[name="senha"]')!, 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Login ou senha inválidos.')).toBeInTheDocument();
  });

  it('validação: não chama a API sem preencher os campos', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Informe o login')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });
});

describe('CampoCodigoTotp', () => {
  it('dispara onCompleto ao completar 6 dígitos', async () => {
    const onCompleto = vi.fn();
    render(
      <Wrap>
        <CampoCodigoTotp onCompleto={onCompleto} />
      </Wrap>,
    );
    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) await userEvent.type(inputs[i], String(i + 1));
    expect(onCompleto).toHaveBeenCalledWith('123456');
  });
});

describe('GuardaAutenticacao', () => {
  it('sem sessão → redireciona para /entrar; com sessão → renderiza o conteúdo', () => {
    const tela = (
      <Routes>
        <Route element={<GuardaAutenticacao />}>
          <Route path="/protegida" element={<div>CONTEUDO</div>} />
        </Route>
        <Route path="/entrar" element={<div>LOGIN</div>} />
      </Routes>
    );

    const { unmount } = render(
      <Wrap>
        <MemoryRouter initialEntries={['/protegida']}>{tela}</MemoryRouter>
      </Wrap>,
    );
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    unmount();

    useSessaoStore.setState({ accessToken: 'a', perfil: { id: 1, nome: 'x', login: 'x', email: 'x', perfis: [], permissoes: [] }, autenticado: true });
    render(
      <Wrap>
        <MemoryRouter initialEntries={['/protegida']}>{tela}</MemoryRouter>
      </Wrap>,
    );
    expect(screen.getByText('CONTEUDO')).toBeInTheDocument();
  });
});

describe('alterarSenhaSchema', () => {
  it('rejeita quando a confirmação não confere', () => {
    const r = alterarSenhaSchema.safeParse({
      senhaAtual: 'a',
      novaSenha: 'nova1',
      confirmarNovaSenha: 'nova2',
    });
    expect(r.success).toBe(false);
  });
  it('aceita quando confere', () => {
    const r = alterarSenhaSchema.safeParse({
      senhaAtual: 'a',
      novaSenha: 'nova1',
      confirmarNovaSenha: 'nova1',
    });
    expect(r.success).toBe(true);
  });
});
