import { z } from 'zod';
import { cpfCnpjValido } from '@/compartilhado/utils/cpfCnpj';

/**
 * Espelha `DadosClienteValidator` do backend
 * (`FarmaControl.Application/Clientes/GerenciarClientes.cs`):
 *   RazaoSocial NotEmpty max 120 · NomeFantasia max 120 ·
 *   CpfCnpjDigitos NotEmpty + documento válido · LimiteCredito >= 0 ·
 *   Email/EmailFinanceiro válidos quando informados ·
 *   PrazoMedioDias >= 0 quando informado.
 */
const emailOpc = z
  .string()
  .email('Email inválido')
  .optional()
  .or(z.literal(''));

const textoOpc = (max: number) =>
  z.string().max(max, `Máximo de ${max} caracteres`).optional().or(z.literal(''));

export const clienteSchema = z.object({
  // Dados gerais
  tipoPessoa: z.enum(['Fisica', 'Juridica']),
  cpfCnpj: z
    .string()
    .min(1, 'Informe o CPF/CNPJ')
    .refine((v) => cpfCnpjValido(v), 'CPF/CNPJ inválido'),
  inscricaoEstadualRg: textoOpc(30),
  razaoSocial: z.string().min(1, 'Informe a razão social / nome').max(120, 'Máximo de 120 caracteres'),
  nomeFantasia: textoOpc(120),
  ramo: textoOpc(80),
  simplesNacional: z.boolean().optional(),
  orgaoPublico: z.boolean().optional(),
  nascimentoUtc: z.string().nullable().optional(),
  segmentoId: z.number().positive().nullable().optional(),

  // Endereço + contato principal
  cep: textoOpc(9),
  logradouro: textoOpc(150),
  numero: textoOpc(20),
  complemento: textoOpc(60),
  bairro: textoOpc(80),
  cidadeId: z.number().positive().nullable().optional(),
  email: emailOpc,
  emailFinanceiro: emailOpc,
  telefone: textoOpc(20),

  // Financeiro e crédito
  prazoMedioDias: z.number().int().nonnegative('Não pode ser negativo').nullable().optional(),
  limiteCredito: z.number().nonnegative('Não pode ser negativo'),
  operaSomenteAVista: z.boolean().optional(),
  descontoPadrao: z.number().nonnegative().nullable().optional(),

  // Fiscal e regulatório
  alvara: textoOpc(40),
  validadeAlvaraUtc: z.string().nullable().optional(),
  responsavelTecnico: textoOpc(120),
  registroConselho: textoOpc(40),
  validadeMinimaProdutoDias: z.number().int().nonnegative().nullable().optional(),
  retemPis: z.boolean().optional(),
  retemCofins: z.boolean().optional(),
  retemIr: z.boolean().optional(),
  retemCsll: z.boolean().optional(),
  retemInss: z.boolean().optional(),
  obsEntrega: textoOpc(500),
  obsFaturamento: textoOpc(500),
  obsAlmoxarifado: textoOpc(500),
  obsNotaFiscal: textoOpc(500),
  obsGeral: textoOpc(500),
});

export type ClienteForm = z.infer<typeof clienteSchema>;

export const contatoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome').max(120),
  cargo: textoOpc(60),
  email: emailOpc,
  telefone: textoOpc(20),
});
export type ContatoForm = z.infer<typeof contatoSchema>;

export const enderecoSchema = z.object({
  destinatario: textoOpc(120),
  cep: textoOpc(9),
  logradouro: textoOpc(150),
  numero: textoOpc(20),
  complemento: textoOpc(60),
  bairro: textoOpc(80),
  cidadeId: z.number().positive().nullable().optional(),
  padrao: z.boolean().optional(),
});
export type EnderecoForm = z.infer<typeof enderecoSchema>;

export const segmentoSchema = z.object({
  nome: z.string().min(1, 'Informe o nome').max(80),
  orgaoPublico: z.boolean().optional(),
});
