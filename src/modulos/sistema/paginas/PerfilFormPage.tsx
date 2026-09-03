import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { perfilSchema, type PerfilForm } from '../validacao';
import { usePerfil, useSalvarPerfil } from '../hooks/useSistema';

export function PerfilFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const perfilId = id && id !== 'novo' ? Number(id) : undefined;
  const { data: perfil, isLoading } = usePerfil(perfilId);

  const form = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nome: '', descricao: '' },
  });

  useEffect(() => {
    if (perfil) form.reset({ nome: perfil.nome, descricao: perfil.descricao ?? '' });
  }, [perfil, form]);

  const salvar = useSalvarPerfil(perfilId, {
    aoSalvar: (idSalvo) => navigate(`/sistema/perfis/${idSalvo}`, { replace: true }),
  });

  if (perfilId != null && isLoading) return <Skeleton active paragraph={{ rows: 3 }} />;

  return (
    <FormPage
      titulo={perfilId != null ? 'Editar perfil' : 'Novo perfil'}
      voltarPara={perfilId != null ? `/sistema/perfis/${perfilId}` : '/sistema/perfis'}
      salvando={salvar.isPending}
      aoSalvar={form.handleSubmit((v) =>
        salvar.mutate({ nome: v.nome, descricao: v.descricao || undefined }),
      )}
    >
      <SectionCard titulo="Dados do perfil">
        <div className="flex flex-col gap-4">
          <CampoTexto control={form.control} name="nome" label="Nome" obrigatorio />
          <CampoTexto control={form.control} name="descricao" label="Descrição" tipo="textarea" />
        </div>
      </SectionCard>
    </FormPage>
  );
}
