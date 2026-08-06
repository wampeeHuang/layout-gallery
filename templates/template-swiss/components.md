# Components · Swiss International Style

## Layout Primitives

| Class | Effect |
|-------|--------|
| `.slide` | Full viewport section. Flex column, padding `5.5vh 5vw 7vh 5vw` |
| `.slide.grey` | 95% surface + 5% ink tint background |
| `.slide.dark` | Ink background, surface text |
| `.slide.accent` | Accent background, white text |
| `.slide.accent .accent-block` | White block on accent slide, accent text |
| `.grid-2` | CSS Grid 2-column layout |
| `.grid-3` | CSS Grid 3-column layout |
| `.grid-4` | CSS Grid 4-column layout |

## Typography

| Class | Role | Font | Size |
|-------|------|------|------|
| `.hero` | Main title | `--font-display` | `--sz-hero` (clamp 40-64px) |
| `.section-title` | Section header | `--font-display` | `--sz-section` (clamp 28-40px) |
| `.lead` | Lead / abstract | `--font-body` | `--sz-lead` (clamp 18-22px) |
| `.body` | Body text | `--font-body` | `--sz-body` (16px) |
| `.caption` | Caption / meta | `--font-body` | `--sz-caption` (13px) |
| `.mono` | Data / code / KPI | `--font-mono` | inherit |
| `.stat` | Large stat number | `--font-mono` | large, bold |
| `.kpi-label` | KPI description label | `--font-mono` | small, uppercase |

## Color Accents

| Class | Effect |
|-------|--------|
| `.accent` | Accent color on text (use on inline elements) |
| `.accent-block` | Accent background block |
| `.grey-block` | Grey-1 background block (`--grey-1`) |
| `.muted` | Grey-3 color (secondary/helper text) |

## Rules & Dividers

| Class | Effect |
|-------|--------|
| `.rule` | Horizontal rule, `--color-outline` color |
| `.rule-strong` | Strong horizontal rule, `--border-strong` color |
| `.rule-accent` | Accent-colored rule |

## Chrome (Navigation Layer)

| Element | Purpose |
|---------|---------|
| `.chrome-top` | Top navigation bar |
| `.chrome-bottom` | Bottom navigation bar |
| `.page-indicator` | Current page number display |
| `.chrome-cta` | Call-to-action in chrome |

## Badges & Labels

| Class | Effect |
|-------|--------|
| `.badge` | Pill badge, grey-1 background |
| `.badge.accent` | Pill badge, accent background |
| `.tag` | Small inline tag |
| `.kicker` | Small uppercase eyebrow above heading |

## Cards

| Class | Effect |
|-------|--------|
| `.card` | White card, elevation-sm shadow, radius-base |
| `.card.accent` | Accent background card |
| `.card.dark` | Ink background card |

## Data / Tables

| Class | Effect |
|-------|--------|
| `.data-table` | Clean table, minimal rules |
| `.number` | Right-aligned number cell |
| `.kpi-row` | KPI display row |

## WebGL Background

| Effect | Control |
|--------|---------|
| Grid mesh | `<canvas class="bg">` — opacity 0.55, multiply blend on light, screen on dark |
| Disable | `body.low-power` class removes canvas |
| Accent bleed | Grid reads `--accent` on page flip mouse proximity |

## Section Type Reference (for AI generation)

| Section intent | Recommended slide class | Key elements |
|----------------|------------------------|--------------|
| Hero / title | `.slide` default | `.hero` + `.lead` + `.chrome-bottom` |
| KPI / metrics | `.slide.grey` | `.stat` + `.kpi-label` in `.grid-3` or `.grid-4` |
| Quote / pullquote | `.slide.dark` | large `.lead` + `.caption` attribution |
| Feature highlight | `.slide.accent` | `.hero` + `.accent-block` for contrast |
| Data / table | `.slide` default | `.data-table` or `.grid-*` with `.mono` numbers |
| Comparison | `.slide` default | `.grid-2` with two `.card` columns |
| Closing / CTA | `.slide.accent` | `.hero` + `.chrome-cta` |
