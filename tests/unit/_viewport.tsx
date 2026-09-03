import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { temaAntd } from '@/compartilhado/tema/temaAntd';

/**
 * Instala um `window.matchMedia` que avalia `(min-width)`/`(max-width)` contra
 * uma largura fixa — permite testar os blueprints responsivos (`.docs/05` §5.4)
 * com "viewport mockado". Chamar ANTES de `render`.
 */
export function mockViewport(width: number): () => void {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => {
    const min = /min-width:\s*(\d+)/.exec(query);
    const max = /max-width:\s*(\d+)/.exec(query);
    let matches = true;
    if (min) matches = width >= Number(min[1]);
    else if (max) matches = width <= Number(max[1]);
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  }) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

export function renderEm(width: number, ui: ReactElement) {
  const restaurar = mockViewport(width);
  const utils = render(
    <ConfigProvider theme={temaAntd}>
      <AntApp>
        <MemoryRouter>{ui}</MemoryRouter>
      </AntApp>
    </ConfigProvider>,
  );
  return { ...utils, restaurar };
}

export const LARGURAS = { mobile: 375, tablet: 800, desktop: 1280 } as const;
