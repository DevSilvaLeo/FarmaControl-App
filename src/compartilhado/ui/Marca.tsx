/**
 * Wordmark + símbolo PROVISÓRIOS (`.docs/01` §1.8). Ponto único de troca
 * quando o logotipo oficial do cliente chegar (PAF-01).
 */
export function Marca({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-primary-600 text-[13px] font-bold text-white"
      >
        FC
      </span>
      {!compacto && (
        <span className="text-[15px] font-semibold tracking-tight">
          <span className="text-primary-700">Farma</span>
          <span className="text-neutral-800">Control</span>
        </span>
      )}
    </span>
  );
}
