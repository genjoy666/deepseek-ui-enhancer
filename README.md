# DeepSeek Enhancer

参考chatGPT交互式UI，将 DeepSeek网页端的聊天输出转化为可交互的UI组件。

## 功能

在 DeepSeek 回复中使用 ` ```dse ` 代码块即可渲染为可操作的 UI 面板：

| 组件 | 用途 |
|------|------|
| **card** | 自定义 HTML 卡片，支持 Lucide 图标、网格布局、CSS 3D 动画 |
| **map** | 地图卡片，基于 OpenStreetMap 定位标记 |
| **mindmap** | 思维导图，支持拖拽平移和缩放 |
| **image** | 图片展示，支持大图/小图/自定义尺寸，点击放大 |
| **checklist** | 多选清单，勾选后提交 |
| **form** | 表单，支持文本、下拉、多行输入 |
| **confirm** | 确认/取消对话框 |
| **slider** | 滑块调节数值参数 |
| **table** | 数据表格，支持行选择和状态标签 |
| **buttons** | 快捷按钮组 |
| **text** | 可编辑文本框，支持复制和重置 |
| **chart** | 柱状图/折线图，可切换，自动统计 |
| **structure** | 可点击结构图，展示架构/流程 |

**card**：

<img width="505" height="707" alt="image" src="https://github.com/user-attachments/assets/57d7ce90-9048-4afd-ae9c-2b4d16899885" />

**map**：

<img width="797" height="492" alt="image" src="https://github.com/user-attachments/assets/0ac55898-14d9-426b-985a-5f10c28b960d" />

**mindmap**：

<img width="786" height="615" alt="image" src="https://github.com/user-attachments/assets/51834895-a49f-4909-8472-eae35c83bb9a" />

**image**：

<img width="802" height="320" alt="image" src="https://github.com/user-attachments/assets/20d79089-0a13-412b-a82d-32f9c12a1730" />

**checklist**:

<img width="797" height="332" alt="image" src="https://github.com/user-attachments/assets/a0d08581-a2eb-44d8-825e-f1f9945101ba" />

**form**:

<img width="806" height="602" alt="image" src="https://github.com/user-attachments/assets/6d7029ec-2ca7-407e-9dae-5de85bafdfe6" />

**confirm**:

<img width="797" height="203" alt="image" src="https://github.com/user-attachments/assets/333a32c6-5a93-405f-9b4b-6d23c9c0d3d8" />

**slider**:

<img width="816" height="360" alt="image" src="https://github.com/user-attachments/assets/6caac1ff-a5cf-49bc-9242-300f1f2d210a" />

**table**:

<img width="787" height="641" alt="image" src="https://github.com/user-attachments/assets/d5448acb-a313-4581-b596-327ba42660c7" />

**buttons**:

<img width="782" height="282" alt="image" src="https://github.com/user-attachments/assets/b9949143-baa7-4d58-91c2-139c2897df38" />

**text**:

<img width="791" height="430" alt="image" src="https://github.com/user-attachments/assets/75fea22d-0e14-4f72-b9d6-d15a22806557" />

**chart**:

<img width="797" height="647" alt="image" src="https://github.com/user-attachments/assets/9d3e4e8a-92dd-4d4f-a30e-61ce33daa315" />

**structure**:

<img width="907" height="603" alt="image" src="https://github.com/user-attachments/assets/2a1847e4-a27e-4fba-b323-651706df2000" />


### 其他特性

- **提示词自动注入**：新聊天时自动注入组件使用规范，让 DeepSeek 知道如何输出交互式组件
- **链接卡片**：自动将 AI 回复中的链接渲染为带 favicon 的卡片样式
- **注入状态提示**：底部 toast 提示注入成功/跳过
- **Shadow DOM 隔离**：组件样式不影响页面，页面样式不影响组件

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
