---
título: Identidade Visual e Paleta de Cores — Frontend FarmaControl
versão do documento: 1.0
data: 2026-09-02
status: normativo — resolve o ponto em aberto PAF-01 de `.spec/04` §4.7
        (paleta de marca). Substitui o "tema padrão do Ant Design como
        placeholder" por uma paleta própria documentada.
---

# 01 — Identidade Visual e Paleta

## 1.1 Racional da direção visual

O FarmaControl é um **ERP de distribuição/atacado farmacêutico B2B**, de uso
interno, operado por funcionários especializados. Não é farmácia de balcão —
então a identidade evita o clichê da "cruz verde de farmácia de varejo".

Direção escolhida: **"Azul Clínico"** — um azul de confiança/ambiente clínico
como cor de marca, com um acento **verde-água** (teal) que sinaliza o domínio
"saúde/farmacêutico" sem recorrer ao verde-bandeira.

### Por que a primária não é verde

O sistema é saturado de sinalização de estado: `<Tag>` de `Ativo`/`Inativo`
(`.spec/03` §3.2), `Bloqueado` em vermelho (`.spec/07` §7.5.1), semáforo de
validade de lote (`.spec/09` §9.6), `Sentido` Entrada/Saída no Kardex verde/
vermelho (`.spec/09` §9.5), indicador "Abaixo do mínimo" (`.spec/09` §9.4).

Se a cor primária (botões, links, navegação ativa) fosse verde, ela competiria
visualmente com o verde de "sucesso/positivo/entrada". Usar **azul como
primária libera todo o verde para semântica de estado** — decisão de UX, não
estética.

## 1.2 Paleta de marca — "Azul Clínico"

Escala completa (estilo Tailwind 50–900). O valor de referência para o
`colorPrimary` do Ant Design é o **600**.

| Token | Hex | Uso principal |
|---|---|---|
| `primary/50`  | `#EEF4FB` | hover de linha de tabela, faixa de destaque, fundo de `<Alert type="info">` |
| `primary/100` | `#D8E6F6` | chip/tag informativa, linha selecionada, borda de foco suave |
| `primary/200` | `#B0CCEC` | divisores em superfície azul, estados desabilitados de botão primário |
| `primary/300` | `#7FAEE0` | ícones decorativos, gráficos (série secundária) |
| `primary/400` | `#4B8AD0` | hover de link em fundo escuro |
| `primary/500` | `#2E72BE` | ícones de ação e realces dentro de tabelas densas |
| `primary/600` | `#1663B3` | **`colorPrimary`** — botão primário, link, item de menu ativo, foco |
| `primary/700` | `#124F8F` | `:hover` / `:active` de elementos primários |
| `primary/800` | `#0F3F72` | cabeçalho da sidebar (fundo), textos sobre `primary/50` |
| `primary/900` | `#0B2C50` | logotipo monocromático, texto de marca |

## 1.3 Acento — "Verde-água Farma" (teal)

Usado com parcimônia: ações secundárias de destaque, marcação de dado
relevante, séries de gráfico, ícone de módulo "regulatório/farmacêutico".
**Nunca** como cor de sucesso (essa é o verde de `1.4`).

| Token | Hex | Uso |
|---|---|---|
| `accent/50`  | `#E6F6F4` | fundo de destaque de seção regulatória |
| `accent/100` | `#C7EAE5` | borda/realce |
| `accent/500` | `#0E9384` | ícone de módulo regulatório, botão secundário de destaque, série de gráfico |
| `accent/600` | `#0B7A6E` | `:hover` do acento |

## 1.4 Cores semânticas (estado)

Cada uma tem uma **base** (texto/ícone/borda em fundo claro) e um **fundo
suave** (para `<Tag>`, `<Alert>`, faixa de linha).

| Papel | Base | Fundo suave | Onde aparece |
|---|---|---|---|
| **Sucesso / Ativo / Entrada** | `#2E7D32` | `#E9F5EA` | `<Tag>` Ativo, `Sentido=Entrada` no Kardex, toast de sucesso |
| **Alerta / atenção** | `#D97706` (texto em fundo suave: `#B45309`) | `#FEF3E2` | "Abaixo do mínimo" (`.spec/09` §9.4), alvará/registro a vencer, aviso FEFO |
| **Erro / Bloqueado / Saída** | `#C62828` | `#FCEBEA` | `<Tag>` Bloqueado (`.spec/07`), `Sentido=Saída`, saldo negativo recusado (422), toast de erro |
| **Informação** | `primary/600` `#1663B3` | `primary/50` `#EEF4FB` | `<Alert type="info">`, dicas de contexto, nota "aguarde Fase 7" (`.spec/09` §9.3.1) |
| **Neutro / desabilitado** | `neutral/400` `#94A3B8` | `neutral/50` `#F1F5F9` | `<Tag>` Inativo, colunas de auditoria, placeholder |

> `<Tag>` do antd v6 lê essas cores via `ConfigProvider` — não hardcodar hex
> dentro de componente de tela (`.spec/03` §3.8, mesma regra dos rótulos de
> enum).

## 1.5 Semáforo de validade / vencimento

Padrão visual único, encapsulado no componente `<SemaforoValidade dias={n} />`
(ver `04-ui-kit.md`). Aplica-se a: **Lotes a Vencer** (`.spec/09` §9.6),
validade de alvará e de registro MS (`.spec/07` §7.3.2 / §7.5.2), e qualquer
data-limite futura (licença sanitária, laudo).

| Faixa | Cor do `<Tag>` | Texto | Semântica |
|---|---|---|---|
| vencido (`dias <= 0`) | `#991B1B` | branco | já venceu — bloqueio provável |
| `<= 7` dias | `#DC2626` | branco | crítico |
| `<= 30` dias | `#EA580C` | branco | urgente |
| `<= 90` dias | `#F59E0B` | `#1E293B` (texto escuro — amarelo não tem contraste AA com branco) | atenção |
| `> 90` dias | `#64748B` | branco | neutro / informativo |

Regras:
- O corte de faixas é **fixo aqui**; a janela de consulta (`dias=` do endpoint,
  default 90) é separada e escolhida pelo usuário via seletor 30/60/90/180
  (`.spec/09` §9.6).
- Cor **nunca é o único indicador**: o `<Tag>` sempre mostra o número de dias
  em texto ("faltam 12 dias" / "venceu há 3 dias") — daltonismo e impressão P&B.

## 1.6 Neutros (slate frio)

Neutros de tom frio combinam com a primária azul e reforçam a leitura
"clínica/limpa".

| Papel | Hex |
|---|---|
| fundo da aplicação (`body`) | `#F6F8FA` |
| superfície / card / `<Table>` | `#FFFFFF` |
| superfície afundada (código, `<pre>`, célula readonly) | `#F1F5F9` |
| borda sutil (divisor interno) | `#E8EDF3` |
| borda padrão (card, input, tabela) | `#E2E8F0` |
| borda em hover | `#CBD5E1` |
| ícone neutro / texto desabilitado | `#94A3B8` |
| texto secundário (label, metadado, placeholder ativo) | `#64748B` |
| texto de corpo | `#334155` |
| texto forte / títulos / valores em tabela | `#1E293B` |
| overlay de modal / drawer scrim | `#0F172A` a 45% |

## 1.7 Regras de contraste (gate AA — `.spec/03` §3.13)

Alvo: **WCAG 2.1 AA** — 4.5:1 para texto normal, 3:1 para texto grande
(≥ 18.66px bold ou ≥ 24px) e para componentes de UI / estados de foco.

Pares validados nesta proposta (rácio aproximado — **reconferir na Etapa 8 com
ferramenta antes de fixar**, ver `05` §Etapa 8):

| Combinação | Rácio aprox. | Veredito |
|---|---|---|
| `#1E293B` sobre `#FFFFFF` (corpo) | ~14:1 | AAA |
| `#334155` sobre `#FFFFFF` | ~10:1 | AAA |
| `#64748B` sobre `#FFFFFF` (secundário) | ~4.9:1 | AA (não usar abaixo de 12px) |
| `#FFFFFF` sobre `#1663B3` (botão primário) | ~6.4:1 | AA / quase AAA |
| `#1663B3` sobre `#FFFFFF` (link) | ~6.4:1 | AA |
| `#2E7D32` sobre `#E9F5EA` (tag sucesso) | ~4.7:1 | AA |
| `#B45309` sobre `#FEF3E2` (tag alerta) | ~5.2:1 | AA |
| `#C62828` sobre `#FCEBEA` (tag erro) | ~5.4:1 | AA |
| branco sobre `#F59E0B` (semáforo 90d) | ~2.0:1 | **REPROVA** → por isso a faixa de 90 dias usa texto escuro `#1E293B` (~8:1, AAA) |

Itens obrigatórios:
- Foco visível em **todos** os elementos interáveis: anel `2px` `primary/600`
  com `2px` de offset (`:focus-visible`), nunca removido por CSS custom.
- Estado de erro de campo não depende só da cor: borda vermelha **+ ícone +
  texto** de mensagem (React Hook Form + `.spec/03` §3.5).
- `prefers-reduced-motion`: desliga transições não essenciais (ver `02` §2.6).

## 1.8 Logotipo e marca (placeholder até definição do cliente)

Enquanto não há logo oficial (PAF-01 permanece parcialmente aberto — a
**paleta** está resolvida, a **marca gráfica** não):

- **Wordmark** provisório: "FarmaControl" em peso 600, `primary/900`, com o
  "Farma" em `primary/600` e "Control" em `neutral/800` — ou monocromático
  `primary/900` sobre claro / branco sobre `primary/800`.
- Símbolo provisório: quadrado com raio `10px` em `primary/600` contendo as
  iniciais "FC" em branco — usado como favicon e ícone de app.
- Área de proteção: metade da altura do wordmark em todos os lados.
- Substituir por asset oficial quando o cliente entregar; o wordmark vive em
  `compartilhado/ui/Marca.tsx` (um único ponto de troca).

## 1.9 Modo escuro

**Fora do escopo do MVP** (não há requisito). Porém os tokens são definidos
por **papel semântico** (`--cor-superficie`, `--cor-texto-forte`,
`--cor-borda`…), não por valor cru espalhado — então habilitar um tema escuro
depois é trocar o mapa de tokens em um lugar (`compartilhado/tema/`), sem
varredura de telas. Ver `02` §2.7.
