import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { normalizarErro } from '@/compartilhado/api/normalizarErro';
import type { ErroApi } from '@/compartilhado/api/tipos';
import { useNotificacoes } from '@/compartilhado/ui/notificacoes';

/**
 * Wrapper sobre `useMutation` que aplica o mapeamento de erro de
 * `.spec/03` §3.5 automaticamente. Toda tela de formulário usa este hook em
 * vez de `useMutation` cru — proibido `try/catch` repetido por tela.
 *
 * Mapa por status HTTP:
 *  400 → `aoErroDeCampo(erros)` (marca campo a campo — NUNCA só toast)
 *  401 → silencioso (o interceptor já tratou / vai deslogar)
 *  403 → toast (rota protegida mostra a página "Acesso negado" à parte)
 *  404 → `aoErro` (caller decide: página "Não encontrado" ou remover da lista)
 *  409 → toast de erro com a `mensagem` do backend (verbatim)
 *  422 → toast de erro com a `mensagem` do backend (verbatim)
 *  423 → toast (mensagem específica de conta bloqueada)
 *  500 → toast genérico
 */
export interface OpcoesMutacaoComErro<TDados, TVars>
  extends Omit<UseMutationOptions<TDados, unknown, TVars>, 'mutationFn' | 'onError'> {
  /** Toast de sucesso automático. */
  mensagemSucesso?: string;
  /** Recebe `erros` de validação (400) para `setError` do React Hook Form. */
  aoErroDeCampo?: (erros: Record<string, string[]>) => void;
  /** Handler adicional após o tratamento padrão. Retorne `true` para suprimir o toast padrão. */
  aoErro?: (erro: ErroApi) => boolean | void;
}

export function useMutacaoComErro<TDados = unknown, TVars = void>(
  mutationFn: (variaveis: TVars) => Promise<TDados>,
  opcoes: OpcoesMutacaoComErro<TDados, TVars> = {},
) {
  const { mensagemSucesso, aoErroDeCampo, aoErro, onSuccess, ...resto } = opcoes;
  const notificar = useNotificacoes();

  return useMutation<TDados, unknown, TVars>({
    mutationFn,
    onSuccess: (...args: Parameters<NonNullable<typeof onSuccess>>) => {
      if (mensagemSucesso) notificar.sucesso(mensagemSucesso);
      onSuccess?.(...args);
    },
    onError: (erroBruto) => {
      const erro = normalizarErro(erroBruto);
      const suprimir = aoErro?.(erro) === true;

      switch (erro.status) {
        case 400:
          if (erro.erros && aoErroDeCampo) aoErroDeCampo(erro.erros);
          else if (!suprimir) notificar.erro(erro.mensagem);
          break;
        case 401:
          // interceptor do clienteHttp já cuida (renovar ou deslogar)
          break;
        case 403:
        case 404:
        case 409:
        case 422:
        case 423:
          if (!suprimir) notificar.erro(erro.mensagem);
          break;
        default:
          if (!suprimir) notificar.erro('Ocorreu um erro inesperado. Tente novamente.');
      }
    },
    ...resto,
  });
}
