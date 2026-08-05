---
version: alpha
name: 归藏PPT · Style B 瑞士国际主义
description: Swiss International Style — Klein-blue accent (#002FA7) on near-white paper, Inter/Helvetica sans-serif throughout. Grid-based asymmetric layouts, modular scale spacing, and monospace data labels. Clean, rational, and rigorously systematic. Feels like a Bauhaus exhibition catalog.

colors:
  paper: "#fafaf8"
  ink: "#0a0a0a"
  accent: "#002FA7"
  accent-hover: "#1e4dc5"
  accent-alt: "#525252"
  grey-1: "#f0f0ee"
  grey-2: "#d4d4d2"
  grey-3: "#a8a8a4"
  line: "rgba(10, 10, 10, 0.15)"
  surface: "#fafaf8"

color-aliases:
  background: paper
  text-primary: ink
  text-secondary: accent-alt
  border: line

typography:
  sans:
    fontFamily: "Inter, Helvetica Neue, Helvetica, Arial, system-ui, sans-serif"
    role: "all display and body text"
  sans-zh:
    fontFamily: "PingFang SC, Hiragino Sans GB, Source Han Sans SC, Noto Sans SC, Microsoft YaHei, sans-serif"
    role: "Chinese text"
  mono:
    fontFamily: "JetBrains Mono, IBM Plex Mono, SF Mono, Consolas, monospace"
    role: "code, data, and KPI labels"

spacing:
  page-wmax: 1200px
  page-pad: 32px
  gap: 24px
  gutter: 24px
  sp-3: 8px
  sp-4: 12px
  sp-5: 16px
  sp-6: 24px
  sp-7: 32px
  sp-8: 40px
  sp-9: 48px
  sp-10: 64px
  sp-11: 80px
  sp-12: 96px
  sp-13: 160px

radius: 4px
scheme: light

shadows:
  shadow-sm: "0 1px 3px rgba(0,0,0,0.06)"
  shadow-md: "0 8px 30px rgba(0,0,0,0.1)"

motion:
  ease-default: "0.18s ease"
  duration-base: 150ms
