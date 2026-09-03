import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Skeleton, Tooltip } from 'antd';
import { DetailPage } from '@/compartilhado/ui/DetailPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { StatusTag } from '@/compartilhado/ui/StatusTag';
import { ConfirmDialog } from '@/compartilhado/ui/ConfirmDialog';
import { NaoEncontradoPage } from '@/app/paginas/NaoEncontradoPage';
import { Permissoes } from '@/compartilhado/auth/permissoes';
import { MatrizPermissoes } from '../componentes/MatrizPermissoes';
import {
  useDefinirPermissoesDoPerfil,
  useInativarPerfil,
  usePerfil,
  usePermissoesDisponiveis,
} from '../hooks/useSistema';

export function PerfilDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const perfilId = Number(id);
  const valido = Number.isFinite(perfilId);

  const { data: perfil, isLoading, isError } = usePerfil(valido ? perfilId : undefined);
  const { data: modulos = [], isLoading: carregandoModulos } = usePermissoesDisponiveis();

  const atuais = useMemo(() => perfil?.permissoes ?? [], [perfil]);
  const [selecionadas, setSelecionadas] = useState<string[]>(atuais);
  useEffect(() => setSelecionadas(atuais), [atuais]);

  const [confirmarInativar, setConfirmarInativar] = useState(false);
  const definir = useDefinirPermissoesDoPerfil(perfilId);
  const inativar = useInativarPerfil(perfilId);

  if (isError) return <NaoEncontradoPage />;
  if (isLoading || !perfil) return <Skeleton active paragraph={{ rows: 6 }} />;

  const mudou =
    JSON.stringify([...selecionadas].sort()) !== JSON.stringify([...atuais].sort());
  const bloqueado = perfil.sistema;

  return (
    <>
      <DetailPage
        titulo={perfil.nome}
        subtitulo={perfil.descricao}
        statusTag={
          perfil.sistema ? <StatusTag variante="sistema" /> : <StatusTag variante={perfil.ativo ? 'ativo' : 'inativo'} />
        }
        voltarPara="/sistema/perfis"
        acoes={[
          {
            chave: 'editar',
            rotulo: 'Editar',
            permissao: Permissoes.PerfisGerenciar,
            desabilitada: bloqueado,
            aoClicar: () => navigate(`/sistema/perfis/${perfilId}/editar`),
          },
          {
            chave: 'inativar',
            rotulo: 'Inativar',
            perigo: true,
            permissao: Permissoes.PerfisGerenciar,
            desabilitada: bloqueado || !perfil.ativo,
            aoClicar: () => setConfirmarInativar(true),
          },
        ]}
      >
        <SectionCard
          titulo="Matriz de permissões"
          descricao={
            bloqueado
              ? 'Perfil de sistema — as permissões não podem ser alteradas.'
              : 'Marque as permissões que este perfil concede.'
          }
          acoes={
            <Tooltip title={bloqueado ? 'Perfil de sistema — não pode ser alterado' : undefined}>
              <Button
                type="primary"
                disabled={bloqueado || !mudou}
                loading={definir.isPending}
                onClick={() => definir.mutate(selecionadas)}
              >
                Salvar permissões
              </Button>
            </Tooltip>
          }
        >
          {carregandoModulos ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <MatrizPermissoes
              modulos={modulos}
              selecionadas={selecionadas}
              aoMudar={setSelecionadas}
              desabilitado={bloqueado}
            />
          )}
        </SectionCard>
      </DetailPage>

      <ConfirmDialog
        aberto={confirmarInativar}
        titulo="Inativar este perfil?"
        descricao="Usuários que só tinham este perfil perdem as permissões associadas."
        rotuloConfirmar="Inativar"
        perigo
        carregando={inativar.isPending}
        aoConfirmar={() => inativar.mutate(undefined, { onSuccess: () => setConfirmarInativar(false) })}
        aoCancelar={() => setConfirmarInativar(false)}
      />
    </>
  );
}
