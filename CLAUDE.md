# 版式画廊 · Layout Gallery

AI 调用的设计风格仓库。模板统一索引 → 按意图发现 → 一行 API 拿到 HTML。

遵守 [FOLDER-CONSTITUTION.md](../FOLDER-CONSTITUTION.md)。视觉设计遵守 [DESIGN.md](../DESIGN.md)。

## 架构

```
registry.json + templates/  ← 唯一真相源（Git 管理）
本地 :3080 → 读全量
线上 Vercel → 读 registry，过滤 visibility=public
```

## 启动

```bash
node server.js
# → http://localhost:3080
```

## API

```
GET  /api/registry?type=report&scheme=dark → 模板列表 + 筛选
GET  /api/template/:slug → 单个模板详情 + 文件路径
POST /api/update → 重新扫描模板目录 [Phase 2]
```

## 目录

```
templates/           ← 49 个模板 HTML（按来源分目录）
  beautiful-html-templates/  ← 35 个
  frontend-design/           ← 6 个
  evolution-cat-infographic/ ← 4 个
  guizang-ppt-skill/         ← 2 个
  guizang-social-card-skill/ ← 2 个
registry.json        ← 元数据 + CSS 变量合约
server.js            ← Express
index.html           ← 前端画廊
```
