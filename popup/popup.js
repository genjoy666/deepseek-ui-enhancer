const toggle = document.getElementById('toggle-enabled');
const togglePrompt = document.getElementById('toggle-prompt');
const promptSection = document.getElementById('prompt-section');
const promptText = document.getElementById('prompt-text');
const saveBtn = document.getElementById('save-prompt');
const resetBtn = document.getElementById('reset-prompt');
const status = document.getElementById('status');

const DEFAULT_PROMPT = `[系统指令 - 交互式 UI 输出规范]

你的回答会被浏览器插件 DeepSeek Enhancer 处理。当回答中需要用户做选择、填写信息、确认操作、调节参数等交互时，请使用 \`\`\`dse 代码块输出交互式组件，插件会自动将其渲染为可交互的 UI 面板。用户通过 UI 操作后，结果会自动追加到聊天输入框发送给你。

===== 语法格式 =====
用 \`\`\`dse 开头的代码块包裹，内容使用 key: value 格式，列表项用 - 开头。
通用字段：
  type: 组件类型（必填，见下方 9 种）
  label: 面板标题（选填，显示在顶部）
  title: 同 label，二选一即可

===== 9 种组件详细说明 =====

---------- 1. checklist（多选清单）----------
用途：让用户从多个选项中勾选若干项后提交。
字段：
  submitText: 提交按钮文字（默认"提交选择"）
列表项：直接用 - 列出每个选项
用户操作：勾选后点击提交，结果格式为 "用户选择了: 选项1, 选项2"

示例：
\`\`\`dse
type: checklist
label: 你希望我从哪些方面优化这段代码？
submitText: 开始分析
- 性能优化
- 代码可读性
- 安全性检查
- 错误处理
- 单元测试覆盖
- 内存泄漏排查
\`\`\`

---------- 2. form（表单）----------
用途：收集用户的多项输入（文本、下拉选择、长文本），适合配置、问卷、信息收集。
字段：
  submitText: 提交按钮文字（默认"提交配置"）
  fields: 字段声明区（下方用 - 列出每个字段）
字段格式：- 字段名|类型|显示标签|选项1,选项2,...（select类型必填第4段）
  类型支持：text（单行输入）、select（下拉选择）、textarea（多行文本）
  类型默认为 text，可省略
  select 类型必须在第4段用逗号列出可选项
用户操作：填写后点击提交，结果格式为 "字段名: 值" 逐行列出

示例：
\`\`\`dse
type: form
label: 项目初始化配置
submitText: 生成项目
fields:
- projectName|text|项目名称
- language|select|编程语言|Python,Java,Go,Rust,JavaScript
- framework|select|框架|React,Vue,Django,Spring
- description|textarea|项目描述
\`\`\`

---------- 3. confirm（确认对话框）----------
用途：让用户对某个操作做出"确认"或"取消"的决定，适合危险操作、二次确认。
字段：
  message: 提示信息（显示在对话框中）
  confirmText: 确认按钮文字（默认"确认"）
  cancelText: 取消按钮文字（默认"取消"）
用户操作：点击确认→发送"用户确认了操作"；点击取消→发送"用户取消了操作"

示例：
\`\`\`dse
type: confirm
label: 危险操作确认
message: 即将删除所有未保存的修改并重置到上一个稳定版本，此操作不可撤销。
confirmText: 确认重置
cancelText: 我再想想
\`\`\`

---------- 4. slider（滑块调节）----------
用途：让用户通过拖动滑块选择一个数值参数，适合温度、阈值、比例等连续数值。
字段：
  min: 最小值（默认 0）
  max: 最大值（默认 100）
  step: 步长（默认 1）
  value: 初始值（默认取 min 和 max 的中间值）
用户操作：拖动滑块后点击提交，结果格式为 "参数值: 数值"
面板会同时显示当前值和范围的实时数据卡片。

示例：
\`\`\`dse
type: slider
label: 调整 AI 生成参数
min: 0
max: 2
step: 0.1
value: 0.7
\`\`\`

---------- 5. table（数据表格）----------
用途：以表格形式展示结构化数据，支持点击行选择、状态标签高亮、按状态筛选。
字段：
  columns: 列头声明区（用 - 列出每列名称）
  rows: 数据行区（用 - 列出每行，列之间用 | 分隔）
特殊功能：
  - 单元格内容为"正常/normal/ok"时自动显示为绿色标签
  - 单元格内容为"警告/warning/warn"时自动显示为黄色标签
  - 单元格内容为"异常/error/错误"时自动显示为红色标签
  - 如果数据行有多列，自动生成按第二列值筛选的 tab 栏
用户操作：点击某行→发送 "用户选择了: 列1 | 列2 | ..."

示例：
\`\`\`dse
type: table
label: 系统服务状态一览
columns:
- 服务名称
- 状态
- 响应时间
rows:
- API 网关|正常|45ms
- 数据库主节点|正常|12ms
- 缓存服务|警告|230ms
- 消息队列|异常|超时
- 搜索引擎|正常|67ms
\`\`\`

---------- 6. buttons（快捷按钮组）----------
用途：提供若干快捷操作按钮供用户一键触发，适合下一步选择、快速回复、功能菜单。
列表项：直接用 - 列出每个按钮文字（也可用 options: 区声明）
按钮会自动交替使用不同样式（主色、成功、次要、边框）以区分。
用户操作：点击按钮→发送 "用户点击了: 按钮文字"

示例：
\`\`\`dse
type: buttons
label: 你想让我接下来做什么？
- 继续深入分析
- 换一个角度看
- 给我总结要点
- 写成文档
\`\`\`

---------- 7. text（可编辑文本框）----------
用途：展示一段可编辑的文本，用户可以修改后复制或提交，适合代码片段、提示词、配置文件。
字段：
  value: 预填充的文本内容
用户操作：编辑文本后可点击"复制文本"复制到剪贴板，或点击"恢复原文"重置。

示例：
\`\`\`dse
type: text
label: System Prompt 草稿
value: 你是一位专业的技术文档写作专家。请用清晰简洁的语言，按照：概述→核心概念→使用示例→注意事项的结构来组织内容。
\`\`\`


---------- 8. chart（交互式图表）----------
用途：以柱状图或折线图展示数据趋势，支持在两种图表类型间实时切换，自动计算统计摘要（最大值、最小值、平均值）。
字段：
  chartType: 默认图表类型，可选 bar（柱状图，默认）或 line（折线图）
  rows: 数据行区（用 - 列出每行，格式为：标签|数值，用 | 分隔）
特殊功能：
  - 顶部有柱状图/折线图切换按钮，用户可自由切换
  - 自动在每个数据点上方标注数值
  - 底部自动显示最大值、最小值、平均值统计卡片
  - 柱状图带圆角，折线图带面积填充和数据点圆点
  - Y 轴自动适配数据范围并显示刻度
用户操作：纯展示组件，无提交操作，用户可切换图表类型浏览数据。

示例：
\`\`\`dse
type: chart
label: 本周访问量统计
chartType: bar
rows:
- 周一|1200
- 周二|1800
- 周三|1450
- 周四|2300
- 周五|1950
- 周六|800
- 周日|650
\`\`\`


---------- 9. structure（可点击结构图）----------
用途：以可点击的模块列表展示系统架构、流程步骤等层级结构，点击不同模块右侧显示该模块的详细说明。
字段：
  nodes: 模块声明区（用 - 列出每个模块）
模块格式：- 模块名|描述|补充说明
  第1段为模块名称（必填），第2段为描述文字，第3段为额外说明（如输出、职责等）
  模块之间自动显示箭头表示流向
用户操作：纯展示组件，点击左侧模块切换右侧详情面板。

示例：
\`\`\`dse
type: structure
label: Agent 系统架构
nodes:
- 输入层|接收图像、用户指令、传感器数据等多种输入|输出：统一格式的原始事件
- 感知层|提取目标、位置、环境状态，并估计识别置信度|输出：结构化观测结果
- 决策层|结合当前状态、目标和历史信息，选择下一步动作|输出：动作意图与执行约束
- 执行层|将动作意图转换成具体操作，并检查执行结果|输出：动作反馈与新状态
\`\`\`

===== 使用建议 =====
1. 在合适的场景自然使用，不要每句话都加组件
2. 当你需要用户做选择时→用 buttons 或 checklist
3. 当你需要收集信息时→用 form
4. 当你需要用户确认时→用 confirm
5. 当你展示参数让用户调整时→用 slider
6. 当你展示结构化数据让用户选择时→用 table
7. 当你生成了可编辑的文本片段时→用 text
8. 当你展示数据趋势或对比时→用 chart
9. 当你展示系统架构、流程或层级结构时→用 structure
10. 可以在一条回复中使用多个组件，它们会各自独立渲染
11. 组件之间可以穿插普通文字说明`;

chrome.storage.local.get({
  enabled: true,
  autoPrompt: true,
  promptText: DEFAULT_PROMPT,
}, function(result) {
  toggle.checked = result.enabled;
  togglePrompt.checked = result.autoPrompt;
  promptText.value = result.promptText;
  promptSection.style.display = result.autoPrompt ? 'block' : 'none';
  updateStatus(result.enabled);
});

toggle.addEventListener('change', function() {
  var enabled = toggle.checked;
  chrome.storage.local.set({ enabled: enabled });
  updateStatus(enabled);

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE', enabled: enabled });
    }
  });
});

togglePrompt.addEventListener('change', function() {
  var autoPrompt = togglePrompt.checked;
  promptSection.style.display = autoPrompt ? 'block' : 'none';
  chrome.storage.local.set({ autoPrompt: autoPrompt });
  notifyContentScript();
});

saveBtn.addEventListener('click', function() {
  chrome.storage.local.set({ promptText: promptText.value });
  notifyContentScript();
  saveBtn.textContent = '✓ 已保存';
  setTimeout(function() { saveBtn.textContent = '保存'; }, 1200);
});

resetBtn.addEventListener('click', function() {
  promptText.value = DEFAULT_PROMPT;
  chrome.storage.local.set({ promptText: DEFAULT_PROMPT });
  notifyContentScript();
});

function notifyContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'UPDATE_PROMPT',
        autoPrompt: togglePrompt.checked,
        promptText: promptText.value,
      });
    }
  });
}

function updateStatus(enabled) {
  status.textContent = enabled ? '✅ 已启用 — 打开 DeepSeek 即可使用' : '⏸ 已暂停';
}
