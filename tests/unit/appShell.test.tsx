import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/app/layout/AppShell';
import { temaAntd } from '@/compartilhado/tema/temaAntd';

function renderizar(rota: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ConfigProvider theme={temaAntd}>
        <AntApp>
          <MemoryRouter initialEntries={[rota]}>
            <AppShell />
          </MemoryRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>,
  );
}

describe('AppShell (Etapa 0)', () => {
  it('renderiza a casca com a marca e o gatilho de menu', () => {
    renderizar('/');
    expect(screen.getAllByText('Farma').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Abrir menu de navegação')).toBeInTheDocument();
  });

  it('expõe a navegação inferior (mobile) com os módulos de topo e "Mais"', () => {
    renderizar('/');
    const navInferior = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(navInferior).getByText('Cadastros')).toBeInTheDocument();
    expect(within(navInferior).getByText('Estoque')).toBeInTheDocument();
    expect(within(navInferior).getByText('Mais')).toBeInTheDocument();
  });
});
