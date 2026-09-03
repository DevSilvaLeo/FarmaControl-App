import { z } from 'zod';

/** Login: só "obrigatório" — a regra de credencial é inteiramente do backend (`.spec/06` §6.2). */
export const loginSchema = z.object({
  login: z.string().min(1, 'Informe o login'),
  senha: z.string().min(1, 'Informe a senha'),
});
export type LoginForm = z.infer<typeof loginSchema>;

/** Código TOTP de 6 dígitos. */
export const codigoTotpSchema = z
  .string()
  .regex(/^\d{6}$/, 'O código tem 6 dígitos');

/** Alterar a própria senha — a confirmação é validação só client-side. */
export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Informe a senha atual'),
    novaSenha: z.string().min(1, 'Informe a nova senha'),
    confirmarNovaSenha: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((d) => d.novaSenha === d.confirmarNovaSenha, {
    path: ['confirmarNovaSenha'],
    message: 'A confirmação não confere com a nova senha',
  });
export type AlterarSenhaForm = z.infer<typeof alterarSenhaSchema>;
