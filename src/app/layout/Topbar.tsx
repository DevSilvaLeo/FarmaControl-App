import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MenuOutlined, UserOutlined } from '@ant-design/icons';
import { Marca } from '@/compartilhado/ui/Marca';

/**
 * Topbar (`.spec/04` §4.3 item 5): gatilho de menu (mobile/tablet) + marca +
 * empresa atual SOMENTE LEITURA (`.spec/02` §2.7 — sem seletor) + menu do
 * usuário. Nesta etapa "Minha Conta" e "Sair" são placeholders.
 */
export function Topbar({ aoAbrirMenu }: { aoAbrirMenu: () => void }) {
  const itensUsuario: MenuProps['items'] = [
    { key: 'minha-conta', label: 'Minha Conta (em breve)', disabled: true },
    { type: 'divider' },
    { key: 'sair', label: 'Sair (em breve)', disabled: true },
  ];

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-neutral-200 bg-white px-3 lg:h-16 lg:px-6">
      <button
        type="button"
        aria-label="Abrir menu de navegação"
        onClick={aoAbrirMenu}
        className="grid h-10 w-10 place-items-center rounded-md text-neutral-600 hover:bg-neutral-50 lg:hidden"
      >
        <MenuOutlined />
      </button>

      <div className="lg:hidden">
        <Marca compacto />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span
          className="hidden text-xs text-neutral-500 sm:inline"
          title="Empresa/filial da sessão (somente leitura)"
        >
          Empresa —
        </span>
        <Dropdown menu={{ items: itensUsuario }} trigger={['click']} placement="bottomRight">
          <button
            type="button"
            aria-label="Menu do usuário"
            className="grid h-10 w-10 place-items-center rounded-full text-neutral-600 hover:bg-neutral-50"
          >
            <UserOutlined />
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
