import { useEffect, useState, type ReactNode } from 'react';
import { Spin } from 'antd';
import { useSessaoStore } from './sessaoStore';
import { renovarAccessToken } from '@/compartilhado/api/renovacaoDeToken';
import { autenticacaoApi } from '@/modulos/autenticacao/api';

/**
 * Ao carregar a aplicação (`.spec/05` §5.2):
 *  1. Se há `refreshToken` salvo e nenhum `accessToken` em memória, tenta
 *     renovar silenciosamente — evita pedir login a cada F5.
 *  2. Se há sessão, carrega `GET /minha-conta` e popula o `perfil` no store
 *     (necessário para `usePermissao`).
 *  3. Qualquer falha ⇒ limpa a sessão e segue para a tela de login.
 */
export function BootstrapSessao({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const store = useSessaoStore.getState();
      try {
        if (!store.accessToken && store.refreshToken) {
          await renovarAccessToken();
        }
        if (useSessaoStore.getState().accessToken) {
          const perfil = await autenticacaoApi.minhaConta();
          useSessaoStore.getState().definirPerfil(perfil);
        }
      } catch {
        useSessaoStore.getState().limpar();
      } finally {
        if (ativo) setPronto(true);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  if (!pronto) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip="Carregando…">
          <div className="p-8" />
        </Spin>
      </div>
    );
  }

  return <>{children}</>;
}
