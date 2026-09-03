import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessaoStore } from './sessaoStore';

/**
 * Toda rota fora de `/entrar*` exige sessão (`.spec/06` §6.10). Sem sessão,
 * redireciona para `/entrar` guardando a rota original para retomar após login.
 */
export function GuardaAutenticacao() {
  const autenticado = useSessaoStore((s) => s.autenticado);
  const location = useLocation();

  if (!autenticado) {
    const retorno = location.pathname + location.search;
    return <Navigate to="/entrar" replace state={{ retorno }} />;
  }

  return <Outlet />;
}
