import { useQuery } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { autenticacaoApi } from '../api';
import type { AutenticarComSenhaBody, ConcluirDesafioTotpBody } from '../tipos';

/** Após obter os tokens, carrega o perfil — só então `autenticado` fica `true`. */
async function carregarPerfil() {
  const perfil = await autenticacaoApi.minhaConta();
  useSessaoStore.getState().definirPerfil(perfil);
}

/** `GET /minha-conta` — carregado após login e mantido no store. */
export function useMinhaConta(habilitado = true) {
  return useQuery({
    queryKey: ['minha-conta'],
    queryFn: autenticacaoApi.minhaConta,
    enabled: habilitado,
    staleTime: 5 * 60_000,
  });
}

export function useLogin(opcoes?: {
  aoReceberTokens?: () => void;
  aoReceberDesafio?: (d: { tokenDesafio: string; tipo: string }) => void;
}) {
  const { definirTokens } = useSessaoStore();

  return useMutacaoComErro<Awaited<ReturnType<typeof autenticacaoApi.login>>, AutenticarComSenhaBody>(
    autenticacaoApi.login,
    {
      aoErro: () => true, // a tela de login trata as mensagens específicas (401/423)
      onSuccess: async (resultado) => {
        if (resultado.tokens) {
          definirTokens(resultado.tokens);
          await carregarPerfil();
          opcoes?.aoReceberTokens?.();
        } else if (resultado.desafio) {
          opcoes?.aoReceberDesafio?.(resultado.desafio);
        }
      },
    },
  );
}

export function useConcluirDoisFatores(opcoes?: { aoConcluir?: () => void }) {
  const { definirTokens } = useSessaoStore();

  return useMutacaoComErro<
    Awaited<ReturnType<typeof autenticacaoApi.concluirDoisFatores>>,
    ConcluirDesafioTotpBody
  >(autenticacaoApi.concluirDoisFatores, {
    aoErro: () => true,
    onSuccess: async (tokens) => {
      definirTokens(tokens);
      await carregarPerfil();
      opcoes?.aoConcluir?.();
    },
  });
}

export function useAlterarSenha() {
  return useMutacaoComErro(
    (b: { senhaAtual: string; novaSenha: string }) => autenticacaoApi.alterarSenha(b),
    { mensagemSucesso: 'Senha alterada com sucesso.' },
  );
}

export function useConfigurarDoisFatores() {
  return useMutacaoComErro(() => autenticacaoApi.configurarDoisFatores());
}

export function useAtivarDoisFatores(opcoes?: { aoAtivar?: () => void }) {
  return useMutacaoComErro((codigo: string) => autenticacaoApi.ativarDoisFatores(codigo), {
    aoErro: () => true,
    mensagemSucesso: 'Verificação em duas etapas ativada.',
    onSuccess: () => opcoes?.aoAtivar?.(),
  });
}

export function useDesativarDoisFatores(opcoes?: { aoDesativar?: () => void }) {
  return useMutacaoComErro((senha: string) => autenticacaoApi.desativarDoisFatores(senha), {
    mensagemSucesso: 'Verificação em duas etapas desativada.',
    onSuccess: () => opcoes?.aoDesativar?.(),
  });
}

export function useLogout() {
  const { limpar } = useSessaoStore();
  return useMutacaoComErro((todasAsSessoes: boolean) => autenticacaoApi.logout(todasAsSessoes), {
    // mesmo se o backend falhar, deslogamos localmente e suprimimos o toast
    aoErro: () => {
      limpar();
      return true;
    },
    onSuccess: () => limpar(),
  });
}
