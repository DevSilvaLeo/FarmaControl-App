import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import { usarListaComoPaged } from '@/compartilhado/hooks/usarListaComoPaged';
import {
  fornecedoresApi,
  representantesApi,
  transportadorasApi,
  type ListarParceirosParams,
} from '../api';
import type {
  CriarFornecedorBody,
  CriarRepresentanteBody,
  CriarTransportadoraBody,
} from '../tipos';

// ---------------- Fornecedores ----------------
export function useListarFornecedores(params: ListarParceirosParams) {
  return useQuery({
    queryKey: ['fornecedores', 'lista', params],
    queryFn: () => fornecedoresApi.listar(params),
    placeholderData: (a) => a,
  });
}
export function useFornecedor(id: number | undefined) {
  return useQuery({
    queryKey: ['fornecedores', 'detalhe', id],
    queryFn: () => fornecedoresApi.obterPorId(id!),
    enabled: id != null,
  });
}
export function useSalvarFornecedor(id: number | undefined, o?: { aoSalvar?: (id: number) => void }) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    async (body: CriarFornecedorBody) => {
      if (id != null) {
        await fornecedoresApi.atualizar(id, body);
        return id;
      }
      return fornecedoresApi.criar(body);
    },
    {
      mensagemSucesso: 'Fornecedor salvo.',
      onSuccess: (idSalvo) => {
        void qc.invalidateQueries({ queryKey: ['fornecedores'] });
        o?.aoSalvar?.(idSalvo);
      },
    },
  );
}
export function useStatusFornecedor(id: number) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    (ativar: boolean) => (ativar ? fornecedoresApi.reativar(id) : fornecedoresApi.inativar(id)),
    { mensagemSucesso: 'Status atualizado.', onSuccess: () => void qc.invalidateQueries({ queryKey: ['fornecedores'] }) },
  );
}

// ---------------- Transportadoras ----------------
export function useListarTransportadoras(params: ListarParceirosParams) {
  return useQuery({
    queryKey: ['transportadoras', 'lista', params],
    queryFn: () => transportadorasApi.listar(params),
    placeholderData: (a) => a,
  });
}
export function useTransportadora(id: number | undefined) {
  return useQuery({
    queryKey: ['transportadoras', 'detalhe', id],
    queryFn: () => transportadorasApi.obterPorId(id!),
    enabled: id != null,
  });
}
export function useSalvarTransportadora(id: number | undefined, o?: { aoSalvar?: (id: number) => void }) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    async (body: CriarTransportadoraBody) => {
      if (id != null) {
        await transportadorasApi.atualizar(id, body);
        return id;
      }
      return transportadorasApi.criar(body);
    },
    {
      mensagemSucesso: 'Transportadora salva.',
      onSuccess: (idSalvo) => {
        void qc.invalidateQueries({ queryKey: ['transportadoras'] });
        o?.aoSalvar?.(idSalvo);
      },
    },
  );
}
export function useStatusTransportadora(id: number) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    (ativar: boolean) => (ativar ? transportadorasApi.reativar(id) : transportadorasApi.inativar(id)),
    {
      mensagemSucesso: 'Status atualizado.',
      onSuccess: () => void qc.invalidateQueries({ queryKey: ['transportadoras'] }),
    },
  );
}

// ---------------- Representantes ----------------
export function useListarRepresentantes(incluirInativos: boolean) {
  return usarListaComoPaged(
    useQuery({
      queryKey: ['representantes', 'lista', incluirInativos],
      queryFn: () => representantesApi.listar(incluirInativos),
    }),
  );
}

/** Adaptador para o `ParceiroListaPage` genérico (mesma assinatura das listas paginadas). */
export function useConsultaRepresentantes(p: { incluirInativos: boolean }) {
  return useListarRepresentantes(p.incluirInativos);
}
export function useRepresentante(id: number | undefined) {
  return useQuery({
    queryKey: ['representantes', 'detalhe', id],
    queryFn: () => representantesApi.obterPorId(id!),
    enabled: id != null,
  });
}
export function useSalvarRepresentante(id: number | undefined, o?: { aoSalvar?: (id: number) => void }) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    async (body: CriarRepresentanteBody) => {
      if (id != null) {
        await representantesApi.atualizar(id, body);
        return id;
      }
      return representantesApi.criar(body);
    },
    {
      mensagemSucesso: 'Representante salvo.',
      onSuccess: (idSalvo) => {
        void qc.invalidateQueries({ queryKey: ['representantes'] });
        o?.aoSalvar?.(idSalvo);
      },
    },
  );
}
export function useInativarRepresentante(id: number) {
  const qc = useQueryClient();
  return useMutacaoComErro(() => representantesApi.inativar(id), {
    mensagemSucesso: 'Representante inativado.',
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['representantes'] }),
  });
}
