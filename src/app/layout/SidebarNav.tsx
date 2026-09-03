import { createElement, useMemo } from 'react';
import { Menu, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Marca } from '@/compartilhado/ui/Marca';
import { itemDiagnostico, type ItemMenu } from './menuConfig';
import { useMenuVisivel } from './useMenuVisivel';

function paraItemAntd(item: ItemMenu): Required<MenuProps>['items'][number] {
  return {
    key: item.caminho ?? item.chave,
    label: item.rotulo,
    icon: item.icone ? createElement(item.icone) : undefined,
    children: item.filhos?.map(paraItemAntd),
  };
}

/**
 * Sidebar fixa do desktop (`lg:` — `.docs/03` §3.1). Colapsável; o estado
 * colapsado é persistido por usuário.
 */
export function SidebarNav({
  colapsada,
  aoAlternar,
}: {
  colapsada: boolean;
  aoAlternar: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = useMenuVisivel();

  const itens = useMemo(
    () => [...menu.map(paraItemAntd), { type: 'divider' as const }, paraItemAntd(itemDiagnostico)],
    [menu],
  );

  const chavesAbertas = useMemo(
    () =>
      menu
        .filter((grupo) => grupo.filhos?.some((f) => f.caminho && location.pathname.startsWith(f.caminho)))
        .map((grupo) => grupo.chave),
    [menu, location.pathname],
  );

  return (
    <aside
      className="hidden shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 lg:flex"
      style={{ width: colapsada ? 64 : 240 }}
    >
      <div className="flex h-16 items-center justify-between px-3">
        {!colapsada && <Marca />}
        <Tooltip title={colapsada ? 'Expandir menu' : 'Recolher menu'} placement="right">
          <button
            type="button"
            aria-label={colapsada ? 'Expandir menu' : 'Recolher menu'}
            onClick={aoAlternar}
            className="grid h-9 w-9 place-items-center rounded-md text-neutral-500 hover:bg-neutral-50"
          >
            {colapsada ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </Tooltip>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          inlineCollapsed={colapsada}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={colapsada ? [] : chavesAbertas}
          items={itens}
          style={{ borderInlineEnd: 'none' }}
          onClick={({ key }) => {
            if (typeof key === 'string' && key.startsWith('/')) navigate(key);
          }}
        />
      </div>
    </aside>
  );
}
