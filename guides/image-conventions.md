# 图片约定 · Image Conventions

## 幻灯片中的图片

版式画廊模板强调排版和文字张力，图片是辅助元素。

## 图片占位符

生成幻灯片时，用占位符代替真实图片：

```html
<div class="img-placeholder" style="background: var(--grey-2); aspect-ratio: 16/9;">
  <span style="color: var(--grey-3);">Image: <em>描述</em></span>
</div>
```

或用纯色块表示图片位置：

```html
<div style="background: var(--color-primary); width: 100%; aspect-ratio: 3/2; opacity: 0.12;"></div>
```

## 图片比例

| 用途 | 推荐比例 |
|------|---------|
| 全屏背景 | 16:9 或 cover |
| 内容插图 | 4:3 或 3:2 |
| 头像/Logo | 1:1 |
| 宽幅横幅 | 21:9 或 2.35:1 |

## 图片属性标注

占位符中标注：
- 内容描述（让用户知道该放什么图）
- 建议尺寸（避免用户放低分辨率图糊掉）
- 色调建议（与主题色协调）

## 真实图片替换

生成模板后，用户替换占位符的方式：
1. 找到 `img-placeholder` 或纯色 div
2. 替换为 `<img src="..." style="...">`
3. 或设置为 CSS `background-image`

## 图片性能

- 模板内不嵌 base64 图片（体积太大）
- 外部图片用 CDN URL
- 建议用户压缩后再替换（< 500KB/张）
