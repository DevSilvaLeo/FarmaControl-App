import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FormPage } from '@/compartilhado/ui/FormPage';
import { SectionCard } from '@/compartilhado/ui/SectionCard';
import { CampoTexto } from '@/compartilhado/ui/CampoTexto';
import { normalizarErro } from '@/compartilhado/api/normalizarErro';
import { usuarioSchema, type UsuarioForm } from '../validacao';
import { useCriarUsuario } from '../hooks/useSistema';

/**
 * Criação de usuário (`.spec/06` §6.6). Formulário curto (sem abas). Após
 * criar, redireciona ao Detalhe para definir os perfis.
 */
export function UsuarioFormPage() {
  const navigate = useNavigate();
  const { control, handleSubmit, setError } = useForm<UsuarioForm>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nome: '', login: '', email: '', senhaInicial: '' },
  });

  const criar = useCriarUsuario({
    aoCriar: (id) => navigate(`/sistema/usuarios/${id}`, { replace: true }),
  });

  const validos = new Set<keyof UsuarioForm>(['nome', 'login', 'email', 'senhaInicial']);

  return (
    <FormPage
      titulo="Novo usuário"
      voltarPara="/sistema/usuarios"
      salvando={criar.isPending}
      rotuloSalvar="Criar"
      aoSalvar={handleSubmit((v) =>
        criar.mutate(v, {
          onError: (erro) => {
            for (const [k, msgs] of Object.entries(normalizarErro(erro).erros ?? {})) {
              const chave = (k.charAt(0).toLowerCase() + k.slice(1)) as keyof UsuarioForm;
              if (validos.has(chave)) setError(chave, { message: msgs[0] });
            }
          },
        }),
      )}
    >
      <SectionCard titulo="Dados do usuário">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto control={control} name="nome" label="Nome" obrigatorio />
          <CampoTexto control={control} name="login" label="Login" obrigatorio mono />
          <CampoTexto control={control} name="email" label="Email" obrigatorio tipo="email" />
          <CampoTexto
            control={control}
            name="senhaInicial"
            label="Senha inicial"
            obrigatorio
            tipo="password"
            autoComplete="new-password"
          />
        </div>
      </SectionCard>
    </FormPage>
  );
}
