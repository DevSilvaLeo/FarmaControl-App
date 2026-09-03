import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import type { UseQueryResult } from '@tanstack/react-query';
import { temaAntd } from '@/compartilhado/tema/temaAntd';
import { StatusTag, TagAtivo } from '@/compartilhado/ui/StatusTag';
import { SemaforoValidade } from '@/compartilhado/ui/SemaforoValidade';
import { EmptyState } from '@/compartilhado/ui/EmptyState';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { DataTable } from '@/compartilhado/ui/DataTable';
import type { PagedResult } from '@/compartilhado/api/tipos';

function W({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={temaAntd}>
      <AntApp>
        <MemoryRouter>{children}</MemoryRouter>
      </AntApp>
    </ConfigProvider>
  );
}

describe('StatusTag', () => {
  it('mostra sempre texto, não só cor', () => {
    render(
      <W>
        <TagAtivo ativo />
        <StatusTag variante="bloqueado" />
      </W>,
    );
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
  });
});

describe('SemaforoValidade', () => {
  it('sempre exibe o número de dias em texto (não só cor)', () => {
    render(
      <W>
        <SemaforoValidade dias={5} />
        <SemaforoValidade dias={-2} />
        <SemaforoValidade dias={200} />
      </W>,
    );
    expect(screen.getByText('faltam 5 dias')).toBeInTheDocument();
    expect(screen.getByText('venceu há 2 dias')).toBeInTheDocument();
    expect(screen.getByText('faltam 200 dias')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('variante semResultado chama aoLimparFiltros', async () => {
    const limpar = vi.fn();
    render(
      <W>
        <EmptyState variante="semResultado" titulo="Nada aqui" aoLimparFiltros={limpar} />
      </W>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(limpar).toHaveBeenCalled();
  });
});

describe('ConfirmDialog', () => {
  it('exige motivo quando exigirMotivo e só então confirma', async () => {
    const aoConfirmar = vi.fn();
    render(
      <W>
        <ConfirmDialog
          aberto
          titulo="Bloquear?"
          exigirMotivo
          rotuloConfirmar="Bloquear"
          aoConfirmar={aoConfirmar}
          aoCancelar={() => {}}
        />
      </W>,
    );
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Bloquear' }));
    expect(aoConfirmar).not.toHaveBeenCalled();

    await userEvent.type(within(dialog).getByPlaceholderText('Descreva o motivo desta ação'), 'Inadimplência');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Bloquear' }));
    expect(aoConfirmar).toHaveBeenCalledWith('Inadimplência');
  });
});

describe('FormPage (mobile → fluxo em etapas)', () => {
  it('navega entre passos com Avançar', async () => {
    render(
      <W>
        <FormPage
          titulo="Novo produto"
          aoSalvar={() => {}}
          abas={[
            { chave: 'a', titulo: 'Dados gerais', conteudo: <p>conteudo A</p> },
            { chave: 'b', titulo: 'Classificação', conteudo: <p>conteudo B</p> },
            { chave: 'c', titulo: 'Estoque', conteudo: <p>conteudo C</p> },
          ]}
        />
      </W>,
    );
    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('conteudo A')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.getByText('Passo 2 de 3')).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  const consultaComItens = () =>
    ({
      data: {
        itens: [
          { id: 1, descricao: 'Dipirona 500mg', codigoBarras: '789', preco: 'R$ 10' },
          { id: 2, descricao: 'Amoxicilina', codigoBarras: '790', preco: 'R$ 20' },
        ],
        paginaAtual: 1,
        tamanhoPagina: 20,
        totalRegistros: 2,
        totalPaginas: 1,
      } as PagedResult<Record<string, unknown>>,
      isLoading: false,
    }) as unknown as UseQueryResult<PagedResult<Record<string, unknown>>>;

  const consultaVazia = () =>
    ({
      data: { itens: [], paginaAtual: 1, tamanhoPagina: 20, totalRegistros: 0, totalPaginas: 0 },
      isLoading: false,
    }) as unknown as UseQueryResult<PagedResult<Record<string, unknown>>>;

  it('no mobile renderiza cards a partir dos dados', () => {
    render(
      <W>
        <DataTable
          rowKey="id"
          usarConsulta={consultaComItens}
          colunas={[
            { title: 'Descrição', dataIndex: 'descricao' },
            { title: 'Cód. barras', dataIndex: 'codigoBarras' },
            { title: 'Preço', dataIndex: 'preco' },
          ]}
        />
      </W>,
    );
    expect(screen.getByText('Dipirona 500mg')).toBeInTheDocument();
    expect(screen.getByText('Amoxicilina')).toBeInTheDocument();
  });

  it('sem registros e sem filtro → EmptyState de "nenhum registro"', () => {
    render(
      <W>
        <DataTable rowKey="id" usarConsulta={consultaVazia} colunas={[{ title: 'X', dataIndex: 'x' }]} />
      </W>,
    );
    expect(screen.getByText('Nenhum registro cadastrado')).toBeInTheDocument();
  });

  it('sem resultado e com filtro ativo → EmptyState de "sem resultado" + limpar', async () => {
    const limpar = vi.fn();
    render(
      <W>
        <DataTable
          rowKey="id"
          usarConsulta={consultaVazia}
          colunas={[{ title: 'X', dataIndex: 'x' }]}
          temFiltroAtivo
          aoLimparFiltros={limpar}
        />
      </W>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(limpar).toHaveBeenCalled();
  });
});
