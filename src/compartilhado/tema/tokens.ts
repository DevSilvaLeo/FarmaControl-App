/**
 * Fonte ÚNICA de tokens de design do FarmaControl (agents.md §5.1.3).
 *
 * Este arquivo é consumido por:
 *  - `tailwind.config.ts`  → `theme.extend` (cores, espaço, raio, fonte)
 *  - `temaAntd.ts`          → objeto `token` do `ConfigProvider` do Ant Design
 *
 * NUNCA manter uma paleta paralela em outro lugar. Ver `.docs/01` e `.docs/02`.
 */

// ---------------------------------------------------------------------------
// Paleta de marca — "Azul Clínico" (.docs/01 §1.2)
// ---------------------------------------------------------------------------
export const primary = {
  50: '#EEF4FB',
  100: '#D8E6F6',
  200: '#B0CCEC',
  300: '#7FAEE0',
  400: '#4B8AD0',
  500: '#2E72BE',
  600: '#1663B3', // colorPrimary
  700: '#124F8F',
  800: '#0F3F72',
  900: '#0B2C50',
} as const;

// Acento — "Verde-água Farma" (.docs/01 §1.3)
export const accent = {
  50: '#E6F6F4',
  100: '#C7EAE5',
  500: '#0E9384',
  600: '#0B7A6E',
} as const;

// Neutros (slate frio) (.docs/01 §1.6)
export const neutral = {
  0: '#FFFFFF',
  25: '#F6F8FA', // fundo da aplicação
  50: '#F1F5F9', // superfície afundada
  100: '#E8EDF3', // borda sutil
  200: '#E2E8F0', // borda padrão
  300: '#CBD5E1',
  400: '#94A3B8', // ícone neutro / texto desabilitado
  500: '#64748B', // texto secundário
  600: '#475569',
  700: '#334155', // texto de corpo
  800: '#1E293B', // texto forte / títulos
  900: '#0F172A',
} as const;

// Cores semânticas (.docs/01 §1.4)
export const semantic = {
  sucesso: '#2E7D32',
  sucessoFundo: '#E9F5EA',
  alerta: '#D97706',
  alertaTexto: '#B45309',
  alertaFundo: '#FEF3E2',
  erro: '#C62828',
  erroFundo: '#FCEBEA',
  info: primary[600],
  infoFundo: primary[50],
} as const;

// Semáforo de validade / vencimento (.docs/01 §1.5)
export const semaforoValidade = {
  vencido: '#991B1B',
  ate7: '#DC2626',
  ate30: '#EA580C',
  ate90: '#F59E0B',
  acima90: neutral[500],
} as const;

// ---------------------------------------------------------------------------
// Tokens semânticos por PAPEL — a ponte para um tema escuro futuro (.docs/02 §2.7)
// ---------------------------------------------------------------------------
export const papeis = {
  corPrimaria: primary[600],
  corPrimariaHover: primary[700],
  corAcento: accent[500],
  corFundoApp: neutral[25],
  corSuperficie: neutral[0],
  corSuperficieAfundada: neutral[50],
  corBorda: neutral[200],
  corTextoForte: neutral[800],
  corTextoCorpo: neutral[700],
  corTextoSecundario: neutral[500],
  corTextoDesabilitado: neutral[400],
  corSucesso: semantic.sucesso,
  corSucessoFundo: semantic.sucessoFundo,
  corAlerta: semantic.alerta,
  corAlertaFundo: semantic.alertaFundo,
  corErro: semantic.erro,
  corErroFundo: semantic.erroFundo,
  corInfo: semantic.info,
  corInfoFundo: semantic.infoFundo,
} as const;

// ---------------------------------------------------------------------------
// Escalas (.docs/02)
// ---------------------------------------------------------------------------
export const fontFamily = {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    '"Noto Sans"',
    'sans-serif',
  ],
  mono: [
    '"SFMono-Regular"',
    '"Cascadia Code"',
    'Consolas',
    '"Liberation Mono"',
    'Menlo',
    'monospace',
  ],
} as const;

export const radius = {
  sm: '4px',
  md: '6px',
  lg: '10px',
} as const;

export const shadow = {
  sm: '0 1px 2px rgba(15,23,42,.06)',
  md: '0 4px 12px rgba(15,23,42,.10)',
  lg: '0 12px 32px rgba(15,23,42,.16)',
} as const;

export const motion = {
  fast: '120ms',
  base: '200ms',
  slow: '280ms',
} as const;

// Dimensões de layout usadas pelo AppShell (.docs/02 §2.2 / §2.2 tabela)
export const layout = {
  topbarMobile: 56,
  topbarDesktop: 64,
  bottomNav: 56,
  sidebarExpandida: 240,
  sidebarColapsada: 64,
  alvoToqueMin: 44,
} as const;
