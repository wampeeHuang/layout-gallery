# P0 通用门禁 Checklist

任何模板改动交付前必须通过全部门禁。

## 运行验证

```bash
node platform/validate.mjs --all  # exit 0 才能报完成
```

## 检查清单

### Token 完整性
- [ ] `tokens.json` 存在且格式正确
- [ ] 所有必填 token 已声明（`--color-primary`、`--color-secondary`、`--color-surface`、`--color-on-surface`、`--color-on-surface-variant`、`--color-outline`、`--font-display`、`--font-body`、`--radius-base`、`--elevation-sm`、`--ease-standard`、`--duration-base`、`--space-page-wmax`、`--space-page-pad`、`--space-gap`、`--space-gutter`）
- [ ] 无重复 token name
- [ ] 所有 `$type` 与 `value` 格式匹配

### 编译门禁
- [ ] `compile.mjs <slug>` 不报错
- [ ] `compile.mjs <slug> --check` exit 0（无未定义 var() 引用，无 var() fallback 陷阱）

### 视觉门禁
- [ ] 浏览器对比原版与编译后版本，视觉一致

### 文件名门禁
- [ ] template.html 存在且包含 `:root` 块
- [ ] design.md 存在（含设计原则 + 颜色 + 字体）
- [ ] recipes.md 存在（AI 生成配方）
- [ ] themes.json 存在（主题色预设）
- [ ] components.md 存在（组件类名目录）

### 语法门禁
- [ ] JSON 文件可解析（`JSON.parse` 不抛异常）
- [ ] HTML 结构完整（`<html>` / `<head>` / `<body>` 闭合）
- [ ] CSS `:root` 块无语法错误

### 安全门禁
- [ ] 模板 HTML 不含外部资源引用（除了 CDN 字体）
- [ ] 模板 HTML 不含内联 JS（除了必要的 Web Component 初始化）
- [ ] 无 `eval()` / `innerHTML` 注入点

## 不通过 = 不交付

全部门禁 exit 0 再报完成。局部通过不等于全局完成。
