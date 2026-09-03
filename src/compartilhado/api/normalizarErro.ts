import { AxiosError } from 'axios';
import type { ErroApi } from './tipos';

interface ProblemDetailsEstendido {
  status?: number;
  title?: string;
  detail?: string;
  mensagem?: string;
  codigoErro?: string;
  errors?: Record<string, string[]>;
  erros?: Record<string, string[]>;
}

const MENSAGEM_GENERICA = 'Ocorreu um erro inesperado. Tente novamente.';

/**
 * Converte qualquer erro (Axios ou não) no tipo único `ErroApi`
 * (`.spec/03` §3.5). É a única forma de um erro de API chegar à camada de UI.
 */
export function normalizarErro(erro: unknown): ErroApi {
  if (erro instanceof AxiosError) {
    const status = erro.response?.status ?? 0;
    const corpo = (erro.response?.data ?? {}) as ProblemDetailsEstendido;
    const erros = corpo.erros ?? corpo.errors;

    if (status === 0) {
      return {
        status: 0,
        mensagem:
          'Não foi possível conectar à API. Verifique sua conexão e se o servidor está no ar.',
      };
    }

    return {
      status,
      mensagem: corpo.mensagem ?? corpo.title ?? corpo.detail ?? mensagemPorStatus(status),
      codigoErro: corpo.codigoErro,
      erros: erros && Object.keys(erros).length > 0 ? erros : undefined,
    };
  }

  if (erro instanceof Error) {
    return { status: 0, mensagem: erro.message || MENSAGEM_GENERICA };
  }

  return { status: 0, mensagem: MENSAGEM_GENERICA };
}

function mensagemPorStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Há campos inválidos no formulário.';
    case 401:
      return 'Sua sessão expirou. Entre novamente.';
    case 403:
      return 'Você não tem permissão para esta ação.';
    case 404:
      return 'Registro não encontrado.';
    case 409:
      return 'Conflito com um registro existente.';
    case 422:
      return 'Não foi possível concluir por uma regra de negócio.';
    case 423:
      return 'Conta bloqueada.';
    default:
      return MENSAGEM_GENERICA;
  }
}
