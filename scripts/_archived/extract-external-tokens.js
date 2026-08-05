// extract-external-tokens.js — 从外部设计系统提取令牌 → tokens.json
// Usage:
//   node scripts/extract-external-tokens.js                 # 生成全部三套
//   node scripts/extract-external-tokens.js --source=gestalt # 仅 Pinterest Gestalt
//   node scripts/extract-external-tokens.js --source=geist   # 仅 Vercel Geist
//   node scripts/extract-external-tokens.js --source=dribbble # 仅 Dribbble
//
// 输出: templates/design-systems/{slug}/tokens.json + template.html

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');
const OUT_DIR = path.join(PROJECT_DIR, 'templates', 'design-systems');

// ═══════════════════════════════════════════════════════════════
// Pinterest Gestalt (Apache 2.0)
// ═══════════════════════════════════════════════════════════════

function buildGestaltTokens() {
  const fontSans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Helvetica, 'Hiragino Kaku Gothic Pro', 'Meiryo', 'Noto Sans SC', Arial, sans-serif";
  const fontMono = "SFMono-Medium, 'SF Mono', 'Segoe UI Mono', 'Roboto Mono', 'Ubuntu Mono', Menlo, Consolas, Courier, monospace";

  return {
    slug: "pinterest-gestalt",
    version: 1,
    source: "Pinterest Gestalt Design Tokens v177 — Apache 2.0 — https://gestalt.pinterest.systems/",
    categories: ["color", "typography", "spacing", "radius", "shadow", "motion"],
    tokens: {
      color: [
        { name: "--bg", value: "#FFFFFF", role: "surface-bg", description: "页面底色 — white.mochimalist.0" },
        { name: "--bg-card", value: "#F9F9F9", role: "surface-card", description: "卡片/面板背景 — gray.roboflow.50" },
        { name: "--text", value: "#111111", role: "text-primary", description: "主文字色 — black.cosmicore.900" },
        { name: "--text-secondary", value: "#767676", role: "text-secondary", description: "次级文字 — gray.roboflow.500" },
        { name: "--text-muted", value: "#A5A5A5", role: "", description: "最弱文字/占位符 — gray.roboflow.400" },
        { name: "--border", value: "#CDCDCD", role: "border-default", description: "默认边框 — gray.roboflow.300" },
        { name: "--accent", value: "#E60023", role: "accent", description: "强调色/链接/按钮 — red.pushpin.450" },
        { name: "--accent-hover", value: "#B60000", role: "accent-hover", description: "强调色 hover — red.pushpin.600" },
        { name: "--success", value: "#005F3E", role: "success", description: "成功绿 — green.matchacado.600" },
        { name: "--warning", value: "#BD5B00", role: "warning", description: "警告橙 — yellow.caramellow.500" },
        { name: "--error", value: "#CC0000", role: "error", description: "错误红 — red.pushpin.500" },
        { name: "--info", value: "#0074E8", role: "info", description: "信息蓝 — blue.skycicle.500" },
      ],
      typography: [
        { name: "--font-sans", value: fontSans, role: "body-font", description: "正文字体栈 — Gestalt default latin" },
        { name: "--font-mono", value: fontMono, role: "mono-font", description: "等宽字体栈 — Gestalt code" },
        { name: "--text-3xl", value: "36px", role: "display-size", description: "页面主标题 — font.size.600" },
        { name: "--text-2xl", value: "28px", role: "h2-size", description: "二级标题 — font.size.500" },
        { name: "--text-xl", value: "20px", role: "h3-size", description: "三级标题 — font.size.400" },
        { name: "--text-lg", value: "16px", role: "", description: "卡片标题" },
        { name: "--text-base", value: "16px", role: "body-size", description: "正文 — font.size.300" },
        { name: "--text-sm", value: "14px", role: "", description: "辅助文字 — font.size.200" },
        { name: "--text-xs", value: "12px", role: "small-size", description: "标签/小字 — font.size.100" },
        { name: "--text-2xs", value: "11px", role: "", description: "最小字号" },
        { name: "--weight-bold", value: "700", role: "bold-weight", description: "粗体 — font.weight.bold" },
        { name: "--weight-semibold", value: "600", role: "semibold-weight", description: "半粗 — font.weight.semibold" },
      ],
      spacing: [
        { name: "--page-wmax", value: "1200px", role: "page-width", description: "页面内容最大宽度" },
        { name: "--page-pad", value: "32px", role: "page-padding", description: "页面两侧留白 — space.800" },
        { name: "--space-3xl", value: "64px", role: "hero-spacing", description: "页面顶部留白 — space.1600" },
        { name: "--space-2xl", value: "48px", role: "section-spacing", description: "区段间距 — space.1200" },
        { name: "--space-xl", value: "24px", role: "", description: "卡片间距 — space.600" },
        { name: "--space-lg", value: "16px", role: "card-padding", description: "卡片内边距 — space.400" },
        { name: "--space-md", value: "12px", role: "element-gap", description: "元素间距 — space.300" },
        { name: "--space-sm", value: "8px", role: "", description: "紧凑间距 — space.200" },
        { name: "--space-xs", value: "4px", role: "tight-gap", description: "图标-文字间距 — space.100" },
      ],
      radius: [
        { name: "--radius-lg", value: "16px", role: "card", description: "大圆角/modal — rounding.400" },
        { name: "--radius", value: "12px", role: "card", description: "默认卡片圆角 — rounding.300" },
        { name: "--radius-md", value: "8px", role: "card", description: "中等圆角 — rounding.200" },
        { name: "--radius-sm", value: "4px", role: "subtle", description: "小圆角/按钮 — rounding.100" },
        { name: "--radius-xs", value: "4px", role: "sharp", description: "细微圆角 — rounding.100" },
        { name: "--radius-pill", value: "999px", role: "", description: "胶囊圆角 — rounding.pill" },
      ],
      shadow: [
        { name: "--shadow-sm", value: "0 0 8px rgba(0,0,0,0.10)", role: "default", description: "悬浮阴影 — elevation.floating" },
        { name: "--shadow-md", value: "0 2px 8px rgba(0,0,0,0.12)", role: "card-hover", description: "卡片hover — elevation.raised" },
      ],
      motion: [
        { name: "--ease-default", value: "cubic-bezier(0.4,0,0.2,1)", role: "standard-easing", description: "标准缓动曲线" },
        { name: "--duration-fast", value: "140ms", role: "duration-fast", description: "瞬态/hover/click" },
        { name: "--duration-base", value: "150ms", role: "duration-base", description: "标准过渡" },
        { name: "--duration-slow", value: "200ms", role: "", description: "慢过渡/展开" },
        { name: "--duration-slower", value: "350ms", role: "", description: "最慢过渡/入场动画" },
      ],
    },
    brandKit: {
      typeScale: [
        { name: "--brand-t-6xl", value: "36px" },
        { name: "--brand-t-5xl", value: "28px" },
        { name: "--brand-t-4xl", value: "24px" },
        { name: "--brand-t-3xl", value: "20px" },
        { name: "--brand-t-2xl", value: "18px" },
        { name: "--brand-t-xl", value: "17px" },
        { name: "--brand-t-lg", value: "16px" },
        { name: "--brand-t-md", value: "15px" },
        { name: "--brand-t-base", value: "14px" },
        { name: "--brand-t-sm", value: "13px" },
        { name: "--brand-t-xs", value: "12px" },
        { name: "--brand-t-2xs", value: "11px" },
      ],
      spacingScale: [
        { name: "--brand-sp-7xl", value: "64px" },
        { name: "--brand-sp-6xl", value: "48px" },
        { name: "--brand-sp-5xl", value: "40px" },
        { name: "--brand-sp-4xl", value: "32px" },
        { name: "--brand-sp-3xl", value: "24px" },
        { name: "--brand-sp-2xl", value: "20px" },
        { name: "--brand-sp-xl", value: "16px" },
        { name: "--brand-sp-lg", value: "12px" },
        { name: "--brand-sp-md", value: "10px" },
        { name: "--brand-sp-sm", value: "8px" },
        { name: "--brand-sp-xs", value: "6px" },
        { name: "--brand-sp-2xs", value: "4px" },
      ],
    },
    meta: {
      accentColor: "#E60023",
      accentName: "Red Pushpin 450",
      fontStack: "System font stack — no Google Fonts dependency",
      spacingBase: "4px",
      colorRamps: "9 hues × 12 stops + semantic layer",
      source: "npm:gestalt-design-tokens v177.0.12",
      license: "Apache 2.0",
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// Vercel Geist (SIL OPEN FONT LICENSE / MIT)
// ═══════════════════════════════════════════════════════════════

function buildGeistTokens() {
  const fontSans = "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  return {
    slug: "vercel-geist",
    version: 1,
    source: "Vercel Geist Design System — https://vercel.com/geist — Light theme tokens",
    categories: ["color", "typography", "spacing", "radius", "shadow", "motion"],
    tokens: {
      color: [
        { name: "--bg", value: "#FFFFFF", role: "surface-bg", description: "页面底色 — ds-background-100" },
        { name: "--bg-card", value: "#FAFAFA", role: "surface-card", description: "卡片背景 — ds-background-200" },
        { name: "--text", value: "#171717", role: "text-primary", description: "主文字色 — ds-gray-1000" },
        { name: "--text-secondary", value: "#4D4D4D", role: "text-secondary", description: "次级文字 — ds-gray-900" },
        { name: "--text-muted", value: "#8F8F8F", role: "", description: "最弱文字 — ds-gray-700" },
        { name: "--border", value: "#EAEAEA", role: "border-default", description: "默认边框 — ds-gray-400" },
        { name: "--accent", value: "#006BFF", role: "accent", description: "强调色/链接 — ds-blue-700" },
        { name: "--accent-hover", value: "#0059EC", role: "accent-hover", description: "强调色 hover — ds-blue-800" },
        { name: "--success", value: "#107D32", role: "success", description: "成功绿 — ds-green-900" },
        { name: "--warning", value: "#FFA600", role: "warning", description: "警告琥珀 — ds-amber-600" },
        { name: "--error", value: "#FC0035", role: "error", description: "错误红 — ds-red-700" },
        { name: "--info", value: "#006BFF", role: "info", description: "信息蓝 — ds-blue-700" },
      ],
      typography: [
        { name: "--font-sans", value: fontSans, role: "body-font", description: "正文字体栈（Geist Sans 被 GFW 封锁，降级为 Inter）" },
        { name: "--font-mono", value: "'Geist Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace", role: "mono-font", description: "等宽字体栈" },
        { name: "--text-3xl", value: "36px", role: "display-size", description: "页面主标题" },
        { name: "--text-2xl", value: "28px", role: "h2-size", description: "二级标题" },
        { name: "--text-xl", value: "20px", role: "h3-size", description: "三级标题" },
        { name: "--text-lg", value: "16px", role: "", description: "卡片标题" },
        { name: "--text-base", value: "16px", role: "body-size", description: "正文" },
        { name: "--text-sm", value: "14px", role: "", description: "辅助文字" },
        { name: "--text-xs", value: "12px", role: "small-size", description: "标签/小字" },
        { name: "--text-2xs", value: "11px", role: "", description: "最小字号" },
      ],
      spacing: [
        { name: "--page-wmax", value: "1200px", role: "page-width", description: "页面内容最大宽度" },
        { name: "--page-pad", value: "32px", role: "page-padding", description: "页面两侧留白" },
        { name: "--space-3xl", value: "64px", role: "hero-spacing", description: "页面顶部留白" },
        { name: "--space-2xl", value: "48px", role: "section-spacing", description: "区段间距" },
        { name: "--space-xl", value: "24px", role: "", description: "卡片间距" },
        { name: "--space-lg", value: "16px", role: "card-padding", description: "卡片内边距" },
        { name: "--space-md", value: "12px", role: "element-gap", description: "元素间距" },
        { name: "--space-sm", value: "8px", role: "", description: "紧凑间距" },
        { name: "--space-xs", value: "4px", role: "tight-gap", description: "图标-文字间距" },
      ],
      radius: [
        { name: "--radius-lg", value: "16px", role: "card", description: "大圆角/modal" },
        { name: "--radius", value: "12px", role: "card", description: "默认卡片圆角" },
        { name: "--radius-md", value: "8px", role: "card", description: "中等圆角" },
        { name: "--radius-sm", value: "6px", role: "subtle", description: "小圆角/按钮" },
        { name: "--radius-xs", value: "4px", role: "sharp", description: "细微圆角" },
        { name: "--radius-pill", value: "999px", role: "", description: "胶囊圆角" },
      ],
      shadow: [
        { name: "--shadow-sm", value: "0 0 0 1px rgba(0,0,0,0.08)", role: "default", description: "Geist 用 border 替代阴影" },
        { name: "--shadow-md", value: "0 2px 8px rgba(0,0,0,0.08)", role: "card-hover", description: "卡片hover" },
      ],
      motion: [
        { name: "--ease-default", value: "cubic-bezier(0.4,0,0.2,1)", role: "standard-easing", description: "标准缓动" },
        { name: "--duration-fast", value: "150ms", role: "duration-fast", description: "瞬态/hover/click" },
        { name: "--duration-base", value: "200ms", role: "duration-base", description: "标准过渡" },
        { name: "--duration-slow", value: "300ms", role: "", description: "慢过渡/展开" },
        { name: "--duration-slower", value: "500ms", role: "", description: "最慢过渡/入场动画" },
      ],
    },
    brandKit: {
      typeScale: [
        { name: "--brand-t-6xl", value: "36px" },
        { name: "--brand-t-5xl", value: "28px" },
        { name: "--brand-t-4xl", value: "24px" },
        { name: "--brand-t-3xl", value: "20px" },
        { name: "--brand-t-2xl", value: "18px" },
        { name: "--brand-t-xl", value: "17px" },
        { name: "--brand-t-lg", value: "16px" },
        { name: "--brand-t-md", value: "15px" },
        { name: "--brand-t-base", value: "14px" },
        { name: "--brand-t-sm", value: "13px" },
        { name: "--brand-t-xs", value: "12px" },
        { name: "--brand-t-2xs", value: "11px" },
      ],
      spacingScale: [
        { name: "--brand-sp-7xl", value: "64px" },
        { name: "--brand-sp-6xl", value: "48px" },
        { name: "--brand-sp-5xl", value: "40px" },
        { name: "--brand-sp-4xl", value: "32px" },
        { name: "--brand-sp-3xl", value: "24px" },
        { name: "--brand-sp-2xl", value: "20px" },
        { name: "--brand-sp-xl", value: "16px" },
        { name: "--brand-sp-lg", value: "12px" },
        { name: "--brand-sp-md", value: "10px" },
        { name: "--brand-sp-sm", value: "8px" },
        { name: "--brand-sp-xs", value: "6px" },
        { name: "--brand-sp-2xs", value: "4px" },
      ],
    },
    meta: {
      accentColor: "#006BFF",
      accentName: "Blue 700",
      fontStack: "Geist Sans (GFW blocked → Inter fallback)",
      spacingBase: "4px",
      colorRamps: "10 color scales × 10 steps + alpha grays",
      source: "vercel.com/geist (light theme)",
      license: "SIL OPEN FONT LICENSE (font) / MIT (design)",
      note: "Geist Sans/Mono 字体走 Google Fonts，中国大陆加载失败。模板使用 Inter 作为降级字体。",
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// Dribbble
// ═══════════════════════════════════════════════════════════════

function buildDribbbleTokens() {
  return {
    slug: "dribbble",
    version: 1,
    source: "Dribbble brand identity — dribbble.com — extracted from live site + community docs",
    categories: ["color", "typography", "spacing", "radius", "shadow", "motion"],
    tokens: {
      color: [
        { name: "--bg", value: "#FEFEFD", role: "surface-bg", description: "页面底色 — surface-raised" },
        { name: "--bg-card", value: "#FFFFFF", role: "surface-card", description: "卡片背景" },
        { name: "--surface-overlay", value: "#1B1B1C", role: "", description: "遮罩/浮层 — surface-overlay" },
        { name: "--text", value: "#1D1C27", role: "text-primary", description: "主文字色 — heading color" },
        { name: "--text-secondary", value: "#5C5B60", role: "text-secondary", description: "次级文字 — text-primary" },
        { name: "--text-muted", value: "#9E9EA7", role: "", description: "最弱文字 — text-tertiary" },
        { name: "--border", value: "#0C110F", role: "border-default", description: "默认边框 — border-default" },
        { name: "--accent", value: "#EA4C89", role: "accent", description: "Dribbble 经典粉 — 品牌强调色" },
        { name: "--accent-hover", value: "#F2B5D7", role: "accent-hover", description: "强调色 hover — accent token" },
        { name: "--success", value: "#28A948", role: "success", description: "成功绿" },
        { name: "--warning", value: "#FFA600", role: "warning", description: "警告色" },
        { name: "--error", value: "#ECC6B6", role: "error", description: "错误/删除 — destructive" },
        { name: "--info", value: "#006BFF", role: "info", description: "信息色" },
        { name: "--dark-bg", value: "#000000", role: "", description: "暗色背景 — surface-base" },
      ],
      typography: [
        { name: "--font-sans", value: "'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", role: "body-font", description: "正文字体栈 — Dribbble 官方用 Inter" },
        { name: "--font-mono", value: "'SF Mono', 'Cascadia Code', 'Consolas', monospace", role: "mono-font", description: "等宽字体栈" },
        { name: "--text-3xl", value: "42px", role: "display-size", description: "页面主标题 — heading-1" },
        { name: "--text-2xl", value: "32px", role: "h2-size", description: "二级标题" },
        { name: "--text-xl", value: "24px", role: "h3-size", description: "三级标题" },
        { name: "--text-lg", value: "18px", role: "", description: "卡片标题" },
        { name: "--text-base", value: "16px", role: "body-size", description: "正文" },
        { name: "--text-sm", value: "14px", role: "", description: "辅助文字 — body size" },
        { name: "--text-xs", value: "12px", role: "small-size", description: "标签/小字" },
        { name: "--text-2xs", value: "11px", role: "", description: "最小字号" },
        { name: "--weight-bold", value: "700", role: "bold-weight", description: "粗体 — heading weight" },
        { name: "--weight-semibold", value: "600", role: "semibold-weight", description: "半粗 — subheading weight" },
      ],
      spacing: [
        { name: "--page-wmax", value: "1400px", role: "page-width", description: "页面内容最大宽度" },
        { name: "--page-pad", value: "32px", role: "page-padding", description: "页面两侧留白" },
        { name: "--space-3xl", value: "64px", role: "hero-spacing", description: "页面顶部留白" },
        { name: "--space-2xl", value: "48px", role: "section-spacing", description: "区段间距" },
        { name: "--space-xl", value: "24px", role: "", description: "卡片间距" },
        { name: "--space-lg", value: "16px", role: "card-padding", description: "卡片内边距" },
        { name: "--space-md", value: "12px", role: "element-gap", description: "元素间距" },
        { name: "--space-sm", value: "8px", role: "", description: "紧凑间距" },
        { name: "--space-xs", value: "4px", role: "tight-gap", description: "图标-文字间距" },
      ],
      radius: [
        { name: "--radius-lg", value: "20px", role: "card", description: "大圆角/modal — Dribbble 偏好大圆角" },
        { name: "--radius", value: "16px", role: "card", description: "默认卡片圆角" },
        { name: "--radius-md", value: "12px", role: "card", description: "中等圆角" },
        { name: "--radius-sm", value: "8px", role: "subtle", description: "小圆角/按钮" },
        { name: "--radius-xs", value: "4px", role: "sharp", description: "细微圆角" },
        { name: "--radius-pill", value: "9999px", role: "", description: "胶囊圆角" },
      ],
      shadow: [
        { name: "--shadow-sm", value: "0 1px 4px rgba(0,0,0,0.06)", role: "default", description: "默认阴影" },
        { name: "--shadow-md", value: "0 8px 30px rgba(0,0,0,0.12)", role: "card-hover", description: "卡片hover — Dribbble 风格重阴影" },
      ],
      motion: [
        { name: "--ease-default", value: "cubic-bezier(0.4,0,0.2,1)", role: "standard-easing", description: "标准缓动" },
        { name: "--duration-fast", value: "150ms", role: "duration-fast", description: "瞬态/hover/click" },
        { name: "--duration-base", value: "200ms", role: "duration-base", description: "标准过渡" },
        { name: "--duration-slow", value: "300ms", role: "", description: "慢过渡/展开" },
        { name: "--duration-slower", value: "500ms", role: "", description: "最慢过渡/入场动画" },
      ],
    },
    brandKit: {
      typeScale: [
        { name: "--brand-t-6xl", value: "42px" },
        { name: "--brand-t-5xl", value: "32px" },
        { name: "--brand-t-4xl", value: "27px" },
        { name: "--brand-t-3xl", value: "24px" },
        { name: "--brand-t-2xl", value: "20px" },
        { name: "--brand-t-xl", value: "18px" },
        { name: "--brand-t-lg", value: "16px" },
        { name: "--brand-t-md", value: "15px" },
        { name: "--brand-t-base", value: "14px" },
        { name: "--brand-t-sm", value: "13px" },
        { name: "--brand-t-xs", value: "12px" },
        { name: "--brand-t-2xs", value: "11px" },
      ],
      spacingScale: [
        { name: "--brand-sp-7xl", value: "64px" },
        { name: "--brand-sp-6xl", value: "48px" },
        { name: "--brand-sp-5xl", value: "40px" },
        { name: "--brand-sp-4xl", value: "32px" },
        { name: "--brand-sp-3xl", value: "24px" },
        { name: "--brand-sp-2xl", value: "20px" },
        { name: "--brand-sp-xl", value: "16px" },
        { name: "--brand-sp-lg", value: "12px" },
        { name: "--brand-sp-md", value: "10px" },
        { name: "--brand-sp-sm", value: "8px" },
        { name: "--brand-sp-xs", value: "6px" },
        { name: "--brand-sp-2xs", value: "4px" },
      ],
    },
    meta: {
      accentColor: "#EA4C89",
      accentName: "Dribbble Pink",
      fontStack: "Inter — Dribbble official",
      spacingBase: "4px",
      colorRamps: "Dark surface system + pink accent",
      source: "dribbble.com (live scraping + community design docs)",
      license: "Brand identity — fair use for design reference",
      note: "Dribbble 无公开设计令牌包。色彩和字体从官方网站及社区设计文档提取，非官方发布。",
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// template.html 生成 — 含 :root CSS 变量
// ═══════════════════════════════════════════════════════════════

function generateTemplateHTML(tokensData) {
  const vars = [];
  for (const cat of Object.values(tokensData.tokens)) {
    for (const t of cat) {
      vars.push(`  ${t.name}: ${t.value};`);
    }
  }
  return `<style>
:root {
${vars.join('\n')}
}
</style>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${tokensData.slug} — Design Tokens</title>
<h1>${tokensData.slug}</h1>
<p>${tokensData.source}</p>
<dl>
${vars.map(v => '  <dt>' + v.split(':')[0].trim() + '</dt><dd>' + v.split(':')[1].trim().replace(';','') + '</dd>').join('\n')}
</dl>
`;
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);
  const sourceFilter = args.find(a => a.startsWith('--source='));
  const filter = sourceFilter ? sourceFilter.replace('--source=', '') : null;

  const builders = {
    gestalt: buildGestaltTokens,
    geist: buildGeistTokens,
    dribbble: buildDribbbleTokens,
  };

  const sources = filter ? { [filter]: builders[filter] } : builders;

  if (filter && !builders[filter]) {
    console.error('Unknown source: ' + filter + '. Choose: gestalt, geist, dribbble');
    process.exit(1);
  }

  for (const [key, build] of Object.entries(sources)) {
    const tokens = build();
    const dir = path.join(OUT_DIR, tokens.slug);
    fs.mkdirSync(dir, { recursive: true });

    const tokensPath = path.join(dir, 'tokens.json');
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log('✓ ' + tokensPath);

    const htmlPath = path.join(dir, 'template.html');
    fs.writeFileSync(htmlPath, generateTemplateHTML(tokens), 'utf-8');
    console.log('✓ ' + htmlPath);
  }

  console.log('\nDone. ' + Object.keys(sources).length + ' design system(s) extracted.');
  console.log('Next: node scripts/add-template.js <meta.json> for each.');
}

if (require.main === module) {
  main();
}

module.exports = { buildGestaltTokens, buildGeistTokens, buildDribbbleTokens, generateTemplateHTML };
