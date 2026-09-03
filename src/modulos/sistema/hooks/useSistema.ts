import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutacaoComErro } from '@/compartilhado/hooks/useMutacaoComErro';
import {
  empresasApi,
  perfisApi,
  permissoesApi,
  usuariosApi,
  type ListarUsuariosParams,
} from '../api';
import type { CriarUsuarioBody } from '../tipos';

// ---------------------------------------------------------------- Usuários
export function useListarUsuarios(params: ListarUsuariosParams) {
  return useQuery({
    queryKey: ['usuarios', 'lista', params],
    queryFn: () => usuariosApi.listar(params),
    placeholderData: (anterior) => anterior,
  });
}

export function useUsuario(id: number | undefined) {
  return useQuery({
    queryKey: ['usuarios', 'detalhe', id],
    queryFn: () => usuariosApi.obterPorId(id!),
    enabled: id != null,
  });
}

function useInvalidarUsuarios() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['usuarios'] });
}

export function useCriarUsuario(opcoes?: { aoCriar?: (id: number) => void }) {
  const invalidar = useInvalidarUsuarios();
  return useMutacaoComErro((body: CriarUsuarioBody) => usuariosApi.criar(body), {
    mensagemSucesso: 'Usuário criado.',
    onSuccess: (id) => {
      void invalidar();
      opcoes?.aoCriar?.(id);
    },
  });
}

export function useDefinirPerfisDoUsuario(id: number, opcoes?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidarUsuarios();
  return useMutacaoComErro((perfilIds: number[]) => usuariosApi.definirPerfis(id, perfilIds), {
    mensagemSucesso: 'Perfis atualizados.',
    onSuccess: () => {
      void invalidar();
      opcoes?.aoSalvar?.();
    },
  });
}

export function useRedefinirSenhaUsuario(id: number, opcoes?: { aoRedefinir?: () => void }) {
  return useMutacaoComErro((novaSenha: string) => usuariosApi.redefinirSenha(id, novaSenha), {
    mensagemSucesso: 'Senha redefinida.',
    onSuccess: () => opcoes?.aoRedefinir?.(),
  });
}

export function useAlterarStatusUsuario(id: number) {
  const invalidar = useInvalidarUsuarios();
  return useMutacaoComErro(
    (ativar: boolean) => (ativar ? usuariosApi.reativar(id) : usuariosApi.inativar(id)),
    { mensagemSucesso: 'Status atualizado.', onSuccess: () => void invalidar() },
  );
}

// ---------------------------------------------------------------- Perfis
export function useListarPerfis(incluirInativos = false) {
  return useQuery({
    queryKey: ['perfis', 'lista', incluirInativos],
    queryFn: () => perfisApi.listar(incluirInativos),
  });
}

export function usePerfil(id: number | undefined) {
  return useQuery({
    queryKey: ['perfis', 'detalhe', id],
    queryFn: () => perfisApi.obterPorId(id!),
    enabled: id != null,
  });
}

function useInvalidarPerfis() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['perfis'] });
}

export function useSalvarPerfil(id: number | undefined, opcoes?: { aoSalvar?: (id: number) => void }) {
  const invalidar = useInvalidarPerfis();
  return useMutacaoComErro(
    async (body: { nome: string; descricao?: string }) => {
      if (id != null) {
        await perfisApi.atualizar(id, body);
        return id;
      }
      return perfisApi.criar(body);
    },
    {
      mensagemSucesso: 'Perfil salvo.',
      onSuccess: (idSalvo) => {
        void invalidar();
        opcoes?.aoSalvar?.(idSalvo);
      },
    },
  );
}

export function useDefinirPermissoesDoPerfil(id: number, opcoes?: { aoSalvar?: () => void }) {
  const invalidar = useInvalidarPerfis();
  return useMutacaoComErro((chaves: string[]) => perfisApi.definirPermissoes(id, chaves), {
    mensagemSucesso: 'Permissões atualizadas.',
    onSuccess: () => {
      void invalidar();
      opcoes?.aoSalvar?.();
    },
  });
}

export function useInativarPerfil(id: number) {
  const invalidar = useInvalidarPerfis();
  return useMutacaoComErro(() => perfisApi.inativar(id), {
    mensagemSucesso: 'Perfil inativado.',
    onSuccess: () => void invalidar(),
  });
}

export function usePermissoesDisponiveis() {
  return useQuery({
    queryKey: ['permissoes'],
    queryFn: permissoesApi.listar,
    staleTime: 30 * 60_000,
  });
}

// ---------------------------------------------------------------- Empresas
export function useListarEmpresas(incluirInativas = false) {
  return useQuery({
    queryKey: ['empresas', 'lista', incluirInativas],
    queryFn: () => empresasApi.listar(incluirInativas),
  });
}

export function useEmpresa(id: number | undefined) {
  return useQuery({
    queryKey: ['empresas', 'detalhe', id],
    queryFn: () => empresasApi.obterPorId(id!),
    enabled: id != null,
  });
}

export function useCriarEmpresa(opcoes?: { aoCriar?: (id: number) => void }) {
  const qc = useQueryClient();
  return useMutacaoComErro(
    (body: { razaoSocial: string; nomeFantasia?: string; documento: string }) =>
      empresasApi.criar(body),
    {
      mensagemSucesso: 'Empresa criada.',
      onSuccess: (id) => {
        void qc.invalidateQueries({ queryKey: ['empresas'] });
        opcoes?.aoCriar?.(id);
      },
    },
  );
}

export function useFiliais(empresaId: number | undefined) {
  return useQuery({
    queryKey: ['empresas', empresaId, 'filiais'],
    queryFn: () => empresasApi.listarFiliais(empresaId!),
    enabled: empresaId != null,
  });
}

export function useCriarFilial(empresaId: number, opcoes?: { aoCriar?: () => void }) {
  const qc = useQueryClient();
  return useMutacaoComErro((nome: string) => empresasApi.criarFilial(empresaId, nome), {
    mensagemSucesso: 'Filial adicionada.',
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['empresas', empresaId, 'filiais'] });
      opcoes?.aoCriar?.();
    },
  });
}
