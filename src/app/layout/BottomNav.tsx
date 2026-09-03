import { createElement } from 'react';
import { NavLink } from 'react-router-dom';
import { EllipsisOutlined } from '@ant-design/icons';
import { menuPrincipal } from './menuConfig';

/**
 * Barra de navegação inferior fixa do mobile (`< lg` — `.docs/03` §3.1).
 * Máximo de 5 itens: os 4 módulos de topo + "Mais" (abre o drawer completo).
 */
export function BottomNav({ aoAbrirMais }: { aoAbrirMais: () => void }) {
  const itens = menuPrincipal.slice(0, 4);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-neutral-200 bg-white shadow-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegação principal"
    >
      {itens.map((item) => {
        const destino = item.caminho ?? item.filhos?.[0]?.caminho ?? '/';
        return (
          <NavLink
            key={item.chave}
            to={destino}
            end={destino === '/'}
            className={({ isActive }) =>
              [
                'flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium',
                isActive ? 'text-primary-600' : 'text-neutral-500',
              ].join(' ')
            }
          >
            {item.icone ? createElement(item.icone) : null}
            <span>{item.rotulo}</span>
          </NavLink>
        );
      })}
      <button
        type="button"
        onClick={aoAbrirMais}
        className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-neutral-500"
      >
        <EllipsisOutlined />
        <span>Mais</span>
      </button>
    </nav>
  );
}
