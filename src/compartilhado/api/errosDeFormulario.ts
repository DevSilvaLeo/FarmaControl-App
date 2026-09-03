import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { normalizarErro } from './normalizarErro';

/**
 * Aplica os erros de validação 400 do backend nos campos do React Hook Form
 * (`.spec/03` §3.5). Trata a convenção do FluentValidation do backend:
 *  - prefixo `Dados.` nos commands que aninham o payload (`CriarProdutoCommand`,
 *    `CriarClienteCommand`);
 *  - segmentos em PascalCase (`DepartamentoId` → `departamentoId`).
 */
export function aplicarErrosDeCampo<T extends FieldValues>(
  erro: unknown,
  setError: UseFormSetError<T>,
  camposValidos?: ReadonlySet<string>,
): void {
  const { erros } = normalizarErro(erro);
  if (!erros) return;

  for (const [chaveBruta, mensagens] of Object.entries(erros)) {
    const semPrefixo = chaveBruta.replace(/^dados\./i, '');
    const campo = semPrefixo.charAt(0).toLowerCase() + semPrefixo.slice(1);
    if (!camposValidos || camposValidos.has(campo)) {
      setError(campo as Path<T>, { message: mensagens[0] });
    }
  }
}
