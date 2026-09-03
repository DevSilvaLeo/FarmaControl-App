import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined, MenuOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Marca } from '@/compartilhado/ui/Marca';
import { useSessaoStore } from '@/compartilhado/auth/sessaoStore';
import { useLogout } from '@/modulos/autenticacao/hooks/useAutenticacao';

/**
 * Topbar (`.spec/04` §4.3 item 5): gatilho de menu (mobile/tablet) + marca +
 * empresa atual SOMENTE LEITURA (`.spec/02` §2.7 — sem seletor) + menu do
 * usuário (Minha Conta / Sair).
 */
export function Topbar({ aoAbrirMenu }: { aoAbrirMenu: () => void }) {
  const navigate = useNavigate();
  const perfil = useSessaoStore((s) => s.perfil);
  const logout = useLogout();

  const contexto = [perfil?.empresaNome, perfil?.filialNome].filter(Boolean).join(' · ');

  const itensUsuario: MenuProps['items'] = [
    {
      key: 'identidade',
      label: (
        <div className="py-1">
          <div className="font-medium text-neutral-800">{perfil?.nome ?? 'Usuário'}</div>
          <div className="text-xs text-neutral-500">{perfil?.login}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    { key: 'minha-conta', label: 'Minha Conta', icon: <UserOutlined /> },
    {
      key: 'sair',
      label: 'Sair',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const aoClicar: MenuProps['onClick'] = ({ key }) => {
    if (key === 'minha-conta') navigate('/minha-conta');
    if (key === 'sair') logout.mutate(false, { onSuccess: () => navigate('/entrar', { replace: true }) });
  };

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
        {contexto && (
          <span
            className="hidden max-w-[240px] truncate text-xs text-neutral-500 sm:inline"
            title="Empresa / filial da sessão (somente leitura)"
          >
            {contexto}
          </span>
        )}
        <Dropdown
          menu={{ items: itensUsuario, onClick: aoClicar }}
          trigger={['click']}
          placement="bottomRight"
        >
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
