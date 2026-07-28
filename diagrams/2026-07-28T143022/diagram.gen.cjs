// v5 — final architecture: 3-core model, API-as-interface, file-system-as-registry
const fs = require('fs');
const path = require('path');

const C = {
  teal:   "#0D9488", tealBorder:"#99F6E4", tealBg:  "#F0FDFA",
  amber:  "#D97706", amberBorder:"#FDE68A",amberBg:  "#FFFBEB",
  red:    "#E11D48", redBorder:  "#FECACA",redBg:   "#FEF2F2",
  purple: "#7C3AED", purpleBorder:"#DDD6FE",purpleBg:"#F5F3FF",
  gray:   "#6B7280", grayBorder: "#E5E7EB",grayBg:  "#F9FAFB",
  blue:   "#3B82F6", blueBorder: "#BFDBFE",blueBg:  "#EFF6FF",
};

// ── 5 layers ──
const layers = [
  {
    id:"layer-pages", label:"页面层", role:"用户界面", roleColor:C.teal,
    borderColor:C.tealBorder, fillColor:C.tealBg,
    items:[
      "画廊首页\n卡片网格+搜索+筛选",
      "/brand/{slug}\n品牌套件页",
      "/learn/\n设计原理板块\n配色库·字体配对·原则·资源"
    ]
  },
  {
    id:"layer-api", label:"API 层", role:"人+AI 共用接口", roleColor:C.amber,
    borderColor:C.amberBorder, fillColor:C.amberBg,
    items:[
      "GET /api/templates\n模板列表 ✓",
      "GET /api/template\n/{slug}/html ✓",
      "GET /api/template\n/{slug}/tokens",
      "GET /api/token-contract\n命名标准",
      "GET /api/prompt\nAI 套件提示词",
      "GET /brand/{slug}.json\n品牌套件数据"
    ]
  },
  {
    id:"layer-ai", label:"AI 接口层", role:"MCP · 未来", roleColor:C.red,
    borderColor:C.redBorder, fillColor:C.redBg,
    items:[
      "MCP Server\n包装 API 路由",
      "list_templates\nget_tokens",
      "get_brand_kit\nget_token_contract",
      "search_token"
    ]
  },
  {
    id:"layer-meta", label:"meta/", role:"规范定义", roleColor:C.purple,
    borderColor:C.purpleBorder, fillColor:C.purpleBg,
    items:[
      "token-contract.css\n命名契约·六大分类",
      "brand-template.html\n品牌套件元模板\n统一渲染 45 页",
      "ai-system-prompt.md\n共享提示词文件\n按路由获取不复制"
    ]
  },
  {
    id:"layer-tpl", label:"模板层", role:"设计资产 · 自包含目录", roleColor:C.gray,
    borderColor:C.grayBorder, fillColor:C.grayBg,
    items:[
      "templates/{slug}/\ntokens.json · 真相源",
      "templates/{slug}/\ntemplate.html · 范例预览",
      "templates/{slug}/\nbrand.html · 品牌套件(生成)",
      "×45 目录 · 文件系统即注册表"
    ]
  }
];

function makeLayerLabel(layer) {
  return {
    type:"frame", id:`label-${layer.id}`,
    width:80, height:"fit-content",
    layout:"vertical", gap:4, padding:0, alignItems:"center",
    children:[
      { type:"text", id:`label-text-${layer.id}`, width:"fill-container", height:"fit-content",
        text:layer.label, fontSize:18, textAlign:"right", verticalAlign:"middle" },
      { type:"rect", id:`label-tag-${layer.id}`, width:"fit-content", height:"fit-content",
        borderRadius:4, borderWidth:0, fillColor:layer.roleColor,
        text:layer.role, fontSize:10, textColor:"#FFFFFF",
        textAlign:"center", verticalAlign:"middle" }
    ]
  };
}

function makeLayerItems(layer) {
  return {
    type:"frame", id:layer.id,
    width:"fill-container", height:"fit-content",
    borderWidth:2, borderColor:layer.borderColor,
    borderRadius:8, fillColor:layer.fillColor,
    layout:"horizontal", gap:12, padding:20, alignItems:"stretch",
    children: layer.items.map((text, j) => ({
      type:"rect", id:`${layer.id}-item-${j}`,
      width:"fill-container", height:"fit-content",
      borderRadius:8, borderWidth:2,
      borderColor:layer.borderColor, fillColor:"#FFFFFF",
      text, fontSize:12, textAlign:"center", verticalAlign:"middle"
    }))
  };
}

const archLayers = layers.map(layer => ({
  type:"frame", id:`row-${layer.id}`,
  width:"fill-container", height:"fit-content",
  layout:"horizontal", gap:20, padding:0, alignItems:"center",
  children:[makeLayerLabel(layer), makeLayerItems(layer)]
}));

// ── Legend ──
const legendItems = layers.map(l => ({
  type:"frame", id:`legend-${l.id}`,
  width:"fit-content", height:"fit-content",
  layout:"horizontal", gap:6, padding:0, alignItems:"center",
  children:[
    { type:"rect", id:`legend-swatch-${l.id}`, width:14, height:14,
      borderRadius:3, borderWidth:0, fillColor:l.roleColor },
    { type:"text", id:`legend-text-${l.id}`, width:"fit-content", height:"fit-content",
      text:l.label, fontSize:12, textColor:"#6B7280" }
  ]
}));

const legendSection = {
  type:"frame", id:"legend-container",
  width:"fill-container", height:"fit-content",
  layout:"vertical", gap:8, padding:12,
  borderWidth:1, borderColor:"#E5E7EB", borderRadius:8, fillColor:"#FFFFFF",
  children:[
    { type:"text", id:"legend-title", width:"fill-container", height:"fit-content",
      text:"图例", fontSize:13, textColor:"#9CA3AF", textAlign:"left", verticalAlign:"middle" },
    { type:"frame", id:"legend-row", width:"fill-container", height:"fit-content",
      layout:"horizontal", gap:24, padding:0, alignItems:"center", justifyContent:"center",
      children:legendItems }
  ]
};

// ── User flow ──
const userFlowSection = {
  type:"frame", id:"user-flow",
  width:"fill-container", height:"fit-content",
  layout:"vertical", gap:12, padding:16,
  borderWidth:2, borderColor:C.tealBorder, borderRadius:8, fillColor:C.tealBg,
  children:[
    { type:"text", id:"user-flow-title", width:"fill-container", height:"fit-content",
      text:"用户浏览流程", fontSize:16, textAlign:"center", verticalAlign:"middle" },
    { type:"frame", id:"user-flow-row", width:"fill-container", height:"fit-content",
      layout:"horizontal", gap:8, padding:4, alignItems:"center", justifyContent:"space-around",
      children:[
        { type:"ellipse", id:"user-icon", width:48, height:48, fillColor:C.teal,
          text:"用户", fontSize:12, textColor:"#FFFFFF", textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-search", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:"#5EEAD4", fillColor:"#FFFFFF",
          text:"搜索/筛选", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-gallery", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:"#5EEAD4", fillColor:"#FFFFFF",
          text:"画廊首页\n卡片网格", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-modal", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:"#5EEAD4", fillColor:"#FFFFFF",
          text:"iframe 预览\n实时渲染", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-brand", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:"#A78BFA", fillColor:"#F5F3FF",
          text:"品牌套件页\n色板+Token", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-learn", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:"#86EFAC", fillColor:"#F0FDF4",
          text:"/learn/\n设计原理", fontSize:12, textAlign:"center", verticalAlign:"middle" }
      ]
    }
  ]
};

// ── AI flow ──
const aiFlowSection = {
  type:"frame", id:"ai-flow",
  width:"fill-container", height:"fit-content",
  layout:"vertical", gap:12, padding:16,
  borderWidth:2, borderColor:C.redBorder, borderRadius:8, fillColor:C.redBg,
  children:[
    { type:"text", id:"ai-flow-title", width:"fill-container", height:"fit-content",
      text:"AI Agent 调用流程", fontSize:16, textAlign:"center", verticalAlign:"middle" },
    { type:"frame", id:"ai-flow-row", width:"fill-container", height:"fit-content",
      layout:"horizontal", gap:8, padding:4, alignItems:"center", justifyContent:"space-around",
      children:[
        { type:"ellipse", id:"ai-icon", width:48, height:48, fillColor:C.red,
          text:"AI", fontSize:12, textColor:"#FFFFFF", textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-mcp", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:"#FDA4AF", fillColor:"#FFFFFF",
          text:"MCP Server\n标准化接口", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-api-tokens", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:C.amberBorder, fillColor:"#FFFFFF",
          text:"get_tokens\n:root 变量", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-api-brand", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:C.amberBorder, fillColor:"#FFFFFF",
          text:"get_brand_kit\n品牌套件", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"flow-api-prompt", width:"fit-content", height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:C.amberBorder, fillColor:"#FFFFFF",
          text:"get_prompt\nAI 套件指南", fontSize:12, textAlign:"center", verticalAlign:"middle" }
      ]
    }
  ]
};

const flowSection = {
  type:"frame", id:"flows-container",
  width:"fill-container", height:"fit-content",
  layout:"horizontal", gap:20, padding:0, alignItems:"stretch",
  children:[userFlowSection, aiFlowSection]
};

// ── Core model: 一源双端 ──
const coreSection = {
  type:"frame", id:"core-container",
  width:"fill-container", height:"fit-content",
  layout:"vertical", gap:12, padding:16,
  borderWidth:2, borderColor:C.blueBorder, borderRadius:8, fillColor:C.blueBg,
  children:[
    { type:"text", id:"core-title", width:"fill-container", height:"fit-content",
      text:"设计基因三件套 · 一源双端", fontSize:16, textAlign:"center", verticalAlign:"middle" },
    { type:"frame", id:"core-row", width:"fill-container", height:"fit-content",
      layout:"horizontal", gap:12, padding:4, alignItems:"center", justifyContent:"center",
      children:[
        { type:"rect", id:"core-source", width:160, height:"fit-content",
          borderRadius:8, borderWidth:3, borderColor:"#3B82F6", fillColor:"#DBEAFE",
          text:"tokens.json\n每模板1份·真相源\n六大分类·版本锁定", fontSize:13, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"core-brand", width:150, height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:C.purple, fillColor:"#FFFFFF",
          text:"brand-template.html\n品牌套件元模板\n色板·Token表·排版标本", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"core-brand-out", width:140, height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:C.purple, fillColor:"#FFFFFF",
          text:"brand.html\n品牌套件页\n(生成·人看)", fontSize:12, textAlign:"center", verticalAlign:"middle" }
      ]
    },
    { type:"frame", id:"core-row2", width:"fill-container", height:"fit-content",
      layout:"horizontal", gap:12, padding:4, alignItems:"center", justifyContent:"center",
      children:[
        { type:"rect", id:"core-spacer", width:160, height:54, opacity:0,
          borderWidth:0, fillColor:"#EFF6FF" },
        { type:"rect", id:"core-prompt", width:150, height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:C.red, fillColor:"#FFFFFF",
          text:"ai-system-prompt.md\n共享1份·路由获取\nAI 套件使用指南", fontSize:12, textAlign:"center", verticalAlign:"middle" },
        { type:"rect", id:"core-tpl", width:140, height:"fit-content",
          borderRadius:8, borderWidth:2, borderColor:C.teal, fillColor:"#FFFFFF",
          text:"template.html\n范例预览\n(iframe·人看)", fontSize:12, textAlign:"center", verticalAlign:"middle" }
      ]
    },
    { type:"text", id:"core-note", width:"fill-container", height:"fit-content",
      text:"改 tokens.json 一个值 → brand.html + template.html 同时生效  |  AI Agent 调 3 个 API 拿全设计 DNA", fontSize:12,
      textColor:"#6B7280", textAlign:"center", verticalAlign:"middle" }
  ]
};

// ── Roadmap ──
const phases = [
  { label:"一期", title:"模板目录标准化\ntokens.json 结构统一", color:"#3B82F6", bg:"#DBEAFE", border:"#93C5FD", affects:"→ 模板层" },
  { label:"二期", title:"品牌套件元模板\n/brand 路由 + API", color:"#7C3AED", bg:"#EDE9FE", border:"#C4B5FD", affects:"→ meta/ + 页面层" },
  { label:"三期", title:"设计原理板块\n/learn 上线", color:"#16A34A", bg:"#DCFCE7", border:"#86EFAC", affects:"→ 页面层" },
  { label:"四期", title:"AI 接口上线\nMCP Server", color:"#E11D48", bg:"#FEE2E2", border:"#FCA5A5", affects:"→ AI 接口层" }
];

const roadmapItems = phases.map(p => ({
  type:"frame", id:`phase-${p.label}`,
  width:"fill-container", height:"fit-content",
  layout:"vertical", gap:4, padding:14,
  borderWidth:2, borderColor:p.border, borderRadius:8, fillColor:p.bg,
  children:[
    { type:"text", id:`phase-label-${p.label}`, width:"fill-container", height:"fit-content",
      text:p.label, fontSize:13, textColor:p.color, textAlign:"center", verticalAlign:"middle" },
    { type:"text", id:`phase-title-${p.label}`, width:"fill-container", height:"fit-content",
      text:p.title, fontSize:14, textAlign:"center", verticalAlign:"middle" },
    { type:"text", id:`phase-affects-${p.label}`, width:"fill-container", height:"fit-content",
      text:p.affects, fontSize:11, textColor:"#9CA3AF", textAlign:"center", verticalAlign:"middle" }
  ]
}));

const roadmapSection = {
  type:"frame", id:"roadmap-container",
  width:"fill-container", height:"fit-content",
  layout:"horizontal", gap:12, padding:0,
  children:roadmapItems
};

// ── Connectors ──

// Architecture (top-down)
const archConnectors = [];
for (let i = 0; i < layers.length - 1; i++) {
  archConnectors.push({
    type:"connector",
    connector:{
      from:layers[i].id, to:layers[i+1].id,
      fromAnchor:"bottom", toAnchor:"top",
      lineShape:"polyline", lineColor:"#9CA3AF", lineWidth:1.5, endArrow:"arrow"
    }
  });
}

// AI → API (MCP wraps API)
const aiApiConnector = {
  type:"connector",
  connector:{
    from:"layer-ai", to:"layer-api",
    fromAnchor:"left", toAnchor:"left",
    lineShape:"polyline", lineColor:"#E11D48", lineWidth:1.5, lineDash:"dashed", endArrow:"arrow"
  }
};

// User flow
const userFlowConnectors = [
  { from:"user-icon", to:"flow-search" },
  { from:"flow-search", to:"flow-gallery" },
  { from:"flow-gallery", to:"flow-modal" },
  { from:"flow-modal", to:"flow-brand" },
  { from:"flow-gallery", to:"flow-learn" }
].map(c => ({
  type:"connector",
  connector:{ from:c.from, to:c.to, lineShape:"polyline", lineColor:C.teal, lineWidth:2, endArrow:"arrow" }
}));

// AI flow
const aiFlowConnectors = [
  { from:"ai-icon", to:"flow-mcp" },
  { from:"flow-mcp", to:"flow-api-tokens" },
  { from:"flow-mcp", to:"flow-api-brand" },
  { from:"flow-mcp", to:"flow-api-prompt" }
].map(c => ({
  type:"connector",
  connector:{ from:c.from, to:c.to, lineShape:"polyline", lineColor:C.red, lineWidth:2, endArrow:"arrow" }
}));

// Core data flow
const coreConnectors = [
  { from:"core-source", to:"core-brand", color:C.purple },
  { from:"core-brand", to:"core-brand-out", color:C.purple },
  { from:"core-source", to:"core-prompt", color:C.red },
  { from:"core-source", to:"core-tpl", color:C.teal }
].map(c => ({
  type:"connector",
  connector:{
    from:c.from, to:c.to,
    fromAnchor:"bottom", toAnchor:"top",
    lineShape:"polyline", lineColor:c.color, lineWidth:2, endArrow:"arrow"
  }
}));

// ── Assemble ──
const doc = {
  version:2,
  nodes:[
    {
      type:"frame", id:"root",
      x:0, y:0, width:1200, height:"fit-content",
      layout:"vertical", gap:20, padding:24,
      children:[
        { type:"text", id:"main-title", width:"fill-container", height:"fit-content",
          text:"版式画廊 v2 架构全景", fontSize:28, textAlign:"center", verticalAlign:"middle" },
        { type:"text", id:"subtitle", width:"fill-container", height:"fit-content",
          text:"设计基因三件套 · 文件系统即注册表 · API 人机共用 · AI 友好  |  v5 · 2026-07-28", fontSize:13,
          textColor:"#9CA3AF", textAlign:"center", verticalAlign:"middle" },

        { type:"text", id:"section-arch", width:"fill-container", height:"fit-content",
          text:"系统架构（自顶向下）", fontSize:20, textAlign:"left", verticalAlign:"middle" },
        ...archLayers,

        legendSection,

        { type:"text", id:"section-core", width:"fill-container", height:"fit-content",
          text:"设计基因三件套 · 一源双端", fontSize:20, textAlign:"left", verticalAlign:"middle" },
        coreSection,

        { type:"text", id:"section-flows", width:"fill-container", height:"fit-content",
          text:"核心交互流程", fontSize:20, textAlign:"left", verticalAlign:"middle" },
        flowSection,

        { type:"text", id:"section-roadmap", width:"fill-container", height:"fit-content",
          text:"推进路线", fontSize:20, textAlign:"left", verticalAlign:"middle" },
        roadmapSection,

        { type:"text", id:"footer", width:"fill-container", height:"fit-content",
          text:"tokens.json 一源双端 · AI 3 API 拿全设计 DNA · Token 六大分类 · 文件系统即注册表", fontSize:13,
          textColor:"#9CA3AF", textAlign:"center", verticalAlign:"middle" }
      ]
    },
    ...archConnectors,
    aiApiConnector,
    ...coreConnectors,
    ...userFlowConnectors,
    ...aiFlowConnectors
  ]
};

const outPath = path.join(__dirname, 'diagram.json');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf-8');
console.log('Generated:', outPath);
console.log('Size:', JSON.stringify(doc).length, 'bytes');
