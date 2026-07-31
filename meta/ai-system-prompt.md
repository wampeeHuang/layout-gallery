# 版式画廊 · 一源双端模板生成规范

AI 可直接读此文件。人也可复制全文粘贴给任何 AI。
两种路径，同一份契约。

---

## 架构：一源双端

```
tokens.json                    ← 你创建的，唯一数据源
    │
    ├─→ template-renderer.js   →  template.html    (产品范例页)
    └─→ brand-renderer.js     →  brand-kit.html   (品牌套件页)
```

**三份产出物，你只管一份（tokens.json）。** 另两份由脚本自动生成，但你写 tokens.json 的方式决定了它们生成的质量。

| 文件 | 角色 | 谁写 | 受众 |
|------|------|------|------|
| `tokens.json` | 单一真相源 | **你** | 脚本 + 人类参考 |
| `template.html` | 产品范例页 — 这套 token 在真实页面里长什么样 | template-renderer.js | 设计师选型时看的 |
| `brand-kit.html` | 品牌套件页 — 参数表，列出所有 token 值 | brand-renderer.js | 开发者引用时看的 |

---

## 一、tokens.json 规范

这是你唯一需要产出的文件。两个顶层分区：`tokens`（原始变量）和 `brandKit`（品牌级封装）。

### 1.1 tokens — 六大分类

```json
{
  "tokens": {
    "color": [],
    "typography": [],
    "spacing": [],
    "radius": [],
    "shadow": [],
    "motion": []
  }
}
```

每个条目格式：

```json
{ "name": "--变量名", "value": "值", "role": "语义角色", "description": "一句话" }
```

### 1.2 color — 最少 7 个

| role | 示例 name | 说明 |
|------|-----------|------|
| `surface-bg` | `--bg` | 页面底色 |
| `surface-card` | `--bg-card` | 卡片/面板背景 |
| `text-primary` | `--text` | 主文字色 |
| `text-secondary` | `--text-secondary` | 次级文字色 |
| `border` | `--border` | 边框色 |
| `accent` | `--accent` | 唯一强调色 |
| `accent-hover` | `--accent-hover` | 强调色 hover |

规则：
- 单一强调色。如果设计需要第二个强调色，用 `accent-alt` role
- 值用 hex 或 rgba()，不用 hsl()、oklch()
- rgba 透明度用 0-1 小数，不用百分比

### 1.3 typography — 最少 2 个

| role | 示例 name | 说明 |
|------|-----------|------|
| `display` | `--display` | 展示字体栈（标题用） |
| `body` | `--body` | 正文字体栈 |

规则：
- 字体栈用逗号分隔，末尾必须有通用族（serif / sans-serif）
- 字体名含空格时加引号：`"Noto Serif SC"`
- 不声明 Google Fonts URL——画廊部署在中国大陆

### 1.4 spacing — 最少 2 个

| role | 示例 name | 说明 |
|------|-----------|------|
| `page-width` | `--page-w` | 内容区最大宽度 |
| `gutter` | `--gutter` | 全局间距基准 |

额外间距用品牌套件 spacingScale 表达（见 1.7），不进 tokens.spacing。

### 1.5 radius — 至少 1 个

允许 `0px`（扁平/粗野主义），但必须声明。

### 1.6 shadow — 至少 1 个

允许实心偏移（`4px 4px 0 #b84f35`）——粗野主义用 blur=0。允许模糊阴影（`0 4px 15px rgba(0,0,0,0.1)`）——景深用 blur>0。
必须声明，不假装有你不用的。

### 1.7 motion — 至少 1 个

允许只声明一条 transition。但必须声明。

### 1.8 brandKit — 品牌级封装

```json
{
  "brandKit": {
    "colorRoles": {
      "primary": "#b84f35",
      "secondary": "#d89a57",
      "background": "#f4efe7",
      "text": "#1b1916",
      "textSecondary": "#5f5951",
      "border": "rgba(27, 25, 22, 0.18)",
      "surface": "rgba(255, 253, 248, 0.62)"
    },
    "typeScale": [],
    "spacingScale": []
  }
}
```

**colorRoles** — 7 个语义色角色。这是 template-renderer.js 读取的入口。
规则：
- primary / secondary 来自 tokens.color
- background / surface 来自 tokens.color
- text / textSecondary 来自 tokens.color
- border 来自 tokens.color

**typeScale** — 字号阶梯，template-renderer.js 用它生成 `:root` 中的 `--sz-*` 变量。
规则：
- name 用 `--sz-{层级}` 格式：`--sz-h1`, `--sz-h2`, `--sz-body`, `--sz-small`
- value 用 rem/clamp()/px。**template.html 语境下的实际字号**——你是海报就用海报字号，你是仪表盘就用仪表盘字号。brand-kit 页只在表格里展示这些值，不会把 9.6rem 当成自己的标题字号（那是不相关渲染器的 bug）
- 不要为了"看起来合理"而缩水——诚实记录设计中的真实字号

**spacingScale** — 间距阶梯，template-renderer.js 用它生成 `--sp-*` 变量。
规则：
- name 用 `--sp-{层级}` 格式：`--sp-xs`, `--sp-sm`, `--sp-md`, `--sp-lg`, `--sp-xl`
- value 用 px
- 4px 基座优先，但不强制（粗野主义可以用非常大的间距）

---

## 二、template.html 规范

这份文件由 `template-renderer.js` 自动生成：读取 tokens.json → 匹配骨架 → 注入 `:root` 变量 → 输出。

你不会直接写 template.html，但你写的 tokens.json 决定了它长什么样。

| tokens.json 字段 | 影响 template.html 的什么 |
|------------------|--------------------------|
| brandKit.colorRoles | 整个页面的配色 |
| brandKit.typeScale | 标题和正文的字号 |
| brandKit.spacingScale | 区段间距和留白 |
| tokens.typography | 字体选择 |
| tokens.radius | 卡片/按钮的圆角 |
| tokens.shadow | 卡片 hover 和按钮的阴影 |
| tokens.motion | 过渡时间 |

**渲染器的行为：**
1. 读 registry.json 找到模板的 `template_type`
2. 匹配对应骨架（`templates/skeletons/` 目录）
3. 用 brandKit.colorRoles 填充骨架的 `:root` 块
4. 将 typography / spacing / radius / shadow / motion 也注入 `:root`
5. 填充内容占位符（模板名、标题、描述等）

---

## 三、brand-kit.html 规范

这份文件由 `brand-renderer.js` 自动生成。它是一个品牌参数表——不是设计范例，是技术参考。

**brand-kit 页展示内容：**
- 调色板色块和 hex 值
- 排版标本（用实际字体渲染示例文字）
- 间距刻度条
- 圆角预览
- 阴影卡片
- 动效参数
- 完整 Token 表格

**brand-kit 页不做什么：**
- 不套用模板的标题字号——那是在参数表里展示的数据，不是页面自己的 CSS
- 不复制模板的背景纹理——参数表有自己的版式
- 不把模板的极端 editorial 设计当作自己的 UI

**和 template.html 的关系：**
template.html 是"穿上这套 token 设计的真实页面"。
brand-kit.html 是"脱下来的衣服，摊开让你看每一根线"。
同一个数据源，两种视角。

---

## 四、管道关系速查

```
                  你写 tokens.json
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    colorRoles    typeScale    spacingScale
          │            │            │
          ▼            ▼            ▼
  template-renderer.js      brand-renderer.js
          │                       │
          ▼                       ▼
    template.html           brand-kit.html
   (产品范例页)             (品牌套件页)
```

---

## 五、输出前自检

### tokens.json
□ 六大分类齐全（允许空数组，但至少有 color/typography/spacing）
□ brandKit.colorRoles 有 7 个角色，值都来自 tokens.color
□ colorRoles.primary 是设计的唯一强调色
□ 字体栈末尾有通用族
□ rgba 透明度用小数
□ spacing 值是整数 px

### template.html（由脚本生成，但你写 tokens.json 时应该能预见）
□ :root 块由六段注释分隔
□ 零硬编码 hex/rgba — 全部 var(--*)
□ 零硬编码 px — 全部 var(--*)
□ 每行一个 CSS 属性
□ 单一强调色贯穿全页
□ 标题 text-wrap: balance，正文 text-wrap: pretty

### brand-kit.html（由脚本生成，你需要知道它展示什么）
□ 调色板色块和 hex 值对应 tokens.color
□ Token 表格完整列出所有变量
□ 页面自身的版式不受模板 token 值影响
