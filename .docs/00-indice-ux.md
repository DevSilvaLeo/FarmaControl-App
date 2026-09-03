---
título: Especificação de UX/UI do Frontend FarmaControl — Índice
versão do documento: 1.0
data: 2026-09-02
status: normativo para design — complementa `.spec/03-padroes-de-engenharia-e-ui.md`
        e `agents.md` (frontend). Onde houver conflito de decisão de stack/
        responsividade, `agents.md` prevalece; este conjunto detalha *como o
        produto se parece e se comporta* dentro daquelas regras.
---

# .docs (UX/UI) — Especificação de Design do FarmaControl

Esta pasta descreve a **camada de design** do frontend do FarmaControl: a
identidade visual, os tokens de design, os padrões de layout responsivo
(mobile-first), o inventário de componentes de UI e o detalhamento de fluxo
tela a tela por fase.

É o par visual dos documentos de engenharia:

| Camada | Documento normativo |
|---|---|
| Stack e decisões de engenharia do frontend | `agents.md` (raiz) + `.spec/12` |
| Padrões de engenharia e UI (validação, erro, RBAC, datas) | `.spec/03-padroes-de-engenharia-e-ui.md` |
| Fases e contrato de API tela a tela | `.spec/04` a `.spec/09` |
| **Identidade visual, tokens, layout responsivo, UI kit, fluxo de UX** | **este conjunto `.docs/01`–`.docs/09`** |

## Índice

| Doc | Conteúdo |
|---|---|
| [01-identidade-visual-e-paleta.md](01-identidade-visual-e-paleta.md) | Paleta "Azul Clínico", cores semânticas, semáforo de validade, regras de contraste (gate AA) |
| [02-design-tokens-tipografia.md](02-design-tokens-tipografia.md) | Escala de espaço/tipo/raio/sombra/motion; pilha de fontes; mapeamento `tailwind.config.ts` ↔ `ConfigProvider` do antd |
| [03-blueprints-responsivos.md](03-blueprints-responsivos.md) | Os 6 padrões de adaptação mobile→desktop da `agents.md` §4.2, detalhados com mockups em 375 / 768 / 1280 px |
| [04-ui-kit.md](04-ui-kit.md) | Inventário de componentes de `compartilhado/ui/`: contrato, responsabilidade por camada (Tailwind vs antd), comportamento responsivo |
| [05-etapas-e-roadmap-ux.md](05-etapas-e-roadmap-ux.md) | As 9 etapas de implementação de UX, escopo, critério de pronto e dependências |
| [06-fluxo-autenticacao-sistema.md](06-fluxo-autenticacao-sistema.md) | Detalhamento de UX: Login, 2FA, Minha Conta, Usuários, Perfis, Empresas (espelha `.spec/06`) |
| [07-fluxo-cadastros-produto-cliente.md](07-fluxo-cadastros-produto-cliente.md) | Detalhamento de UX: Produto (6 abas), Cliente (5 abas), cadastros de apoio, CEP (espelha `.spec/07`) |
| [08-fluxo-parceiros-forca-vendas.md](08-fluxo-parceiros-forca-vendas.md) | Detalhamento de UX: Fornecedor, Transportadora, Representante, Vendedor + metas/débitos (espelha `.spec/08`) |
| [09-fluxo-estoque.md](09-fluxo-estoque.md) | Detalhamento de UX: Depósitos, Movimentações, Posição, Kardex, Lotes a Vencer, Painel (espelha `.spec/09`) |

## Princípios de design (resumo — o "porquê" de tudo aqui)

1. **Mobile-first de verdade** (`agents.md` §4): o layout sem prefixo é o layout
   mobile; `md:`/`lg:`/`xl:` adicionam densidade por cima. Nenhuma tela do MVP é
   "apenas utilizável" no smartphone.
2. **Densidade é uma feature no desktop**, não um acidente. O toggle de densidade
   (`compacto` ⇄ `confortável`) deixa cada persona ajustar.
3. **A cor primária não é verde.** Num ERP saturado de `<Tag>` de status e de
   semáforo de validade, primária verde competiria com "sucesso". Primária é
   azul; o verde fica reservado para estado positivo.
4. **Um padrão, um componente.** Semáforo de vencimento, linha do tempo de
   status, barra de filtros, tabela paginada — cada um existe uma única vez em
   `compartilhado/ui/` e é reusado (mesma disciplina de `.spec/03` §3.11 item 6).
5. **O frontend nunca é a única barreira** (`.spec/03` §3.10): visibilidade por
   permissão e validação Zod são UX; a autoridade é o backend.
6. **Acessibilidade AA é gate, não aspiração** (`.spec/03` §3.13): a paleta só é
   fixada depois de passar na auditoria de contraste (ver `01` §6).

## Estado atual

**v1.0 — 2026-09-02.** Especificação de design inicial, cobrindo as Fases 0–5
do frontend (as que têm API pronta no backend). Identidade visual: proposta
"Azul Clínico" aprovada pelo PO como paleta de trabalho, substituindo o
placeholder do Ant Design citado em `.spec/04` §4.7 (PAF-01) — sujeita à
auditoria formal de contraste na Etapa 8.

**Progresso de implementação:**
- **Etapa 0** (fundação: CRA→Vite, tokens, AppShell mobile-first, `/diagnostico`) — concluída (2026-09-02).
- **Etapa 1** (Design System: tokens, UI Kit, hooks cross-cutting, `/estilo`) — concluída (2026-09-03). Notas em `05` §5.3.
- **Etapa 2** (blueprints responsivos: `useBreakpoint`, `FiltrosResponsivos`, `DetailPage`, `GridEmbutido`, protótipos `/estilo/lista` e `/estilo/formulario`) — concluída (2026-09-03). Notas em `05` §5.4 e `03` §3.9.

Próximo passo: Etapa 3 — Autenticação & Sistema (ver `05-etapas-e-roadmap-ux.md` e `06-fluxo-autenticacao-sistema.md`).
