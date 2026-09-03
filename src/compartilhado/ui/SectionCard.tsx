import type { ReactNode } from 'react';

/**
 * Card branco que agrupa campos dentro de uma aba/seção (`.docs/04` §4.2).
 * Padding responsivo 16px → 24px (`.docs/02` §2.2).
 */
export function SectionCard({
  titulo,
  descricao,
  acoes,
  children,
  className = '',
}: {
  titulo?: ReactNode;
  descricao?: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-neutral-200 bg-white p-4 shadow-sm lg:p-6 ${className}`}
    >
      {(titulo != null || acoes != null) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {titulo != null && (
              <h2 className="m-0 text-base font-semibold text-neutral-800 lg:text-lg">{titulo}</h2>
            )}
            {descricao != null && (
              <p className="mt-1 mb-0 text-sm text-neutral-500">{descricao}</p>
            )}
          </div>
          {acoes != null && <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
