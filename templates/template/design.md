---
version: alpha
name: 归藏PPT · Style A 电子杂志
description: Electronic magazine aesthetic — near-black ink on warm grey paper, Playfair Display + Source Serif 4 serif typography. Dual-layer WebGL canvas background with light/dark mode transition. Editorial longform layout with generous whitespace and subtle shadows. Feels like a digital quarterly on a tablet.

colors:
  paper: "#f1efea"
  paper-tint: "#e8e5de"
  ink: "#0a0a0b"
  ink-tint: "#18181a"
  accent: "#333333"
  accent-hover: "#515151"
  accent-alt: "#888888"
  line: "rgba(10, 10, 11, 0.18)"
  surface: "#f1efea"

color-aliases:
  background: paper
  text-primary: ink
  text-secondary: ink-tint
  border: line

typography:
  serif-en:
    fontFamily: "Playfair Display, Source Serif 4, Georgia, serif"
    role: "English serif display"
  serif-body-en:
    fontFamily: "Source Serif 4, Georgia, serif"
    role: "English serif body"
  serif-zh:
    fontFamily: "Noto Serif SC, source-han-serif-sc, serif"
    role: "Chinese serif"
  sans-zh:
    fontFamily: "Noto Sans SC, source-han-sans-sc, sans-serif"
    role: "Chinese sans"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    role: "code and labels"

spacing:
  page-wmax: 1200px
  page-pad: 32px
  gap: 24px
  gutter: 24px
  space-2xl: 48px
  space-lg: 24px
  space-sm: 12px
  space-2xs: 4px

radius: 0px
scheme: light

shadows:
  shadow-sm: "0 1px 3px rgba(0,0,0,0.06)"
  shadow-md: "0 8px 30px rgba(0,0,0,0.1)"

motion:
  ease-default: "0.18s ease"
  duration-base: 150ms
