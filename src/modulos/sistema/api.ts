import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import type { PagedResult, ParametrosPaginacao } from '@/compartilhado/api/tipos';
import type {
  CriarUsuarioBody,
  EmpresaDto,
  EmpresaResumoDto,
  FilialDto,
  ModuloPermissoesDto,
  PerfilDto,
  PerfilResumoDto,
  UsuarioDto,
  UsuarioResumoDto,
} from './tipos';

export interface ListarUsuariosParams extends ParametrosPaginacao {
  termoBusca?: string;
  incluirInativos?: boolean;
}

export const usuariosApi = {
  listar: (params: ListarUsuariosParams) =>
    clienteHttp.get<PagedResult<UsuarioResumoDto>>('/usuarios', { params }).then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<UsuarioDto>(`/usuarios/${id}`).then((r) => r.data),
  criar: (body: CriarUsuarioBody) =>
    clienteHttp.post<number>('/usuarios', body).then((r) => r.data),
  definirPerfis: (id: number, perfis: string[]) =>
    clienteHttp.put(`/usuarios/${id}/perfis`, { perfis }).then(() => undefined),
  redefinirSenha: (id: number, novaSenha: string) =>
    clienteHttp.put(`/usuarios/${id}/senha`, { novaSenha }).then(() => undefined),
  inativar: (id: number) =>
    clienteHttp.post(`/usuarios/${id}/inativar`).then(() => undefined),
  reativar: (id: number) =>
    clienteHttp.post(`/usuarios/${id}/reativar`).then(() => undefined),
};

export const perfisApi = {
  listar: (incluirInativos = false) =>
    clienteHttp
      .get<PerfilResumoDto[]>('/perfis', { params: { incluirInativos } })
      .then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<PerfilDto>(`/perfis/${id}`).then((r) => r.data),
  criar: (body: { nome: string; descricao?: string }) =>
    clienteHttp.post<number>('/perfis', body).then((r) => r.data),
  atualizar: (id: number, body: { nome: string; descricao?: string }) =>
    clienteHttp.put(`/perfis/${id}`, body).then(() => undefined),
  definirPermissoes: (id: number, chaves: string[]) =>
    clienteHttp.put(`/perfis/${id}/permissoes`, { chaves }).then(() => undefined),
  inativar: (id: number) =>
    clienteHttp.post(`/perfis/${id}/inativar`).then(() => undefined),
};

export const permissoesApi = {
  listar: () =>
    clienteHttp.get<ModuloPermissoesDto[]>('/permissoes').then((r) => r.data),
};

export const empresasApi = {
  listar: (incluirInativas = false) =>
    clienteHttp
      .get<EmpresaResumoDto[]>('/empresas', { params: { incluirInativas } })
      .then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<EmpresaDto>(`/empresas/${id}`).then((r) => r.data),
  criar: (body: { razaoSocial: string; nomeFantasia?: string; documento: string }) =>
    clienteHttp.post<number>('/empresas', body).then((r) => r.data),
  listarFiliais: (empresaId: number) =>
    clienteHttp.get<FilialDto[]>(`/empresas/${empresaId}/filiais`).then((r) => r.data),
  criarFilial: (empresaId: number, nome: string) =>
    clienteHttp.post<number>(`/empresas/${empresaId}/filiais`, { nome }).then((r) => r.data),
};
