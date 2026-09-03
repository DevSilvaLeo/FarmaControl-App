import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessaoStore, type MeuPerfilDto } from '@/compartilhado/auth/sessaoStore';
import { GuardaPermissao } from '@/compartilhado/auth/GuardaPermissao';
import { MatrizPermissoes } from '@/modulos/sistema/componentes/MatrizPermissoes';
import { SidebarNav } from '@/app/layout/SidebarNav';
import type { ModuloPermissoesDto } from '@/modulos/sistema/tipos';
import { renderEm, LARGURAS } from './_viewport';

function Wrap({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <ConfigProvider>
        <AntApp>
          <MemoryRouter>{children}</MemoryRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

const perfilLimitado: MeuPerfilDto = {
  id: 1,
  nome: 'Estoquista',
  login: 'est',
  email: 'e@e.com',
  perfis: [],
  permissoes: ['Estoque.Consultar'],
};

beforeEach(() => useSessaoStore.getState().limpar());

describe('Menu filtrado por permissão (.spec/06 §6.9)', () => {
  it('perfil só com Estoque.Consultar não vê o grupo Sistema', () => {
    useSessaoStore.getState().definirPerfil(perfilLimitado);
    render(
      <Wrap>
        <SidebarNav colapsada={false} aoAlternar={() => {}} />
      </Wrap>,
    );
    expect(screen.getByText('Estoque')).toBeInTheDocument();
    expect(screen.queryByText('Sistema')).not.toBeInTheDocument();
    expect(screen.queryByText('Cadastros')).not.toBeInTheDocument();
  });
});

describe('GuardaPermissao', () => {
  it('sem a permissão → "Acesso negado"; com a permissão → conteúdo', () => {
    useSessaoStore.getState().definirPerfil(perfilLimitado);

    const { unmount } = render(
      <Wrap>
        <Routes>
          <Route
            path="/"
            element={
              <GuardaPermissao chave="Usuarios.Consultar">
                <div>LISTA DE USUÁRIOS</div>
              </GuardaPermissao>
            }
          />
        </Routes>
      </Wrap>,
    );
    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
    unmount();

    render(
      <Wrap>
        <Routes>
          <Route
            path="/"
            element={
              <GuardaPermissao chave="Estoque.Consultar">
                <div>POSIÇÃO DE ESTOQUE</div>
              </GuardaPermissao>
            }
          />
        </Routes>
      </Wrap>,
    );
    expect(screen.getByText('POSIÇÃO DE ESTOQUE')).toBeInTheDocument();
  });
});

describe('MatrizPermissoes', () => {
  const modulos: ModuloPermissoesDto[] = [
    {
      modulo: 'Produtos',
      permissoes: [
        { id: 1, modulo: 'Produtos', chave: 'Produtos.Consultar', descricao: 'Consultar produtos' },
        { id: 2, modulo: 'Produtos', chave: 'Produtos.Gerenciar', descricao: 'Gerenciar produtos' },
      ],
    },
  ];

  it('marcar uma permissão chama aoMudar com a chave (desktop)', async () => {
    const aoMudar = vi.fn();
    const { restaurar } = renderEm(
      LARGURAS.desktop,
      <MatrizPermissoes modulos={modulos} selecionadas={[]} aoMudar={aoMudar} />,
    );
    await userEvent.click(screen.getByLabelText('Consultar produtos'));
    expect(aoMudar).toHaveBeenCalledWith(['Produtos.Consultar']);
    restaurar();
  });
});
