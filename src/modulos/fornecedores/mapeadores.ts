import { apenasDigitos } from '@/compartilhado/utils/cpfCnpj';
import type { DadosParceiro } from './tipos';

const nn = (v?: string | null) => (v && String(v).trim() !== '' ? String(v).trim() : null);

/** Campos comuns do form de parceiro → `DadosParceiro`. */
export function formParaDadosParceiro(f: {
  tipoPessoa: 'Fisica' | 'Juridica';
  cpfCnpj: string;
  inscricaoEstadualRg?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  ramo?: string | null;
  segmentoId?: number | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidadeId?: number | null;
  email?: string | null;
  telefone?: string | null;
  alvara?: string | null;
  validadeAlvaraUtc?: string | null;
  responsavelTecnico?: string | null;
  registroConselho?: string | null;
}): DadosParceiro {
  return {
    tipoPessoa: f.tipoPessoa,
    cpfCnpjDigitos: apenasDigitos(f.cpfCnpj),
    inscricaoEstadualRg: nn(f.inscricaoEstadualRg),
    razaoSocial: f.razaoSocial.trim(),
    nomeFantasia: nn(f.nomeFantasia),
    ramo: nn(f.ramo),
    segmentoId: f.segmentoId ?? null,
    cep: nn(f.cep),
    logradouro: nn(f.logradouro),
    numero: nn(f.numero),
    complemento: nn(f.complemento),
    bairro: nn(f.bairro),
    cidadeId: f.cidadeId ?? null,
    email: nn(f.email),
    telefone: nn(f.telefone),
    alvara: nn(f.alvara),
    validadeAlvaraUtc: f.validadeAlvaraUtc ?? null,
    responsavelTecnico: nn(f.responsavelTecnico),
    registroConselho: nn(f.registroConselho),
  };
}

const s = (v?: string | null) => v ?? '';

/** DTO de parceiro (campos comuns) → valores do form. */
export function dtoParaFormParceiro(d: {
  tipoPessoa?: string;
  cpfCnpj: string;
  inscricaoEstadualRg?: string | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  ramo?: string | null;
  segmentoId?: number | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidadeId?: number | null;
  email?: string | null;
  telefone?: string | null;
  alvara?: string | null;
  validadeAlvaraUtc?: string | null;
  responsavelTecnico?: string | null;
  registroConselho?: string | null;
}) {
  return {
    tipoPessoa: d.tipoPessoa === 'Fisica' ? ('Fisica' as const) : ('Juridica' as const),
    cpfCnpj: d.cpfCnpj,
    inscricaoEstadualRg: s(d.inscricaoEstadualRg),
    razaoSocial: d.razaoSocial,
    nomeFantasia: s(d.nomeFantasia),
    ramo: s(d.ramo),
    segmentoId: d.segmentoId ?? null,
    cep: s(d.cep),
    logradouro: s(d.logradouro),
    numero: s(d.numero),
    complemento: s(d.complemento),
    bairro: s(d.bairro),
    cidadeId: d.cidadeId ?? null,
    email: s(d.email),
    telefone: s(d.telefone),
    alvara: s(d.alvara),
    validadeAlvaraUtc: d.validadeAlvaraUtc ?? null,
    responsavelTecnico: s(d.responsavelTecnico),
    registroConselho: s(d.registroConselho),
  };
}
