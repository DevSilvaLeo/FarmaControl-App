import type { Config } from 'tailwindcss';
import {
  primary,
  accent,
  neutral,
  semantic,
  fontFamily,
  radius,
  shadow,
} from './src/compartilhado/tema/tokens';

/**
 * Tailwind CSS 3 — camada base de layout/espaçamento/tipografia/responsividade
 * (agents.md §5). Preflight DESLIGADO: o reset fica a cargo do Ant Design v6
 * (agents.md §5.1.1). Sem prefixo de classe (agents.md §5.1.4).
 *
 * Breakpoints = padrão do Tailwind (agents.md §4.1): sm 640 / md 768 / lg 1024 / xl 1280.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  prefix: '',
  theme: {
    extend: {
      colors: {
        primary,
        accent,
        neutral,
        sucesso: { DEFAULT: semantic.sucesso, fundo: semantic.sucessoFundo },
        alerta: {
          DEFAULT: semantic.alerta,
          texto: semantic.alertaTexto,
          fundo: semantic.alertaFundo,
        },
        erro: { DEFAULT: semantic.erro, fundo: semantic.erroFundo },
        info: { DEFAULT: semantic.info, fundo: semantic.infoFundo },
      },
      fontFamily: {
        sans: [...fontFamily.sans],
        mono: [...fontFamily.mono],
      },
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
      },
      boxShadow: {
        sm: shadow.sm,
        md: shadow.md,
        lg: shadow.lg,
      },
      minHeight: {
        11: '44px',
      },
    },
  },
  plugins: [],
} satisfies Config;
