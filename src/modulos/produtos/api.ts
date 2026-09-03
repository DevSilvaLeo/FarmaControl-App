import { clienteHttp } from '@/compartilhado/api/clienteHttp';
import type { PagedResult, ParametrosPaginacao } from '@/compartilhado/api/tipos';
import type {
  DadosProduto,
  ItemApoioDto,
  LaboratorioDto,
  ProdutoDto,
  ProdutoResumoDto,
  ProdutoUnidadeDto,
  SubgrupoDto,
  UnidadeDto,
} from './tipos';

export interface ListarProdutosParams extends ParametrosPaginacao {
  termoBusca?: string;
  grupoId?: number;
  incluirInativos?: boolean;
}

export const produtosApi = {
  listar: (params: ListarProdutosParams) =>
    clienteHttp.get<PagedResult<ProdutoResumoDto>>('/produtos', { params }).then((r) => r.data),
  obterPorId: (id: number) =>
    clienteHttp.get<ProdutoDto>(`/produtos/${id}`).then((r) => r.data),
  /** `POST /produtos` recebe `{ dados }` (aninhado). */
  criar: (dados: DadosProduto) =>
    clienteHttp.post<number>('/produtos', { dados }).then((r) => r.data),
  /** `PUT /produtos/{id}` recebe `DadosProduto` plano. */
  atualizar: (id: number, dados: DadosProduto) =>
    clienteHttp.put(`/produtos/${id}`, dados).then(() => undefined),
  inativar: (id: number) => clienteHttp.post(`/produtos/${id}/inativar`).then(() => undefined),
  reativar: (id: number) => clienteHttp.post(`/produtos/${id}/reativar`).then(() => undefined),
  definirPrecos: (
    id: number,
    body: {
      precoCusto: number;
      precoVenda: number;
      margemPadrao?: number | null;
      percentualComissao?: number | null;
    },
  ) => clienteHttp.put(`/produtos/${id}/precos`, body).then(() => undefined),
  /** `PUT /produtos/{id}/unidades` recebe o array direto (substituição total). */
  definirUnidades: (id: number, unidades: ProdutoUnidadeDto[]) =>
    clienteHttp.put(`/produtos/${id}/unidades`, unidades).then(() => undefined),
};

// --- Cadastros de apoio ---
export const apoioApi = {
  listarMarcas: () => clienteHttp.get<ItemApoioDto[]>('/marcas').then((r) => r.data),
  criarMarca: (nome: string) => clienteHttp.post<number>('/marcas', { nome }).then((r) => r.data),
  renomearMarca: (id: number, nome: string) =>
    clienteHttp.put(`/marcas/${id}`, { nome }).then(() => undefined),

  listarDepartamentos: () => clienteHttp.get<ItemApoioDto[]>('/departamentos').then((r) => r.data),
  criarDepartamento: (nome: string) =>
    clienteHttp.post<number>('/departamentos', { nome }).then((r) => r.data),

  listarGrupos: () => clienteHttp.get<ItemApoioDto[]>('/grupos').then((r) => r.data),
  criarGrupo: (nome: string) => clienteHttp.post<number>('/grupos', { nome }).then((r) => r.data),

  listarSubgrupos: (grupoId: number) =>
    clienteHttp.get<SubgrupoDto[]>('/subgrupos', { params: { grupoId } }).then((r) => r.data),
  criarSubgrupo: (grupoId: number, nome: string) =>
    clienteHttp.post<number>('/subgrupos', { grupoId, nome }).then((r) => r.data),

  listarLaboratorios: () => clienteHttp.get<LaboratorioDto[]>('/laboratorios').then((r) => r.data),
  criarLaboratorio: (nome: string, cnpj?: string) =>
    clienteHttp.post<number>('/laboratorios', { nome, cnpj }).then((r) => r.data),

  listarUnidades: () => clienteHttp.get<UnidadeDto[]>('/unidades').then((r) => r.data),
  criarUnidade: (body: { sigla: string; descricao: string; permiteFracionar: boolean }) =>
    clienteHttp.post<number>('/unidades', body).then((r) => r.data),
};
