import { z } from 'zod';
import { cpfCnpjValido } from '@/compartilhado/utils/cpfCnpj';

const emailOpc = z.string().email('Email inválido').optional().or(z.literal(''));
const textoOpc = (max: number) =>
  z.string().max(max, `Máximo de ${max} caracteres`).optional().or(z.literal(''));

/** Espelha `DadosParceiroValidator` (`.spec/08` §8.2). */
export const parceiroSchema = z.object({
  tipoPessoa: z.enum(['Fisica', 'Juridica']),
  cpfCnpj: z.string().min(1, 'Informe o CPF/CNPJ').refine(cpfCnpjValido, 'CPF/CNPJ inválido'),
  inscricaoEstadualRg: textoOpc(30),
  razaoSocial: z.string().min(1, 'Informe a razão social / nome').max(120),
  nomeFantasia: textoOpc(120),
  ramo: textoOpc(80),
  segmentoId: z.number().positive().nullable().optional(),
  cep: textoOpc(9),
  logradouro: textoOpc(150),
  numero: textoOpc(20),
  complemento: textoOpc(60),
  bairro: textoOpc(80),
  cidadeId: z.number().positive().nullable().optional(),
  email: emailOpc,
  telefone: textoOpc(20),
  alvara: textoOpc(40),
  validadeAlvaraUtc: z.string().nullable().optional(),
  responsavelTecnico: textoOpc(120),
  registroConselho: textoOpc(40),
});

export const fornecedorSchema = parceiroSchema.extend({
  prazoEntregaDias: z.number().int().nonnegative('Não pode ser negativo').optional(),
  tipoFrete: z.enum(['Cif', 'Fob']).optional(),
  participaCotacaoFrete: z.boolean().optional(),
  condicaoPagamentoPadrao: textoOpc(120),
});
export type FornecedorForm = z.infer<typeof fornecedorSchema>;

export const transportadoraSchema = parceiroSchema.extend({
  registroAntt: textoOpc(30),
  tipoFretePadrao: z.enum(['Cif', 'Fob']).optional(),
});
export type TransportadoraForm = z.infer<typeof transportadoraSchema>;

export const representanteSchema = parceiroSchema.extend({
  habilitadoAssinarLicitacao: z.boolean().optional(),
});
export type RepresentanteForm = z.infer<typeof representanteSchema>;
