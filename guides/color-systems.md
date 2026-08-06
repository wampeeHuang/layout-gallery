# 颜色系统 · Color Systems

## MD3 颜色角色（标准模板）

版式画廊基于 Material Design 3 的 29 色角色体系。标准模板（如 template-swiss）使用 MD3 命名。

### 核心 7 色（每个模板必须声明）

| Token | 角色 | 说明 |
|-------|------|------|
| `--color-primary` | 主强调色 | 按钮、链接、accent 块 |
| `--color-secondary` | 辅强调色 | 次级强调 |
| `--color-surface` | 页面背景 | 默认底色 |
| `--color-on-surface` | 主文字 | 背景上的文字 |
| `--color-on-surface-variant` | 次级文字 | 辅助/说明文字 |
| `--color-outline` | 边框 | 分割线、输入框边框 |
| `--color-surface-container-low` | 卡片背景 | 浅色容器 |

### 完整 29 色

参见 `meta/token-contract.json`（W3C DTCG 格式）。

## 模板特有的颜色体系

部分模板使用自己的命名体系，不走 MD3：

| 模板 | 体系 | 核心色 |
|------|------|--------|
| template | 墨水主题（5 套预设） | `--paper` / `--ink` / `--paper-tint` / `--ink-tint` |
| biennale-yellow | 太阳能黄变体系 | `--sun` / `--sun-soft` / `--ember` / `--haze` |
| studio | 二进制黑/黄 | `--near-black` / `--acid-yellow` |
| soft-editorial | 六色尘粉体系 | `--pink` / `--lemon` / `--blush` / `--sage` / `--lilac` |
| brutalist-paper | 粗野阴影色 | `--shadow` / `--shadow-solid` / `--shadow-block` |

## 主题色切换

### template (墨水经典)

5 套预设，从 `references/themes.md` 读取：
- 墨水经典（默认）
- 靛蓝瓷
- 森林墨
- 牛皮纸
- 沙丘

### template-swiss (瑞士)

4 套预设，从 `templates/template-swiss/themes.json` 读取：
- 克莱因蓝（默认）
- 柠檬黄
- 柠檬绿
- 安全橙

## 规则

1. **一份 deck 一套主题** — 不中途换色
2. **不允许混搭** — ink 取 A 套 paper 取 B 套 = 违和
3. **不允许用户自定义 hex** — 委婉拒绝，展示预设让选
4. **不直接改 :root** — 改 `tokens.json` 或 `themes.json`，跑 `compile.mjs`
