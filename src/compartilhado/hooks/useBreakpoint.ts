import { useEffect, useState } from 'react';

/**
 * Breakpoints **padrão do Tailwind CSS 3** (`agents.md` §4.1) — a mesma régua
 * usada nas classes utilitárias. Evita o descompasso de usar `Grid.useBreakpoint`
 * do Ant Design (cujo `lg` é 992px, não 1024px).
 */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface EstadoBreakpoint {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  /** `true` abaixo de `md` (768px) — a base "mobile" do mobile-first. */
  ehMobile: boolean;
  /** `true` de `md` até `lg` — faixa tablet. */
  ehTablet: boolean;
  /** `true` a partir de `lg` (1024px). */
  ehDesktop: boolean;
}

function medir(): EstadoBreakpoint {
  const mq = (px: number) =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(`(min-width: ${px}px)`).matches
      : true; // SSR/sem matchMedia: assume desktop

  const sm = mq(BREAKPOINTS.sm);
  const md = mq(BREAKPOINTS.md);
  const lg = mq(BREAKPOINTS.lg);
  const xl = mq(BREAKPOINTS.xl);
  return { sm, md, lg, xl, ehMobile: !md, ehTablet: md && !lg, ehDesktop: lg };
}

export function useBreakpoint(): EstadoBreakpoint {
  const [estado, setEstado] = useState<EstadoBreakpoint>(medir);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const listas = Object.values(BREAKPOINTS).map((px) =>
      window.matchMedia(`(min-width: ${px}px)`),
    );
    const aoMudar = () => setEstado(medir());
    listas.forEach((l) => l.addEventListener('change', aoMudar));
    aoMudar();
    return () => listas.forEach((l) => l.removeEventListener('change', aoMudar));
  }, []);

  return estado;
}
