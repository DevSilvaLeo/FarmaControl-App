import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import { apoioApi, produtosApi, type ListarProdutosParams } from '../api';
import type { DadosProduto, ProdutoUnidadeDto } from '../tipos';

export function useListarProdutos(params: ListarProdutosParams) {
  return useQuery({
    queryKey: ['produtos', 'lista', params],
    queryFn: () => produtosApi.listar(params),
    placeholderData: (anterior) => anterior,
  });
}

export function useProduto(id: number | undefined) {
  return useQuery({
    queryKey: ['produtos', 'detalhe', id],
    queryFn: () => produtosApi.obterPorId(id!),
    enabled: id != null,
  });
}

function useInvalidarProdutos() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['produtos'] });
}

export function useSalvarProduto(
  id: number | undefined,
  opcoes?: { aoSalvar?: (id: number) => void },
) {
  const invalidar = useInvalidarProdutos();
  return useMutacaoComErro(
    async (dados: DadosProduto) => {
      if (id != null) {
        await produtosApi.atualizar(id, dados);
        return id;
      }
      return produtosApi.criar(dados);
    },
    {
      mensagemSucesso: 'Produto salvo.',
      onSuccess: (idSalvo) => {
        void invalidar();
        opcoes?.aoSalvar?.(idSalvo);
      },
    },
  );
}

export function useAlterarStatusProduto(id: number) {
  const invalidar = useInvalidarProdutos();
  return useMutacaoComErro(
    (ativar: boolean) => (ativar ? produtosApi.reativar(id) : produtosApi.inativar(id)),
    { mensagemSucesso: 'Status atualizado.', onSuccess: () => void invalidar() },
  );
}

export function useDefinirPrecos(id: number, opcoes?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidarProdutos();
  return useMutacaoComErro(
    (body: {
      precoCusto: number;
      precoVenda: number;
      margemPadrao?: number | null;
      percentualComissao?: number | null;
    }) => produtosApi.definirPrecos(id, body),
    {
      mensagemSucesso: 'Preços atualizados.',
      onSuccess: () => {
        void invalidar();
        opcoes?.aoSalvar?.();
      },
    },
  );
}

export function useDefinirUnidades(id: number, opcoes?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidarProdutos();
  return useMutacaoComErro((unidades: ProdutoUnidadeDto[]) => produtosApi.definirUnidades(id, unidades), {
    mensagemSucesso: 'Unidades alternativas salvas.',
    onSuccess: () => {
      void invalidar();
      opcoes?.aoSalvar?.();
    },
  });
}

// --- apoio ---
export function useMarcas() {
  return useQuery({ queryKey: ['apoio', 'marcas'], queryFn: apoioApi.listarMarcas, staleTime: 5 * 60_000 });
}
export function useDepartamentos() {
  return useQuery({
    queryKey: ['apoio', 'departamentos'],
    queryFn: apoioApi.listarDepartamentos,
    staleTime: 5 * 60_000,
  });
}
export function useGrupos() {
  return useQuery({ queryKey: ['apoio', 'grupos'], queryFn: apoioApi.listarGrupos, staleTime: 5 * 60_000 });
}
export function useSubgrupos(grupoId: number | undefined) {
  return useQuery({
    queryKey: ['apoio', 'subgrupos', grupoId],
    queryFn: () => apoioApi.listarSubgrupos(grupoId!),
    enabled: grupoId != null && grupoId > 0,
  });
}
export function useLaboratorios() {
  return useQuery({
    queryKey: ['apoio', 'laboratorios'],
    queryFn: apoioApi.listarLaboratorios,
    staleTime: 5 * 60_000,
  });
}
export function useUnidades() {
  return useQuery({
    queryKey: ['apoio', 'unidades'],
    queryFn: apoioApi.listarUnidades,
    staleTime: 5 * 60_000,
  });
}

export function useInvalidarApoio() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['apoio'] });
}
