import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import {
  clientesApi,
  segmentosApi,
  type EnderecoBody,
  type ListarClientesParams,
} from '../api';
import type { DadosCliente } from '../tipos';

export function useListarClientes(params: ListarClientesParams) {
  return useQuery({
    queryKey: ['clientes', 'lista', params],
    queryFn: () => clientesApi.listar(params),
    placeholderData: (a) => a,
  });
}

export function useCliente(id: number | undefined) {
  return useQuery({
    queryKey: ['clientes', 'detalhe', id],
    queryFn: () => clientesApi.obterPorId(id!),
    enabled: id != null,
  });
}

function useInvalidar() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['clientes'] });
}

export function useSalvarCliente(id: number | undefined, opcoes?: { aoSalvar?: (id: number) => void }) {
  const invalidar = useInvalidar();
  return useMutacaoComErro(
    async (dados: DadosCliente) => {
      if (id != null) {
        await clientesApi.atualizar(id, dados);
        return id;
      }
      return clientesApi.criar(dados);
    },
    {
      mensagemSucesso: 'Cliente salvo.',
      onSuccess: (idSalvo) => {
        void invalidar();
        opcoes?.aoSalvar?.(idSalvo);
      },
    },
  );
}

export function useAlterarStatusCliente(id: number) {
  const invalidar = useInvalidar();
  return useMutacaoComErro(
    (ativar: boolean) => (ativar ? clientesApi.reativar(id) : clientesApi.inativar(id)),
    { mensagemSucesso: 'Status atualizado.', onSuccess: () => void invalidar() },
  );
}

export function useBloqueioCliente(id: number) {
  const invalidar = useInvalidar();
  return {
    bloquear: useMutacaoComErro((motivo: string) => clientesApi.bloquear(id, motivo), {
      mensagemSucesso: 'Cliente bloqueado.',
      onSuccess: () => void invalidar(),
    }),
    desbloquear: useMutacaoComErro(() => clientesApi.desbloquear(id), {
      mensagemSucesso: 'Cliente desbloqueado.',
      onSuccess: () => void invalidar(),
    }),
  };
}

export function useDefinirLimiteCredito(id: number, opcoes?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidar();
  return useMutacaoComErro((limite: number) => clientesApi.definirLimiteCredito(id, limite), {
    mensagemSucesso: 'Limite de crédito atualizado.',
    onSuccess: () => {
      void invalidar();
      opcoes?.aoSalvar?.();
    },
  });
}

export function useAdicionarContato(id: number, opcoes?: { aoAdicionar?: () => void }) {
  const invalidar = useInvalidar();
  return useMutacaoComErro(
    (body: { nome: string; cargo?: string; email?: string; telefone?: string }) =>
      clientesApi.adicionarContato(id, body),
    {
      mensagemSucesso: 'Contato adicionado.',
      onSuccess: () => {
        void invalidar();
        opcoes?.aoAdicionar?.();
      },
    },
  );
}

export function useAdicionarEndereco(id: number, tipo: 'entrega' | 'cobranca', opcoes?: { aoAdicionar?: () => void }) {
  const invalidar = useInvalidar();
  return useMutacaoComErro(
    (body: EnderecoBody) =>
      tipo === 'entrega'
        ? clientesApi.adicionarEnderecoEntrega(id, body)
        : clientesApi.adicionarEnderecoCobranca(id, body),
    {
      mensagemSucesso: 'Endereço adicionado.',
      onSuccess: () => {
        void invalidar();
        opcoes?.aoAdicionar?.();
      },
    },
  );
}

export function useSegmentos() {
  return useQuery({ queryKey: ['segmentos'], queryFn: segmentosApi.listar, staleTime: 5 * 60_000 });
}

export function useSalvarSegmento(opcoes?: { aoSalvar?: () => void }) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    (body: { id?: number; nome: string; orgaoPublico: boolean }) =>
      body.id != null
        ? segmentosApi.atualizar(body.id, { nome: body.nome, orgaoPublico: body.orgaoPublico })
        : segmentosApi.criar({ nome: body.nome, orgaoPublico: body.orgaoPublico }),
    {
      mensagemSucesso: 'Segmento salvo.',
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ['segmentos'] });
        opcoes?.aoSalvar?.();
      },
    },
  );
}
