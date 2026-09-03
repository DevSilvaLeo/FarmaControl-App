export interface LinhaMeta {
  inicioUtc: string | null;
  fimUtc: string | null;
  valorMeta: number;
  percentualComissao: number;
}

/**
 * Detecta faixas de meta que se sobrepõem no tempo (RN-03.02 — `.docs/06` D-33).
 * Validação de conveniência no cliente; a autoridade final é o backend (422).
 */
export function encontrarSobreposicao(linhas: LinhaMeta[]): string | null {
  const completas = linhas
    .filter((l) => l.inicioUtc && l.fimUtc)
    .map((l) => ({ i: new Date(l.inicioUtc!).getTime(), f: new Date(l.fimUtc!).getTime() }))
    .sort((a, b) => a.i - b.i);
  for (let k = 1; k < completas.length; k++) {
    if (completas[k].i <= completas[k - 1].f) {
      return 'Há faixas de meta que se sobrepõem no tempo. Ajuste antes de salvar.';
    }
  }
  return null;
}
