import { Link } from 'react-router-dom';
import { Alert, Button } from 'antd';
import { Marca } from '@/compartilhado/ui/Marca';

/**
 * Placeholder da tela de login (`.spec/04` §4.3 item 6). A tela real (senha +
 * TOTP) é a Etapa 3 (`.docs/06` §6.1). Fica FORA do AppShell, sem topbar/menu.
 */
export function EntrarPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-neutral-25 p-4">
      <div className="w-full max-w-[400px] rounded-lg border border-neutral-200 bg-white p-6 shadow-md">
        <div className="mb-4 flex justify-center">
          <Marca />
        </div>
        <Alert
          type="info"
          showIcon
          message="Login em construção"
          description="A autenticação (senha + verificação em duas etapas) entra na Etapa 3."
        />
        <Link to="/">
          <Button type="primary" block className="mt-4">
            Entrar no sistema (sem autenticação)
          </Button>
        </Link>
      </div>
    </div>
  );
}
