# AI Prompt: 版式画廊

> **这是唯一的 AI 操作文件。只有 AI 读。** AI 读此文件 → 生成 CSS → 自审 §7 合规清单 → 不合规 = 重新生成。
> AI 生成和审计的闭环中没有人工审核环节。
>
> 人读版本见 Obsidian `设计原则-通用六条.md`。
>
> 将以下内容粘贴给 Cursor / Claude Code / Copilot。

---

## Design Kit: 版式画廊 (Layout Gallery)

You are generating CSS for a Swiss-minimal gallery platform. Every output
MUST pass the compliance checklist below. Non-compliant output = regenerate.

---

### 1. Philosophy (Layer 1 — Design DNA, 7 principles)

These are non-negotiable. They shape every decision.

- **Single source of truth** — registry.json drives everything. CSS :root
  must match token-contract.json exactly. No drift.
- **Semantic over literal** — name by intent, not appearance. Templates keep
  their own variable names (--paper, --ink); registry maps to standard roles.
- **Less but better** — one accent color, three text grays. Delete to the
  skeleton, then add back only what's necessary.
- **Unobtrusive** — UI retreats, content advances. Brand colors must never
  compete with template content.
- **Honest** — token coverage is not faked. This prompt and CSS :root are
  identical. No AI-only fake tokens.
- **Thorough to the last detail** — every pixel, every millisecond, every
  name has a reason. Nothing arbitrary.
- **Static First** — HTML+CSS must be a complete readable page without JS.
  `file://` open = full page. JS enhances, never replaces content.
  Floor, not ceiling. Does not constrain template authors upward.

---

### 2. Output Format Constraints (#11 CSS as Protocol)

Your CSS is consumed by 3 systems: audit AI, brand page extractor, MCP API.
Format is not cosmetic — it's the interface.

**MUST:**
- One CSS property per line. Never compress multiple properties on one line.
  Reason: git diff operates per line. One property = one diff unit.
  Compressed = audit AI cannot tell which property changed.
- Group declarations with section headers: /* Color */ /* Typography */
  /* Spacing */ /* Radius */ /* Shadow */ /* Motion */
  These are parser markers for the audit AI, not decoration.
- Every value comes from a var() reference. See §3 Token Contract.

**MUST NOT:**
- Compress CSS to single line or multi-property line
- Omit section headers
- Output raw hex/rgba/px values without var() wrapping

---

### 3. Token Contract (#8 Auditable + #9 Deterministic)

The token-contract.json defines the legal variables across 6 categories.
These are the ONLY values you may use. Generating new tokens = non-compliant.

**MUST:**
- All colors via var(--bg), var(--text), var(--accent), etc.
- All font-sizes via var(--text-3xl) through var(--text-2xs)
- All spacing via var(--space-3xl) through var(--space-xs)
- All border-radius via var(--radius-lg) through var(--radius-pill)
- All shadows via var(--shadow-sm) or var(--shadow-md)
- All transitions via var(--ease-default) + var(--duration-*)
- Integer px only. 12px, never 11.7px. Fractional px = probability noise.

**MUST NOT:**
- Output `color: #333` — use `color: var(--text-secondary)`
- Output `font-size: 15px` — use `font-size: var(--text-lg)`
- Output `border-radius: 8px` — value outside defined token set
- Invent new --var names outside the token-contract

---

### 4. Typography Rules (#10 Typography is Editing)

**MUST:**
- All headings: `text-wrap: balance` (≤6 lines, evenly distributed)
- All body text: `text-wrap: pretty` (last line ≥2 characters)
- Font stack: --font-sans ('Inter','Noto Sans SC',sans-serif)
- Mono only for code/token names: --font-mono

**MUST NOT:**
- Output widow lines (single word on last line of paragraph)
- Output orphan lines (single line of paragraph at top of next column)
- If text content would produce a widow, reflow or manually break the line.
- Use serif fonts anywhere

---

### 5. Visual Richness (#12 Graded Visual Richness)

Requirements vary by page type. Match the tier.

| Tier | Requirement | Applies to |
|------|------------|------------|
| **Brand** | SVG logo (inline code, never emoji) + ≥1 branded animation + illustration | /brand/{slug}/, landing pages, hero sections |
| **Content** | Images + hover feedback (transform/shadow transition) | template cards, blog lists, galleries |
| **Tool** | Plain text allowed. Function over decoration. | settings, search panels, forms |

**Check before output:** which tier is this page? Are all required visual
elements present?

---

### 6. Concrete Token Values

#### Color
| Variable | Value | Role |
|----------|-------|------|
| --bg | #fafafa | page background |
| --bg-card | #fff | cards, panels, surfaces |
| --text | #1a1a1a | primary text, headings |
| --text-secondary | #666 | descriptions, taglines |
| --text-muted | #999 | meta, counts, placeholders |
| --border | #e8e8e8 | card borders, input borders |
| --accent | #2563eb | active chips, focus rings, links |
| --accent-hover | #1d4ed8 | hover deepen |

#### Typography
| Variable | Value | Usage |
|----------|-------|-------|
| --font-sans | 'Inter','Noto Sans SC',sans-serif | all body text |
| --font-mono | "SF Mono","Cascadia Code","Consolas",monospace | code, token names |
| --text-3xl | 32px | hero headings |
| --text-2xl | 24px | section headings |
| --text-xl | 18px | subsection headings |
| --text-lg | 15px | large body |
| --text-base | 16px | body (default) |
| --text-sm | 13px | labels, tags |
| --text-xs | 12px | small meta |
| --text-2xs | 11px | micro text, mono labels |

#### Spacing
| Variable | Value | Usage |
|----------|-------|-------|
| --space-3xl | 48px | hero padding |
| --space-2xl | 32px | page padding |
| --space-xl | 24px | section gaps |
| --space-lg | 20px | card padding |
| --space-md | 14px | element gaps |
| --space-sm | 8px | tight gaps |
| --space-xs | 4px | micro gaps |

#### Radius
| Variable | Value | Usage |
|----------|-------|-------|
| --radius-lg | 16px | large cards |
| --radius | 12px | cards (default) |
| --radius-md | 10px | search inputs |
| --radius-sm | 6px | small elements |
| --radius-xs | 4px | sharp corners |
| --radius-pill | 9999px | chips, pills |

#### Shadow
| Variable | Value | Usage |
|----------|-------|-------|
| --shadow-sm | 0 1px 3px rgba(0,0,0,0.04) | card default |
| --shadow-md | 0 8px 30px rgba(0,0,0,0.08) | card hover, modal |

#### Motion
| Variable | Value | Usage |
|----------|-------|-------|
| --ease-default | cubic-bezier(0.4,0,0.2,1) | all transitions |
| --duration-fast | 140ms | micro-interactions |
| --duration-base | 150ms | hover in |
| --duration-slow | 200ms | hover out, slide |
| --duration-slower | 350ms | modal, page transitions |

---

### 7. Pre-Output Compliance Checklist

Before returning CSS, verify ALL of the following:

□ Every color value uses var(--*) — zero raw hex/rgba
□ Every font-size uses var(--text-*) — zero raw px
□ Every spacing uses var(--space-*) — zero raw px
□ Every border-radius uses var(--radius-*) — zero raw px
□ Every shadow uses var(--shadow-*) — zero raw
□ Every transition uses var(--ease-default) + var(--duration-*)
□ All px values are integers — no 11.7, 12.3, etc.
□ One property per line — no compressed lines
□ Six section headers present: /* Color */ through /* Motion */
□ text-wrap: balance on all headings
□ text-wrap: pretty on all body text
□ No widow/orphan lines in text content
□ Visual richness matches page tier (see §5)
□ SVG logo is inline code, not emoji (brand tier only)
□ No serif fonts anywhere
□ Only one accent color used

If ANY box is unchecked → output is non-compliant → regenerate.
