---
version: alpha
name: 版式画廊 · Layout Gallery
description: Institutional gallery aesthetic — sage green accent (#3D6B4A) on white, Noto Serif SC display with system sans body. Structure-as-texture: the grid itself is the ornament. Generous whitespace, 12px radius, subtle shadows, and a single restrained accent color used sparingly. Feels like a design institution's permanent collection catalog.

colors:
  accent: "#3D6B4A"
  accent-hover: "#2E5238"
  accent-soft: "#EEF4EF"
  bg: "#FFFFFF"
  surface: "#F4F4F5"
  surface-alt: "#E4E4E7"
  text: "#18181B"
  text-soft: "#52525B"
  text-muted: "#787882"
  heading: "#18181B"
  line: "#D4D4D8"
  line-soft: "#E8E8EC"
  success: "#059669"
  danger: "#dc2626"

color-aliases:
  background: bg
  text-primary: text
  text-secondary: text-soft
  border: line
  accent-subtle: accent-soft

typography:
  display:
    fontFamily: "Noto Serif SC, Source Han Serif SC, Songti SC, SimSun, serif"
    role: "Chinese serif display — elegant, literary"
  body:
    fontFamily: "Noto Sans SC, Inter, Segoe UI, Helvetica Neue, PingFang SC, Microsoft YaHei UI, system-ui, sans-serif"
    role: "body copy — IKEA Noto scheme"
  mono:
    fontFamily: "SF Mono, Consolas, Cascadia Code, IBM Plex Mono, ui-monospace, monospace"
    role: "code, tags, KPIs"

typeScale:
  text-3xl: "clamp(28px, 2.5vw, 36px)"
  text-2xl: "20px"
  text-xl: "17px"
  text-base: "15px"
  text-sm: "13px"
  text-xs: "11px"

spacing:
  page-wmax: 1040px
  page-pad: 32px
  gap: 24px
  gutter: 24px
  space-2xl: 48px
  space-lg: 24px
  space-sm: 12px
  space-2xs: 4px

radius: 12px
scheme: light

shadows:
  shadow-sm: "0 2px 8px rgba(0,0,0,0.06)"
  shadow-md: "0 8px 24px rgba(0,0,0,0.08)"

motion:
  ease-default: "cubic-bezier(0.4, 0, 0.2, 1)"
  duration-base: 150ms
