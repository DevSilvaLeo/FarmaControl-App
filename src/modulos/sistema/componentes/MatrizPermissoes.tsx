import { Checkbox, Collapse } from 'antd';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { useBreakpoint } from '@/compartilhado/hooks/useBreakpoint';
import type { ModuloPermissoesDto } from '../tipos';

/**
 * Matriz de permissões (`.spec/06` §6.7). Renderiza a estrutura **já agrupada
 * por módulo** que `GET /permissoes` devolve — nunca uma tabela genérica de
 * permissões soltas.
 *  - `lg:`  : um `SectionCard` por módulo, checkboxes em grid, "selecionar tudo".
 *  - `< lg` : accordion por módulo com contagem "N/M".
 */
export function MatrizPermissoes({
  modulos,
  selecionadas,
  aoMudar,
  desabilitado = false,
}: {
  modulos: ModuloPermissoesDto[];
  selecionadas: string[];
  aoMudar: (chaves: string[]) => void;
  desabilitado?: boolean;
}) {
  const { ehDesktop } = useBreakpoint();
  const selSet = new Set(selecionadas);

  const alternarModulo = (chavesModulo: string[], marcar: boolean) => {
    const proximo = new Set(selecionadas);
    for (const c of chavesModulo) {
      if (marcar) proximo.add(c);
      else proximo.delete(c);
    }
    aoMudar([...proximo]);
  };

  const alternarUma = (chave: string, marcada: boolean) => {
    const proximo = new Set(selecionadas);
    if (marcada) proximo.add(chave);
    else proximo.delete(chave);
    aoMudar([...proximo]);
  };

  const grupo = (mod: ModuloPermissoesDto) => {
    const chaves = mod.permissoes.map((p) => p.chave);
    const marcadas = chaves.filter((c) => selSet.has(c));
    return (
      <Checkbox.Group
        className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3"
        value={marcadas}
        onChange={(v) => {
          const novas = new Set(v as string[]);
          const proximo = new Set(selecionadas);
          for (const c of chaves) {
            if (novas.has(c)) proximo.add(c);
            else proximo.delete(c);
          }
          aoMudar([...proximo]);
        }}
        disabled={desabilitado}
        options={mod.permissoes.map((p) => ({ label: p.nome, value: p.chave }))}
      />
    );
  };

  if (ehDesktop) {
    return (
      <div className="flex flex-col gap-4">
        {modulos.map((mod) => {
          const chaves = mod.permissoes.map((p) => p.chave);
          const todas = chaves.every((c) => selSet.has(c));
          const algumas = !todas && chaves.some((c) => selSet.has(c));
          return (
            <SectionCard
              key={mod.modulo}
              titulo={mod.modulo}
              acoes={
                <Checkbox
                  checked={todas}
                  indeterminate={algumas}
                  disabled={desabilitado}
                  onChange={(e) => alternarModulo(chaves, e.target.checked)}
                >
                  Selecionar tudo
                </Checkbox>
              }
            >
              {grupo(mod)}
            </SectionCard>
          );
        })}
      </div>
    );
  }

  return (
    <Collapse
      accordion={false}
      items={modulos.map((mod) => {
        const chaves = mod.permissoes.map((p) => p.chave);
        const n = chaves.filter((c) => selSet.has(c)).length;
        return {
          key: mod.modulo,
          label: (
            <span className="flex items-center justify-between gap-2">
              <span className="font-medium">{mod.modulo}</span>
              <span className="text-xs text-neutral-500">
                {n}/{chaves.length}
              </span>
            </span>
          ),
          children: (
            <div className="flex flex-col gap-2">
              {mod.permissoes.map((p) => (
                <Checkbox
                  key={p.chave}
                  checked={selSet.has(p.chave)}
                  disabled={desabilitado}
                  onChange={(e) => alternarUma(p.chave, e.target.checked)}
                >
                  {p.nome}
                </Checkbox>
              ))}
            </div>
          ),
        };
      })}
    />
  );
}
