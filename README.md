# DeepSeek Enhancer

一个浏览器扩展，将 DeepSeek AI 的聊天输出转化为可交互的 UI 组件。

## 功能

### 9 种交互式组件

在 DeepSeek 回复中使用 ` ```dse ` 代码块即可渲染为可操作的 UI 面板：

| 组件 | 用途 |
|------|------|
| **checklist** | 多选清单，勾选后提交 |
| **form** | 表单，支持文本、下拉、多行输入 |
| **confirm** | 确认/取消对话框 |
| **slider** | 滑块调节数值参数 |
| **table** | 数据表格，支持行选择和状态标签 |
| **buttons** | 快捷按钮组 |
| **text** | 可编辑文本框，支持复制和重置 |
| **chart** | 柱状图/折线图，可切换，自动统计 |
| **structure** | 可点击结构图，展示架构/流程 |

### 其他特性

- **提示词自动注入**：新聊天时自动注入组件使用规范，让 DeepSeek 知道如何输出交互式组件
- **链接卡片**：自动将 AI 回复中的链接渲染为带 favicon 的卡片样式
- **注入状态提示**：底部 toast 提示注入成功/跳过
- **Shadow DOM 隔离**：组件样式不影响页面，页面样式不影响组件
- **深色主题**：与 DeepSeek 原生界面风格一致

## 安装

### 从源码安装（开发者模式）

1. 下载或 clone 本仓库
2. 打开 Chrome/Edge，进入 `chrome://extensions/`（Edge 为 `edge://extensions/`）
3. 打开右上角 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择本项目的 `ds_web` 文件夹
6. 打开 [DeepSeek](https://chat.deepseek.com/) 即可使用

## 使用方法

1. 安装后打开 DeepSeek 开始新聊天
2. 扩展会自动注入提示词，告知 DeepSeek 如何输出交互式组件
3. 当 DeepSeek 的回复包含 ` ```dse ` 代码块时，会自动渲染为可交互的 UI 面板
4. 用户通过 UI 操作后，结果会自动填入聊天输入框

### 弹窗设置

点击扩展图标可以：
- 开关插件
- 开关新聊天自动注入提示词
- 编辑/重置提示词内容

## 项目结构

```
ds_web/
├── manifest.json          # 扩展配置
├── content/
│   ├── content.js         # 核心逻辑：扫描、解析、渲染组件
│   └── content.css        # 链接卡片和 toast 样式
├── popup/
│   ├── popup.html         # 弹窗界面
│   ├── popup.css          # 弹窗样式
│   └── popup.js           # 弹窗逻辑
├── background/
│   └── service-worker.js  # 后台服务
└── icons/                 # 扩展图标
```

## 许可证

MIT
