import type { ComponentType } from 'react';
import {
  AppstoreOutlined,
  DatabaseOutlined,
  InboxOutlined,
  SettingOutlined,
  MonitorOutlined,
} from '@ant-design/icons';

/**
 * Estrutura de menu — placeholder da Etapa 0 (`.spec/04` §4.4).
 * Nesta etapa o menu é ESTÁTICO: todos os itens visíveis, sem filtro por
 * permissão e sem dado real por trás. O filtro por `permissao` entra na
 * Etapa 3 (`.spec/06` §6.9); a chave já é declarada aqui para não haver
 * retrabalho depois.
 */
export interface ItemMenu {
  chave: string;
  rotulo: string;
  caminho?: string;
  icone?: ComponentType;
  /** Chave de permissão exigida (ainda não aplicada na Etapa 0). */
  permissao?: string;
  /** Fase do roadmap em que a tela real é entregue (só informativo). */
  fase?: string;
  filhos?: ItemMenu[];
}

export const menuPrincipal: ItemMenu[] = [
  {
    chave: 'painel',
    rotulo: 'Painel',
    caminho: '/',
    icone: AppstoreOutlined,
  },
  {
    chave: 'cadastros',
    rotulo: 'Cadastros',
    icone: DatabaseOutlined,
    filhos: [
      { chave: 'produtos', rotulo: 'Produtos', caminho: '/produtos', permissao: 'Produtos.Consultar', fase: 'Fase 3' },
      { chave: 'clientes', rotulo: 'Clientes', caminho: '/clientes', permissao: 'Clientes.Consultar', fase: 'Fase 3' },
      { chave: 'fornecedores', rotulo: 'Fornecedores', caminho: '/fornecedores', permissao: 'Fornecedores.Consultar', fase: 'Fase 4' },
      { chave: 'transportadoras', rotulo: 'Transportadoras', caminho: '/transportadoras', permissao: 'Fornecedores.Consultar', fase: 'Fase 4' },
      { chave: 'representantes', rotulo: 'Representantes', caminho: '/representantes', permissao: 'Fornecedores.Consultar', fase: 'Fase 4' },
      { chave: 'vendedores', rotulo: 'Vendedores', caminho: '/vendedores', permissao: 'Vendedores.Consultar', fase: 'Fase 4' },
    ],
  },
  {
    chave: 'estoque',
    rotulo: 'Estoque',
    icone: InboxOutlined,
    filhos: [
      { chave: 'depositos', rotulo: 'Depósitos', caminho: '/estoque/depositos', permissao: 'Estoque.Consultar', fase: 'Fase 5' },
      { chave: 'posicao', rotulo: 'Posição', caminho: '/estoque/posicao', permissao: 'Estoque.Consultar', fase: 'Fase 5' },
      { chave: 'kardex', rotulo: 'Kardex', caminho: '/estoque/kardex', permissao: 'Estoque.Consultar', fase: 'Fase 5' },
      { chave: 'lotes-a-vencer', rotulo: 'Lotes a vencer', caminho: '/estoque/lotes-a-vencer', permissao: 'Estoque.Consultar', fase: 'Fase 5' },
    ],
  },
  {
    chave: 'sistema',
    rotulo: 'Sistema',
    icone: SettingOutlined,
    filhos: [
      { chave: 'empresas', rotulo: 'Empresas e Filiais', caminho: '/sistema/empresas', permissao: 'Empresas.Consultar', fase: 'Fase 2' },
      { chave: 'usuarios', rotulo: 'Usuários', caminho: '/sistema/usuarios', permissao: 'Usuarios.Consultar', fase: 'Fase 2' },
      { chave: 'perfis', rotulo: 'Perfis e Permissões', caminho: '/sistema/perfis', permissao: 'Perfis.Consultar', fase: 'Fase 2' },
    ],
  },
];

/** Item sempre visível, sem exigência de permissão (`.spec/04` §4.4). */
export const itemDiagnostico: ItemMenu = {
  chave: 'diagnostico',
  rotulo: 'Diagnóstico',
  caminho: '/diagnostico',
  icone: MonitorOutlined,
};
