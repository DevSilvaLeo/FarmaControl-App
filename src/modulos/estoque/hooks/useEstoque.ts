import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import { usarListaComoPaged } from '@/compartilhado/hooks/usarListaComoPaged';
import {
  consultasApi,
  depositosApi,
  movimentacoesApi,
  type ListarKardexParams,
  type ListarPosicaoParams,
} from '../api';
import type {
  AjustarEstoqueBody,
  RegistrarEntradaBody,
  RegistrarSaidaBody,
  TipoDeposito,
} from '../tipos';

// ---------------- Depósitos ----------------
export function useDepositos(incluirInativos = false) {
  return useQuery({
    queryKey: ['depositos', incluirInativos],
    queryFn: () => depositosApi.listar(incluirInativos),
    staleTime: 60_000,
  });
}
export function useConsultaDepositos(p: { incluirInativos: boolean }) {
  return usarListaComoPaged(useDepositos(p.incluirInativos));
}
function useInvalidarDepositos() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['depositos'] });
}
export function useSalvarDeposito(id: number | undefined, o?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidarDepositos();
  return useMutacaoComErro(
    async (body: { nome: string; codigo: string; tipo: TipoDeposito }) => {
      if (id != null) return depositosApi.atualizar(id, body);
      return depositosApi.criar(body).then(() => undefined);
    },
    {
      mensagemSucesso: 'Depósito salvo.',
      onSuccess: () => {
        void invalidar();
        o?.aoSalvar?.();
      },
    },
  );
}
export function useAcaoDeposito(id: number) {
  const invalidar = useInvalidarDepositos();
  const opts = { onSuccess: () => void invalidar() };
  return {
    definirPadrao: useMutacaoComErro(() => depositosApi.definirPadrao(id), {
      mensagemSucesso: 'Depósito padrão definido.',
      ...opts,
    }),
    alterarStatus: useMutacaoComErro(
      (ativar: boolean) => (ativar ? depositosApi.reativar(id) : depositosApi.inativar(id)),
      { mensagemSucesso: 'Status atualizado.', ...opts },
    ),
  };
}

// ---------------- Movimentações ----------------
function useInvalidarEstoque() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['posicao'] });
    void qc.invalidateQueries({ queryKey: ['kardex'] });
    void qc.invalidateQueries({ queryKey: ['lotes-a-vencer'] });
  };
}
export function useRegistrarEntrada(o?: { aoRegistrar?: (ids: number[]) => void }) {
  const invalidar = useInvalidarEstoque();
  return useMutacaoComErro((body: RegistrarEntradaBody) => movimentacoesApi.entrada(body), {
    aoErro: () => true,
    onSuccess: (ids) => {
      invalidar();
      o?.aoRegistrar?.(ids);
    },
  });
}
export function useRegistrarSaida(o?: { aoRegistrar?: (ids: number[]) => void }) {
  const invalidar = useInvalidarEstoque();
  return useMutacaoComErro((body: RegistrarSaidaBody) => movimentacoesApi.saida(body), {
    aoErro: () => true,
    onSuccess: (ids) => {
      invalidar();
      o?.aoRegistrar?.(ids);
    },
  });
}
export function useRegistrarAjuste(o?: { aoRegistrar?: (ids: number[]) => void }) {
  const invalidar = useInvalidarEstoque();
  return useMutacaoComErro((body: AjustarEstoqueBody) => movimentacoesApi.ajuste(body), {
    aoErro: () => true,
    onSuccess: (ids) => {
      invalidar();
      o?.aoRegistrar?.(ids);
    },
  });
}

// ---------------- Consultas ----------------
export function usePosicao(params: ListarPosicaoParams) {
  return useQuery({
    queryKey: ['posicao', params],
    queryFn: () => consultasApi.posicao(params),
    placeholderData: (a) => a,
  });
}
export function usePosicaoPorLote(produtoId: number | undefined, depositoId?: number) {
  return useQuery({
    queryKey: ['posicao', 'lote', produtoId, depositoId],
    queryFn: () => consultasApi.posicaoPorLote(produtoId!, depositoId),
    enabled: produtoId != null,
  });
}
export function useKardex(params: ListarKardexParams | null) {
  return useQuery({
    queryKey: ['kardex', params],
    queryFn: () => consultasApi.kardex(params!),
    enabled: params != null && params.produtoId > 0,
    placeholderData: (a) => a,
  });
}
export function useLotesAVencer(dias: number, depositoId?: number) {
  return useQuery({
    queryKey: ['lotes-a-vencer', dias, depositoId],
    queryFn: () => consultasApi.lotesAVencer(dias, depositoId),
  });
}
