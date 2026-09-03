import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

/** Página "Acesso negado" (403 / rota sem permissão) — `.spec/05` §5.5. */
export function AcessoNegadoPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="Acesso negado"
      subTitle="Você não tem permissão para acessar esta área. Fale com um administrador se precisar de acesso."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      }
    />
  );
}
