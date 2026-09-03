/**
 * Ícones de domínio (`.docs/04` §4.6). Um set pequeno e estável: alguns
 * reaproveitam `@ant-design/icons` sob um nome de negócio, outros são SVG
 * inline. Tamanho padrão herdado do contexto (`1em`), `currentColor`.
 *
 * Ícone nunca é o único portador de significado numa ação — sempre acompanha
 * `aria-label` / rótulo visível.
 */
import {
  AlertOutlined,
  AuditOutlined,
  DownloadOutlined,
  FileProtectOutlined,
  MedicineBoxOutlined,
  SwapOutlined,
  UploadOutlined,
} from '@ant-design/icons';

export const IconeControlado = MedicineBoxOutlined;
export const IconeReceita = FileProtectOutlined;
export const IconeEntrada = DownloadOutlined;
export const IconeSaida = UploadOutlined;
export const IconeAjuste = SwapOutlined;
export const IconeLicitacao = AuditOutlined;
export const IconeAlertaValidade = AlertOutlined;

type PropsSvg = { className?: string; title?: string };

export function IconeLote({ className, title }: PropsSvg) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="2" y="4" width="12" height="9" rx="1" />
      <path d="M2 7h12M6 4V2.5M10 4V2.5" />
    </svg>
  );
}

export function IconeDeposito({ className, title }: PropsSvg) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M2 6.5 8 2l6 4.5V14H2z" />
      <path d="M6 14v-4h4v4" />
    </svg>
  );
}
