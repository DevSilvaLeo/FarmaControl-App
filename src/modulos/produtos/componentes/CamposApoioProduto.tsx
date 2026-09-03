import { useMemo, useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Button } from 'antd';
import { CampoSelect } from '@/compartilhado/ui/campos';
import { RequerPermissao } from '@/compartilhado/auth/RequerPermissao';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { apoioApi } from '../api';
import {
  useDepartamentos,
  useGrupos,
  useInvalidarApoio,
  useLaboratorios,
  useMarcas,
  useSubgrupos,
  useUnidades,
} from '../hooks/useProdutos';
import { GerenciarApoioModal } from './GerenciarApoioModal';

type Qual = 'departamento' | 'grupo' | 'subgrupo' | 'marca' | 'laboratorio' | 'unidade';

/**
 * Selects de classificação/estoque do Produto, cada um com link "Gerenciar…"
 * que abre um modal de cadastro de apoio sem sair do formulário (`.spec/07` §7.4).
 */
export function CamposApoioProduto<T extends FieldValues>({
  control,
  nomes,
  grupoSelecionado,
}: {
  control: Control<T>;
  nomes: Record<Qual, Path<T>>;
  grupoSelecionado: number | undefined;
}) {
  const [aberto, setAberto] = useState<Qual | null>(null);
  const invalidar = useInvalidarApoio();

  const marcas = useMarcas();
  const departamentos = useDepartamentos();
  const grupos = useGrupos();
  const subgrupos = useSubgrupos(grupoSelecionado);
  const laboratorios = useLaboratorios();
  const unidades = useUnidades();

  const opts = (itens: { id: number; nome?: string; sigla?: string; descricao?: string }[]) =>
    itens.map((i) => ({ value: i.id, label: i.nome ?? `${i.sigla} — ${i.descricao}` }));

  const linkGerenciar = (qual: Qual) => (
    <RequerPermissao chave={Permissoes.CadastrosApoioGerenciar}>
      <Button type="link" size="small" className="h-auto p-0" onClick={() => setAberto(qual)}>
        Gerenciar
      </Button>
    </RequerPermissao>
  );

  const modais: Record<
    Qual,
    { titulo: string; itens: { id: number; nome: string }[]; criar: (n: string) => Promise<unknown>; renomear?: (id: number, n: string) => Promise<unknown> }
  > = useMemo(
    () => ({
      departamento: {
        titulo: 'Departamentos',
        itens: departamentos.data ?? [],
        criar: apoioApi.criarDepartamento,
      },
      grupo: { titulo: 'Grupos', itens: grupos.data ?? [], criar: apoioApi.criarGrupo },
      subgrupo: {
        titulo: 'Subgrupos do grupo selecionado',
        itens: (subgrupos.data ?? []).map((s) => ({ id: s.id, nome: s.nome })),
        criar: (n: string) => apoioApi.criarSubgrupo(grupoSelecionado ?? 0, n),
      },
      marca: {
        titulo: 'Marcas',
        itens: marcas.data ?? [],
        criar: apoioApi.criarMarca,
        renomear: apoioApi.renomearMarca,
      },
      laboratorio: {
        titulo: 'Laboratórios',
        itens: (laboratorios.data ?? []).map((l) => ({ id: l.id, nome: l.nome })),
        criar: (n: string) => apoioApi.criarLaboratorio(n),
      },
      unidade: {
        titulo: 'Unidades',
        itens: (unidades.data ?? []).map((u) => ({ id: u.id, nome: `${u.sigla} — ${u.descricao}` })),
        criar: (n: string) => apoioApi.criarUnidade({ sigla: n, descricao: n, permiteFracionar: false }),
      },
    }),
    [departamentos.data, grupos.data, subgrupos.data, marcas.data, laboratorios.data, unidades.data, grupoSelecionado],
  );

  return (
    <>
      <CampoSelect
        control={control}
        name={nomes.departamento}
        label="Departamento"
        obrigatorio
        options={opts(departamentos.data ?? [])}
        aoLado={linkGerenciar('departamento')}
      />
      <CampoSelect
        control={control}
        name={nomes.grupo}
        label="Grupo"
        obrigatorio
        options={opts(grupos.data ?? [])}
        aoLado={linkGerenciar('grupo')}
      />
      <CampoSelect
        control={control}
        name={nomes.subgrupo}
        label="Subgrupo"
        options={opts(subgrupos.data ?? [])}
        aoLado={grupoSelecionado ? linkGerenciar('subgrupo') : undefined}
        ajuda={!grupoSelecionado ? 'Selecione um grupo primeiro' : undefined}
      />
      <CampoSelect
        control={control}
        name={nomes.marca}
        label="Marca"
        options={opts(marcas.data ?? [])}
        aoLado={linkGerenciar('marca')}
      />
      <CampoSelect
        control={control}
        name={nomes.laboratorio}
        label="Laboratório"
        options={opts(laboratorios.data ?? [])}
        aoLado={linkGerenciar('laboratorio')}
      />
      <CampoSelect
        control={control}
        name={nomes.unidade}
        label="Unidade de estoque"
        obrigatorio
        options={opts(unidades.data ?? [])}
        aoLado={linkGerenciar('unidade')}
      />

      {aberto && (
        <GerenciarApoioModal
          aberto
          titulo={modais[aberto].titulo}
          itens={modais[aberto].itens}
          aoFechar={() => {
            setAberto(null);
            void invalidar();
          }}
          aoCriar={async (n) => {
            await modais[aberto].criar(n);
            void invalidar();
          }}
          aoRenomear={
            modais[aberto].renomear
              ? async (id, n) => {
                  await modais[aberto].renomear!(id, n);
                  void invalidar();
                }
              : undefined
          }
        />
      )}
    </>
  );
}
