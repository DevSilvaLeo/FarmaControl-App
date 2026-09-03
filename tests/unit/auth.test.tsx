import { render, screen } from '@testing-library/react';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';

beforeEach(() => {
  useSessaoStore.getState().limpar();
});

describe('RequerPermissao / usePermissao', () => {
  it('com perfil real, esconde ação sem a permissão e mostra a que tem', () => {
    useSessaoStore.getState().definirPerfil({
      id: 1,
      nome: 'Estoquista',
      login: 'est',
      email: 'e@e.com',
      perfis: [],
      permissoes: ['Estoque.Consultar'],
    });

    render(
      <>
        <RequerPermissao chave="Estoque.Consultar">
          <span>ver estoque</span>
        </RequerPermissao>
        <RequerPermissao chave="Produtos.Gerenciar">
          <span>criar produto</span>
        </RequerPermissao>
      </>,
    );

    expect(screen.getByText('ver estoque')).toBeInTheDocument();
    expect(screen.queryByText('criar produto')).not.toBeInTheDocument();
  });

  it('perfil Administrador tem acesso a tudo', () => {
    useSessaoStore.getState().definirPerfil({
      id: 2,
      nome: 'Admin',
      login: 'adm',
      email: 'a@a.com',
      perfis: ['Administrador'],
      permissoes: [],
    });

    render(
      <RequerPermissao chave="Qualquer.Coisa">
        <span>tudo liberado</span>
      </RequerPermissao>,
    );
    expect(screen.getByText('tudo liberado')).toBeInTheDocument();
  });

  it('sem perfil (mock de dev) libera para permitir construir as telas', () => {
    render(
      <RequerPermissao chave="Produtos.Gerenciar">
        <span>mock liberado</span>
      </RequerPermissao>,
    );
    expect(screen.getByText('mock liberado')).toBeInTheDocument();
  });
});
