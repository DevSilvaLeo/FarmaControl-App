import type { ReactNode } from 'react';
import { AxiosError, type AxiosResponse } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

const sucesso = vi.fn();
const erro = vi.fn();
const avisar = vi.fn();
const informar = vi.fn();

vi.mock('@/compartilhado/ui/notificacoes', () => ({
  useNotificacoes: () => ({ sucesso, erro, avisar, informar }),
}));

import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function erroDeStatus(status: number, data: unknown) {
  return new AxiosError('falhou', 'ERR', undefined, {}, { status, data } as AxiosResponse);
}

beforeEach(() => {
  sucesso.mockClear();
  erro.mockClear();
});

describe('useMutacaoComErro — mapeamento de status (.spec/03 §3.5)', () => {
  it('400 com erros de campo → aoErroDeCampo, sem toast', async () => {
    const aoErroDeCampo = vi.fn();
    const { result } = renderHook(
      () =>
        useMutacaoComErro(
          () => Promise.reject(erroDeStatus(400, { erros: { descricao: ['Obrigatório'] } })),
          { aoErroDeCampo },
        ),
      { wrapper },
    );
    result.current.mutate();
    await waitFor(() => expect(aoErroDeCampo).toHaveBeenCalledWith({ descricao: ['Obrigatório'] }));
    expect(erro).not.toHaveBeenCalled();
  });

  it('401 → silencioso (interceptor cuida)', async () => {
    const { result } = renderHook(
      () => useMutacaoComErro(() => Promise.reject(erroDeStatus(401, {}))),
      { wrapper },
    );
    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(erro).not.toHaveBeenCalled();
  });

  it.each([
    [403, 'Sem acesso'],
    [404, 'Não encontrado'],
    [409, 'Código de barras já está em uso'],
    [422, 'Saldo insuficiente'],
    [423, 'Conta bloqueada'],
  ])('%i → toast com a mensagem do backend', async (status, mensagem) => {
    const { result } = renderHook(
      () => useMutacaoComErro(() => Promise.reject(erroDeStatus(status, { mensagem }))),
      { wrapper },
    );
    result.current.mutate();
    await waitFor(() => expect(erro).toHaveBeenCalledWith(mensagem));
  });

  it('500 → toast genérico', async () => {
    const { result } = renderHook(
      () => useMutacaoComErro(() => Promise.reject(erroDeStatus(500, {}))),
      { wrapper },
    );
    result.current.mutate();
    await waitFor(() =>
      expect(erro).toHaveBeenCalledWith('Ocorreu um erro inesperado. Tente novamente.'),
    );
  });

  it('sucesso com mensagemSucesso → toast de sucesso', async () => {
    const { result } = renderHook(
      () => useMutacaoComErro(() => Promise.resolve('ok'), { mensagemSucesso: 'Produto salvo' }),
      { wrapper },
    );
    result.current.mutate();
    await waitFor(() => expect(sucesso).toHaveBeenCalledWith('Produto salvo'));
  });
});
