import { createElement, useMemo } from 'react';
import { Drawer, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { itemDiagnostico, menuPrincipal, type ItemMenu } from './menuConfig';

function paraItemAntd(item: ItemMenu): Required<MenuProps>['items'][number] {
  return {
    key: item.caminho ?? item.chave,
    label: item.rotulo,
    icon: item.icone ? createElement(item.icone) : undefined,
    children: item.filhos?.map(paraItemAntd),
  };
}

/**
 * Navegação completa em árvore (`.docs/03` §3.1). É o meio principal de
 * navegação em `md:` (tablet) e um complemento no mobile.
 */
export function NavDrawer({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const itens = useMemo(
    () => [...menuPrincipal.map(paraItemAntd), { type: 'divider' as const }, paraItemAntd(itemDiagnostico)],
    [],
  );

  const chavesAbertas = useMemo(
    () =>
      menuPrincipal
        .filter((grupo) => grupo.filhos?.some((f) => f.caminho && location.pathname.startsWith(f.caminho)))
        .map((grupo) => grupo.chave),
    [location.pathname],
  );

  return (
    <Drawer
      title="Navegação"
      placement="left"
      open={aberto}
      onClose={aoFechar}
      size="default"
      styles={{ body: { padding: 0 } }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={chavesAbertas}
        items={itens}
        onClick={({ key }) => {
          if (typeof key === 'string' && key.startsWith('/')) {
            navigate(key);
            aoFechar();
          }
        }}
      />
    </Drawer>
  );
}
