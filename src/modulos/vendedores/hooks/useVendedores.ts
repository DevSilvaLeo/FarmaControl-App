import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import { vendedoresApi, type ListarVendedoresParams } from '../api';
import type { DadosVendedor, FaixaMetaEntrada } from '../tipos';

export function useListarVendedores(params: ListarVendedoresParams) {
  return useQuery({
    queryKey: ['vendedores', 'lista', params],
    queryFn: () => vendedoresApi.listar(params),
    placeholderData: (a) => a,
  });
}

export function useVendedor(id: number | undefined) {
  return useQuery({
    queryKey: ['vendedores', 'detalhe', id],
    queryFn: () => vendedoresApi.obterPorId(id!),
    enabled: id != null,
  });
}

function useInvalidar() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['vendedores'] });
}

export function useSalvarVendedor(id: number | undefined, o?: { aoSalvar?: (id: number) => void }) {
  const invalidar = useInvalidar();
  return useMutacaoComErro(
    async (dados: DadosVendedor) => {
      if (id != null) {
        await vendedoresApi.atualizar(id, dados);
        return id;
      }
      return vendedoresApi.criar(dados);
    },
    {
      mensagemSucesso: 'Vendedor salvo.',
      onSuccess: (idSalvo) => {
        void invalidar();
        o?.aoSalvar?.(idSalvo);
      },
    },
  );
}

export function useStatusVendedor(id: number) {
  const invalidar = useInvalidar();
  return useMutacaoComErro(
    (ativar: boolean) => (ativar ? vendedoresApi.reativar(id) : vendedoresApi.inativar(id)),
    { mensagemSucesso: 'Status atualizado.', onSuccess: () => void invalidar() },
  );
}

export function useDefinirMetas(id: number, o?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidar();
  return useMutacaoComErro((faixas: FaixaMetaEntrada[]) => vendedoresApi.definirMetas(id, faixas), {
    mensagemSucesso: 'Metas atualizadas.',
    onSuccess: () => {
      void invalidar();
      o?.aoSalvar?.();
    },
  });
}

export function useDebitos(id: number | undefined) {
  return useQuery({
    queryKey: ['vendedores', id, 'debitos'],
    queryFn: () => vendedoresApi.listarDebitos(id!),
    enabled: id != null,
  });
}

export function useRegistrarDebito(id: number, o?: { aoRegistrar?: () => void }) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    (body: { competenciaUtc: string; valor: number; motivo: string }) =>
      vendedoresApi.registrarDebito(id, body),
    {
      mensagemSucesso: 'Débito registrado.',
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ['vendedores', id, 'debitos'] });
        o?.aoRegistrar?.();
      },
    },
  );
}
