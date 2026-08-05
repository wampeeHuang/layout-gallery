---
version: alpha
name: 纸媒宣言 · Paper Manifesto
description: Raw brutalist paper aesthetic — rust-terracotta accent on warm cream paper, Georgia serif display with Inter body. Zero-radius corners, solid block shadows, uncoated paper texture. Feels like a letterpress manifesto printed on a hand-cranked press.

colors:
  accent: "#b84f35"
  accent-hover: "#d66d53"
  accent-alt: "#d89a57"
  bg: "#f4efe7"
  text: "#1b1916"
  text-soft: "#5f5951"
  line: "rgba(27, 25, 22, 0.18)"
  surface: "rgba(255, 253, 248, 0.62)"

color-aliases:
  background: bg
  text-primary: text
  text-secondary: text-soft
  border: line

typography:
  display:
    fontFamily: "Georgia, Times New Roman, Noto Serif SC, Songti SC, serif"
    role: "headlines and hero text"
  body:
    fontFamily: "Inter, PingFang SC, Microsoft YaHei, Hiragino Sans GB, system-ui, sans-serif"
    role: "body copy and UI"
  mono:
    fontFamily: "SF Mono, Consolas, Courier New, monospace"
    role: "code and data labels"

spacing:
  page-wmax: 1180px
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
  shadow-sm: "0px 4px 15px 0px rgba(0,0,0,0.1)"
  shadow-md: "4px 4px 0 #b84f35"

motion:
  ease-default: "0.18s ease"
  duration-base: 150ms
