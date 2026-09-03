import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import { centrosCustoApi, type CentroCustoBody } from '../api';

export function useCentrosCusto(incluirInativos = false) {
  return useQuery({
    queryKey: ['centros-custo', incluirInativos],
    queryFn: () => centrosCustoApi.listar(incluirInativos),
    staleTime: 60_000,
  });
}

function useInvalidar() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['centros-custo'] });
}

export function useSalvarCentroCusto(id: number | undefined, o?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidar();
  return useMutacaoComErro(
    async (body: CentroCustoBody) => {
      if (id != null) return centrosCustoApi.atualizar(id, body);
      return centrosCustoApi.criar(body).then(() => undefined);
    },
    {
      mensagemSucesso: 'Centro de custo salvo.',
      onSuccess: () => {
        void invalidar();
        o?.aoSalvar?.();
      },
    },
  );
}

export function useAcaoCentroCusto(id: number) {
  const invalidar = useInvalidar();
  return {
    alterarStatus: useMutacaoComErro(
      (ativar: boolean) => (ativar ? centrosCustoApi.reativar(id) : centrosCustoApi.inativar(id)),
      { mensagemSucesso: 'Status atualizado.', onSuccess: () => void invalidar() },
    ),
  };
}
