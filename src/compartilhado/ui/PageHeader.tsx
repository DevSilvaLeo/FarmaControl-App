import type { ReactNode } from 'react';

/**
 * Cabeçalho de página: título `h1` + descrição opcional + slot de ações
 * (`.docs/04` §4.2). Mobile-first: ações abaixo do título; a partir de `sm:`
 * ficam à direita, na mesma linha.
 */
export function PageHeader({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
}) {
  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 text-xl font-semibold text-neutral-800 lg:text-2xl">{titulo}</h1>
        {descricao != null && (
          <p className="mt-1 mb-0 text-sm text-neutral-500">{descricao}</p>
        )}
      </div>
      {acoes != null && <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div>}
    </header>
  );
}
