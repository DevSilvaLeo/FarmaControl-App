import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';
import { QueryProvider } from './QueryProvider';
import { TemaProvider } from './TemaProvider';

/**
 * Composição raiz de providers (`.spec/02` §2.2 `app/providers/`).
 * Ordem: ErrorBoundary externo → Tema (ConfigProvider) → Query → Router.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <TemaProvider>
        <QueryProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryProvider>
      </TemaProvider>
    </ErrorBoundary>
  );
}
