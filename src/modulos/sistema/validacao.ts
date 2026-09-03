import { z } from 'zod';

export const usuarioSchema = z.object({
  nome: z.string().min(1, 'Informe o nome').max(150),
  login: z.string().min(1, 'Informe o login').max(60),
  email: z.string().min(1, 'Informe o email').email('Email inválido'),
  senhaInicial: z.string().min(1, 'Informe a senha inicial'),
});
export type UsuarioForm = z.infer<typeof usuarioSchema>;

export const perfilSchema = z.object({
  nome: z.string().min(1, 'Informe o nome').max(80),
  descricao: z.string().max(250).optional().or(z.literal('')),
});
export type PerfilForm = z.infer<typeof perfilSchema>;

export const empresaSchema = z.object({
  razaoSocial: z.string().min(1, 'Informe a razão social').max(200),
  nomeFantasia: z.string().max(200).optional().or(z.literal('')),
  documento: z
    .string()
    .min(1, 'Informe o CNPJ')
    .refine((v) => v.replace(/\D/g, '').length === 14, 'CNPJ deve ter 14 dígitos'),
});
export type EmpresaForm = z.infer<typeof empresaSchema>;

export const novaSenhaSchema = z.string().min(1, 'Informe a nova senha');
