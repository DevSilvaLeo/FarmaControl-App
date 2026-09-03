import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button } from 'antd';
import { Marca } from '@/compartilhado/ui/Marca';
import { normalizarErro } from '@/compartilhado/api/normalizarErro';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { CampoCodigoTotp } from '../componentes/CampoCodigoTotp';
import { ConfigurarDoisFatores } from '../componentes/ConfigurarDoisFatores';
import { useConcluirDoisFatores } from '../hooks/useAutenticacao';
import type { EscopoDesafioLogin } from '../tipos';

interface EstadoNavegacao {
  tokenDesafio?: string;
  tipo?: EscopoDesafioLogin;
}

/** Desafio de dois fatores (`/entrar/dois-fatores`) — `.spec/06` §6.3. */
export function DoisFatoresPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tokenDesafio, tipo } = (location.state as EstadoNavegacao | null) ?? {};
  const [codigo, setCodigo] = useState('');

  const concluir = useConcluirDoisFatores({ aoConcluir: () => navigate('/', { replace: true }) });

  // Para `ConfiguracaoTotpObrigatoria` o token de escopo restrito habilita os
  // endpoints de configuração até a ativação (reconciliar com o backend).
  useEffect(() => {
    if (tipo === 'ConfiguracaoTotpObrigatoria' && tokenDesafio) {
      useSessaoStore.getState().definirAccessToken(tokenDesafio);
    }
  }, [tipo, tokenDesafio]);

  if (!tokenDesafio || !tipo) {
    return <Navigate to="/entrar" replace />;
  }

  const primeiroAcesso = tipo === 'ConfiguracaoTotpObrigatoria';

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-25 p-4">
      <div className="w-full max-w-[400px] rounded-lg border border-neutral-200 bg-white p-6 shadow-md">
        <div className="mb-5 flex justify-center">
          <Marca />
        </div>

        {primeiroAcesso ? (
          <>
            <h1 className="mb-1 text-lg font-semibold text-neutral-800">Verificação obrigatória</h1>
            <p className="mb-4 text-sm text-neutral-600">
              Seu perfil exige verificação em duas etapas. Vamos configurar agora.
            </p>
            <ConfigurarDoisFatores
              aoConcluir={() => {
                useSessaoStore.getState().limpar();
                navigate('/entrar', {
                  replace: true,
                  state: { avisar: 'Verificação configurada. Entre novamente.' },
                });
              }}
            />
          </>
        ) : (
          <>
            <h1 className="mb-1 text-lg font-semibold text-neutral-800">Dois fatores</h1>
            <p className="mb-4 text-sm text-neutral-600">
              Digite o código do seu aplicativo autenticador.
            </p>
            <CampoCodigoTotp
              value={codigo}
              onChange={setCodigo}
              onCompleto={(c) => concluir.mutate({ tokenDesafio, codigo: c })}
              disabled={concluir.isPending}
              status={concluir.isError ? 'error' : undefined}
            />
            {concluir.isError && (
              <Alert
                className="mt-3"
                type="error"
                showIcon
                title={
                  [400, 401, 422].includes(normalizarErro(concluir.error).status)
                    ? 'Código inválido ou expirado. Tente novamente.'
                    : normalizarErro(concluir.error).mensagem
                }
              />
            )}
            <Button
              className="mt-4"
              type="link"
              size="small"
              onClick={() => navigate('/entrar', { replace: true })}
            >
              Voltar ao login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
