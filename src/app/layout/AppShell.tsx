import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { SidebarNav } from './SidebarNav';
import { BottomNav } from './BottomNav';
import { NavDrawer } from './NavDrawer';

const CHAVE_SIDEBAR = 'farmacontrol:sidebar-colapsada';

function lerColapsada(): boolean {
  try {
    return localStorage.getItem(CHAVE_SIDEBAR) === '1';
  } catch {
    return false;
  }
}

/**
 * Casca da aplicação (`.spec/04` §4.3 item 5), já mobile-first (`.docs/03` §3.1):
 *  - `< lg`  : topbar + drawer (ícone hambúrguer) + bottom nav fixo.
 *  - `lg:`   : sidebar fixa colapsável + topbar; sem bottom nav.
 * Menu ESTÁTICO nesta etapa (filtro por permissão entra na Etapa 3).
 */
export function AppShell() {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [colapsada, setColapsada] = useState(lerColapsada);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_SIDEBAR, colapsada ? '1' : '0');
    } catch {
      /* ambiente sem storage — ignora */
    }
  }, [colapsada]);

  return (
    <div className="flex min-h-screen">
      <SidebarNav colapsada={colapsada} aoAlternar={() => setColapsada((v) => !v)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar aoAbrirMenu={() => setDrawerAberto(true)} />

        {/* `overflow-x-clip` + `min-w-0` no pai: conteúdo largo (Kardex/Posição)
            rola dentro do seu próprio container, o body nunca na horizontal
            (`agents.md` "Responsive"). */}
        <main className="min-w-0 flex-1 overflow-x-clip px-4 py-4 pb-24 lg:px-6 lg:py-6 lg:pb-6">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet />
          </div>
        </main>

        <BottomNav aoAbrirMais={() => setDrawerAberto(true)} />
      </div>

      <NavDrawer aberto={drawerAberto} aoFechar={() => setDrawerAberto(false)} />
    </div>
  );
}
