import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { renderEm, LARGURAS } from './_viewport';
import { AppShell } from '@/app/layout/AppShell';
import { DataTable, type ColunaResponsiva } from '@/compartilhado/ui/DataTable';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { FiltrosResponsivos } from '@/compartilhado/ui/FiltrosResponsivos';
import { GridEmbutido, type ColunaGrid } from '@/compartilhado/ui/GridEmbutido';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import type { PagedResult } from '@/compartilhado/api/tipos';

// Cada teste guarda o `restaurar` devolvido por `renderEm` e o chama ao final,
// devolvendo o `window.matchMedia` padrão do setup de testes.

// ---------------------------------------------------------------------------
// 1. AppShell — contrato de classes mobile-first (CSS-only)
// ---------------------------------------------------------------------------
describe('AppShell — navegação (agents.md §4.2 linha 1)', () => {
  it('bottom nav é oculto no lg: e a sidebar só aparece no lg:', () => {
    const { container, restaurar } = renderEm(LARGURAS.mobile, <AppShell />);
    const bottomNav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(bottomNav.className).toContain('lg:hidden');
    const aside = container.querySelector('aside');
    expect(aside?.className).toContain('hidden');
    expect(aside?.className).toContain('lg:flex');
    const main = container.querySelector('main');
    expect(main?.className).toContain('overflow-x-clip');
    restaurar();
  });
});

// ---------------------------------------------------------------------------
// 2. DataTable — card list / tabela essencial / tabela completa
// ---------------------------------------------------------------------------
const dados: PagedResult<Record<string, unknown>> = {
  itens: [
    { id: 1, descricao: 'Dipirona', grupo: 'Analgésicos', preco: 'R$ 10' },
    { id: 2, descricao: 'Amoxicilina', grupo: 'Antibióticos', preco: 'R$ 20' },
  ],
  paginaAtual: 1,
  tamanhoPagina: 20,
  totalRegistros: 2,
  totalPaginas: 1,
};
const usarConsulta = () =>
  ({ data: dados, isLoading: false }) as unknown as UseQueryResult<
    PagedResult<Record<string, unknown>>
  >;
const colunas: ColunaResponsiva<Record<string, unknown>>[] = [
  { title: 'Descrição', dataIndex: 'descricao' },
  { title: 'Grupo', dataIndex: 'grupo', apenasDesktop: true },
  { title: 'Preço', dataIndex: 'preco' },
];

describe('DataTable — 3 tiers', () => {
  it('mobile: renderiza cards, sem <table>', () => {
    const { restaurar } = renderEm(
      LARGURAS.mobile,
      <DataTable rowKey="id" usarConsulta={usarConsulta} colunas={colunas} />,
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Dipirona')).toBeInTheDocument();
    restaurar();
  });

  it('tablet: <table> sem a coluna apenasDesktop ("Grupo")', () => {
    const { restaurar } = renderEm(
      LARGURAS.tablet,
      <DataTable rowKey="id" usarConsulta={usarConsulta} colunas={colunas} />,
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Grupo' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Descrição' })).toBeInTheDocument();
    restaurar();
  });

  it('desktop: <table> com todas as colunas', () => {
    const { restaurar } = renderEm(
      LARGURAS.desktop,
      <DataTable rowKey="id" usarConsulta={usarConsulta} colunas={colunas} />,
    );
    expect(screen.getByRole('columnheader', { name: 'Grupo' })).toBeInTheDocument();
    restaurar();
  });
});

// ---------------------------------------------------------------------------
// 3. FiltrosResponsivos — bottom sheet / barra inline
// ---------------------------------------------------------------------------
describe('FiltrosResponsivos', () => {
  it('mobile: esconde os filtros atrás de um botão que abre bottom sheet', async () => {
    const { restaurar } = renderEm(
      LARGURAS.mobile,
      <FiltrosResponsivos qtdAtivos={1} aoLimpar={() => {}}>
        <span>controle-de-filtro</span>
      </FiltrosResponsivos>,
    );
    expect(screen.queryByText('controle-de-filtro')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Filtros/ }));
    expect(await screen.findByText('controle-de-filtro')).toBeInTheDocument();
    restaurar();
  });

  it('desktop: filtros inline, sem botão "Filtros"', () => {
    const { restaurar } = renderEm(
      LARGURAS.desktop,
      <FiltrosResponsivos>
        <span>controle-de-filtro</span>
      </FiltrosResponsivos>,
    );
    expect(screen.getByText('controle-de-filtro')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Filtros/ })).not.toBeInTheDocument();
    restaurar();
  });
});

// ---------------------------------------------------------------------------
// 4. FormPage — etapas / abas
// ---------------------------------------------------------------------------
const abas = [
  { chave: 'a', titulo: 'Dados gerais', conteudo: <p>A</p> },
  { chave: 'b', titulo: 'Classificação', conteudo: <p>B</p> },
  { chave: 'c', titulo: 'Estoque', conteudo: <p>C</p> },
];

describe('FormPage — etapas (mobile) vs abas (desktop)', () => {
  it('mobile: fluxo em etapas ("Passo 1 de 3")', () => {
    const { restaurar } = renderEm(
      LARGURAS.mobile,
      <FormPage titulo="Novo" aoSalvar={() => {}} abas={abas} />,
    );
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    restaurar();
  });

  it('desktop: abas (role=tab), sem "Passo 1 de 3"', () => {
    const { restaurar } = renderEm(
      LARGURAS.desktop,
      <FormPage titulo="Novo" aoSalvar={() => {}} abas={abas} />,
    );
    expect(screen.getAllByRole('tab').length).toBe(3);
    expect(screen.queryByText('Passo 1 de 3')).not.toBeInTheDocument();
    restaurar();
  });
});

// ---------------------------------------------------------------------------
// 5. GridEmbutido — cards / tabela
// ---------------------------------------------------------------------------
interface Linha {
  nome: string;
}
const colsGrid: ColunaGrid<Linha>[] = [
  {
    chave: 'nome',
    titulo: 'Nome',
    render: (l, up) => <input aria-label="nome" value={l.nome} onChange={(e) => up({ nome: e.target.value })} />,
  },
];

function GridHost({ largura }: { largura: number }) {
  const [linhas, setLinhas] = useState<Linha[]>([{ nome: 'um' }]);
  return (
    <GridEmbutido<Linha>
      valor={linhas}
      aoMudar={setLinhas}
      colunas={colsGrid}
      novaLinha={() => ({ nome: '' })}
      rotuloAdicionar="Adicionar"
      key={largura}
    />
  );
}

describe('GridEmbutido — cards (mobile) vs tabela (desktop)', () => {
  it('mobile: cards editáveis + adicionar cria "Item 2"', async () => {
    const { restaurar } = renderEm(LARGURAS.mobile, <GridHost largura={LARGURAS.mobile} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Adicionar/ }));
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    restaurar();
  });

  it('desktop: tabela editável com cabeçalho "Nome"', () => {
    const { restaurar } = renderEm(LARGURAS.desktop, <GridHost largura={LARGURAS.desktop} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument();
    restaurar();
  });
});

// ---------------------------------------------------------------------------
// 6. DetailPage — action sheet (mobile) vs barra visível (desktop)
// ---------------------------------------------------------------------------
const acoesDetalhe = [
  { chave: 'editar', rotulo: 'Editar', aoClicar: () => {} },
  { chave: 'inativar', rotulo: 'Inativar', perigo: true, aoClicar: () => {} },
];

describe('DetailPage — ações', () => {
  it('mobile: ações em "⋯" (não visíveis como botões diretos)', () => {
    const { restaurar } = renderEm(
      LARGURAS.mobile,
      <DetailPage titulo="Cliente X" acoes={acoesDetalhe}>
        <p>corpo</p>
      </DetailPage>,
    );
    expect(screen.getByRole('button', { name: 'Mais ações' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    restaurar();
  });

  it('desktop: barra de ações visível, sem "⋯"', () => {
    const { restaurar } = renderEm(
      LARGURAS.desktop,
      <DetailPage titulo="Cliente X" acoes={acoesDetalhe}>
        <p>corpo</p>
      </DetailPage>,
    );
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mais ações' })).not.toBeInTheDocument();
    restaurar();
  });
});

// ---------------------------------------------------------------------------
// 7. Contenção de scroll horizontal (Kardex/Posição)
// ---------------------------------------------------------------------------
describe('scroll horizontal contido', () => {
  it('DataTable no desktop usa container de scroll próprio (.ant-table-content)', () => {
    const { container, restaurar } = renderEm(
      LARGURAS.desktop,
      <DataTable rowKey="id" usarConsulta={usarConsulta} colunas={colunas} />,
    );
    expect(container.querySelector('.ant-table-content, .ant-table-body')).not.toBeNull();
    restaurar();
  });
});
