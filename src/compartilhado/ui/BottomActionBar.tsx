import type { ReactNode } from 'react';

/**
 * Barra de ação fixa no rodapé da viewport para MOBILE (`.docs/03` §3.3,
 * `.docs/04` §4.2). Alvo de toque ≥ 44px; respeita `safe-area-inset-bottom`.
 * No `lg:` não renderiza — o `FormPage` usa `Affix` no rodapé do card.
 */
export function BottomActionBar({
  primaria,
  secundaria,
  className = '',
}: {
  primaria: ReactNode;
  secundaria?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-neutral-200 bg-white px-4 py-2 shadow-md lg:hidden ${className}`}
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      {secundaria != null && <div className="flex-1">{secundaria}</div>}
      <div className={secundaria != null ? '' : 'flex-1'}>{primaria}</div>
    </div>
  );
}
