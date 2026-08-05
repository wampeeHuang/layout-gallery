# Token 命名标准

基于 [Material Design 3 颜色角色体系](https://m3.material.io/styles/color/roles)，29 个标准角色。W3C DTCG 格式。

知识库：`D:\Obsidian\Raw\web-design\md3-color-roles.md`（完整角色表）
全局标准：`D:\Obsidian\Raw\web-design\design-token-standards.md`（四大体系对比）
合约文件：`meta/token-contract.json`

## 命名规则

```
--color-{group}-{variant}
```

- `--color-primary` = 主强调色
- `--color-on-primary` = 放 primary 上的文字
- `--color-primary-container` = primary 的浅色容器
- `--color-on-primary-container` = 容器上的文字

同理 secondary、tertiary、error 各 4 个。surface 10 个。outline 2 个。扩展 3 个。

## 与旧名对照

| 旧名 | 新名 |
|------|------|
| `--accent` | `--color-primary` |
| `--accent-alt` | `--color-secondary` |
| `--bg` | `--color-surface` |
| `--surface` | `--color-surface-container-low` |
| `--text` | `--color-on-surface` |
| `--text-soft` | `--color-on-surface-variant` |
| `--line` | `--color-outline` |
| `--line-soft` | `--color-outline-variant` |
| `--shadow-sm` | `--elevation-sm` |
| `--shadow-md` | `--elevation-md` |
| `--ease-default` | `--ease-standard` |
| `--page-wmax` | `--space-page-wmax` |
| `--page-pad` | `--space-page-pad` |
| `--gap` | `--space-gap` |
| `--gutter` | `--space-gutter` |
| `--radius` | `--radius-base` |

完整映射见 `token-contract.json` → `migrationMap`。

## 工作流

1. 新模板直接用 `--color-*` 命名
2. 旧模板按 `migrationMap` 替换，三处同步（tokens.json + :root + CSS var() 引用）
3. `validate-templates.js` 两个阶段：迁前（接受旧名）、迁后（仅接受新名）
