import { BootstrapSessao } from '@/compartilhado/auth/BootstrapSessao';
import { Rotas } from './rotas/rotas';

export function App() {
  return (
    <BootstrapSessao>
      <Rotas />
    </BootstrapSessao>
  );
}
