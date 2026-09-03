import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

/** Fallback de rota inexistente. A página "Acesso negado" (403) entra na Etapa 3. */
export function NaoEncontradoPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="Página não encontrada"
      subTitle="O endereço acessado não existe ou foi movido."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      }
    />
  );
}
