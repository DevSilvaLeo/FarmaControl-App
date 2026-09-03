import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { AppShell } from '@/app/layout/AppShell';
import { temaAntd } from '@/compartilhado/tema/temaAntd';

function renderizar(rota: string) {
  return render(
    <ConfigProvider theme={temaAntd}>
      <AntApp>
        <MemoryRouter initialEntries={[rota]}>
          <AppShell />
        </MemoryRouter>
      </AntApp>
    </ConfigProvider>,
  );
}

describe('AppShell (Etapa 0)', () => {
  it('renderiza a casca com a marca e o gatilho de menu', () => {
    renderizar('/');
    // "Farma" aparece na sidebar e na topbar (visibilidade é só CSS) — basta existir.
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
