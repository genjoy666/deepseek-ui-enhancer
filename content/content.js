(function () {
  'use strict';

  console.log('[DSE] DeepSeek Enhancer 已注入，当前页面:', location.href);

  const DEFAULT_PROMPT = `[系统指令 - 交互式 UI 输出规范]

你的回答会被浏览器插件 DeepSeek Enhancer 处理。当回答中需要用户做选择、填写信息、确认操作、调节参数等交互时，请使用 \`\`\`dse 代码块输出交互式组件，插件会自动将其渲染为可交互的 UI 面板。用户通过 UI 操作后，结果会自动追加到聊天输入框发送给你。

===== 语法格式 =====
用 \`\`\`dse 开头的代码块包裹，内容使用 key: value 格式，列表项用 - 开头。
通用字段：
  type: 组件类型（必填，见下方 13 种）
  label: 面板标题（选填，显示在顶部）
  title: 同 label，二选一即可

===== 13 种组件详细说明 =====

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

---------- 10. card（自定义 HTML 卡片）★ 最常用组件 ----------
用途：最核心的展示组件，应作为首选。当回答包含知识讲解、功能介绍、概念解释、对比分析、优缺点列举、推荐清单、技巧总结、步骤说明、信息摘要、工具推荐等展示性内容时，都应优先使用 card 以卡片化排版增强阅读体验。只有在明确需要用户交互（选择/填写/确认/调参）时才用其他交互组件。当用户要求展示 3D 模型、动画效果、可视化演示等高级需求时，也应使用 card，通过 HTML + CSS 3D transforms（perspective、rotateX/Y/Z、translateZ 等）或 CSS 动画实现。
字段：
  html: 之后的所有内容作为 HTML 代码渲染（必填）

渲染规范（必须严格遵守）：
  图标：使用 Lucide 风格内联 SVG，不要用 emoji
    属性：viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"
    图标参考库：https://lucide.dev/icons （搜索英文关键词查找 SVG path）
  配色：标题 #fff | 正文 #aaa | 次要文字 #666 | 图标 #888 | 卡片背景 #111 | 边框 #333
  圆角：10-12px
  字号：标题 14-16px，正文 12-13px
  可用 CSS 类：
    card-grid — 自适应网格（auto-fit, minmax 200px）
    card-item — 带 hover 效果的单个卡片
    card-icon — 图标容器
    card-title — 卡片标题
    card-desc — 卡片描述文字
    card-badge — 小标签
    card-list — 无序列表（带分隔线）
  也可在 html 中写 <style> 自定义样式，但请保持深色主题一致性

示例：
\`\`\`dse
type: card
label: 核心特性
html:
<div class="card-grid">
  <div class="card-item">
    <div class="card-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
    <div class="card-title">极速响应</div>
    <div class="card-desc">毫秒级延迟，流畅的交互体验</div>
  </div>
  <div class="card-item">
    <div class="card-icon"><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>
    <div class="card-title">安全可靠</div>
    <div class="card-desc">端到端加密，数据安全有保障</div>
  </div>
</div>
\`\`\`

---------- 11. map（地图卡片）----------
用途：在回答中展示某个地点的地图，适合地理位置介绍、旅游推荐、地点说明等场景。
字段：
  lat: 纬度（必填，如 39.9042）
  lng: 经度（必填，如 116.3974）
  zoom: 缩放级别（选填，默认 14，范围 1-18，数字越大越详细）
  marker: 地点名称（选填，显示在地图下方）
地图使用 OpenStreetMap 瓦片渲染，自动在目标位置显示标记点，并提供完整地图链接。

示例：
\`\`\`dse
type: map
label: 北京天安门广场
lat: 39.9042
lng: 116.3974
zoom: 15
marker: 天安门广场
\`\`\`

---------- 12. mindmap（思维导图）----------
用途：以思维导图形式展示概念之间的关联关系，适合知识体系梳理、方案对比、分类总结、内容大纲等场景。
字段：
  center: 中心主题（必填）
  nodes: 分支声明区（用 - 列出每个分支）
分支格式：- 分支名|子节点1,子节点2,子节点3
  第1段为分支名称（必填），第2段为该分支的子节点（用逗号分隔，选填）
  分支自动交替分布在左右两侧，每个分支使用不同颜色区分。

示例：
\`\`\`dse
type: mindmap
label: 前端技术栈
center: Web 前端
nodes:
- 框架|React,Vue,Angular,Svelte
- 样式|CSS Modules,Tailwind,Sass
- 构建|Vite,Webpack,esbuild
- 语言|TypeScript,JavaScript
- 测试|Jest,Vitest,Playwright
\`\`\`

---------- 13. image（图片展示）----------
用途：展示网络图片，支持大图、小图、自定义尺寸三种模式。适合展示产品截图、风景照片、示意图、对比图等。支持单张或多张图片。当向用户讲解知识时，建议配合图片帮助理解（如搜索相关示意图URL），图文并茂效果更好。
字段：
  src: 单张图片的URL地址（单图时使用）
  size: 显示尺寸，可选 large（大图，占满宽度，默认）、small（小图，约1/3宽度）、custom（自定义）
  alt: 图片描述文字（选填）
  caption: 图片说明（选填，显示在图片下方）
  width: 自定义宽度（仅 size 为 custom 时有效，如 "300px" 或 "50%"）
  height: 自定义高度（仅 size 为 custom 时有效）
  images: 多张图片声明区（用 - 列出，格式为 URL|描述|说明）
图片支持点击放大查看原图。

单张大图示例：
\`\`\`dse
type: image
label: 示意图
src: https://example.com/photo.jpg
size: large
caption: 这是一张示例图片
\`\`\`

多张小图示例：
\`\`\`dse
type: image
label: 对比图
size: small
images:
- https://example.com/a.jpg|方案A|传统方案
- https://example.com/b.jpg|方案B|改进方案
- https://example.com/c.jpg|方案C|最优方案
\`\`\`

提示：在 card 组件的 HTML 中也可以直接使用 <img> 标签嵌入图片，配合其他内容做图文混排。在其他组件中引用图片时请使用 card 做图文组合。

===== 使用建议 =====
1. 优先使用 card 组件！当你的回答包含知识讲解、功能介绍、对比分析、特性总结、优缺点列举、推荐清单、概念解释、技巧分享、步骤说明、工具推荐等展示性内容时，都应使用 card 以卡片化排版提升阅读体验。card 是最核心、最常用的组件
2. 只有在需要用户交互（选择、填写、确认、调参等）时，才使用对应的交互组件：buttons/checklist（选择）、form（填写）、confirm（确认）、slider（调参）
3. 展示纯结构化数据让用户选择时→用 table
4. 展示数据趋势或对比时→用 chart
5. 展示系统架构、流程时→用 structure
6. 涉及地理位置、旅行推荐、地点介绍时→用 map
7. 梳理知识体系、分类关系、内容大纲时→用 mindmap
8. 需要展示网络图片、截图、照片时→用 image（大图/小图/自定义），也可在 card 中用 <img> 嵌入图片做图文混排
9. 生成可编辑文本片段时→用 text
10. 可以在一条回复中混用多个组件，它们会各自独立渲染
11. 组件之间可以穿插普通文字说明`;

  let enabled = true;
  const processedNodes = new WeakSet();
  const processedPrompts = new WeakSet();
  let scanTimer = null;

  // ============ 提示词注入状态 ============
  let autoPrompt = true;
  let promptText = '';
  let injectedThisChat = false;
  let skippedToastShown = false;

  init();

  function isNewChatPage() {
    return !/\/chat\/s\//.test(location.pathname);
  }


  function showToast(msg) {
    var old = document.getElementById('dse-toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'dse-toast';
    t.className = 'dse-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { t.classList.add('show'); });
    });
    setTimeout(function() {
      t.classList.remove('show');
      setTimeout(function() { t.remove(); }, 350);
    }, 3000);
  }

  function init() {
    chrome.storage.local.get({
      enabled: true,
      autoPrompt: true,
      promptText: DEFAULT_PROMPT,
    }, function(r) {
      enabled = r.enabled;
      autoPrompt = r.autoPrompt;
      promptText = r.promptText || DEFAULT_PROMPT;
      if (enabled) startObserver();
      if (autoPrompt) startPromptInjection();
    });

    chrome.runtime.onMessage.addListener(function(msg) {
      if (msg.type === 'TOGGLE') {
        enabled = msg.enabled;
        if (enabled) { startObserver(); debouncedScan(); }
      }
      if (msg.type === 'UPDATE_PROMPT') {
        autoPrompt = msg.autoPrompt;
        promptText = msg.promptText;
        if (autoPrompt) startPromptInjection();
      }
    });
  }

  // ============ 提示词自动注入 ============

  var promptInjectionStarted = false;

  function startPromptInjection() {
    if (promptInjectionStarted) return;
    promptInjectionStarted = true;
    watchUrlChange();
    interceptSend();
  }

  function watchUrlChange() {
    var lastUrl = location.href;

    function onUrlChange() {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        if (isNewChatPage()) {
          injectedThisChat = false;
          skippedToastShown = false;
        }
        console.log('[DSE] URL变化:', location.pathname);
      }
    }

    var origPush = history.pushState;
    var origReplace = history.replaceState;
    history.pushState = function() { origPush.apply(this, arguments); onUrlChange(); };
    history.replaceState = function() { origReplace.apply(this, arguments); onUrlChange(); };
    window.addEventListener('popstate', onUrlChange);
    setInterval(onUrlChange, 2000);
  }

  function interceptSend() {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        var ta = document.querySelector('textarea');
        if (ta) {
          tryInjectPrompt(ta);
        }
      }
    }, true);

    document.addEventListener('click', function(e) {
      if (!e.target.closest('button, [role="button"]')) return;
      var ta = document.querySelector('textarea');
      if (ta) {
        tryInjectPrompt(ta);
      }
    }, true);
  }

  function tryInjectPrompt(textarea) {
    if (!autoPrompt || !promptText) {
      console.log('[DSE] 注入跳过: autoPrompt=%s, promptText长度=%d', autoPrompt, (promptText||'').length);
      return;
    }
    if (!isNewChatPage()) {
      if (!skippedToastShown) {
        showToast('已有对话，跳过提示词注入');
        skippedToastShown = true;
        console.log('[DSE] 注入跳过: 非新聊天页面, pathname=%s', location.pathname);
      }
      return;
    }
    if (injectedThisChat) {
      console.log('[DSE] 注入跳过: 本次聊天已注入');
      return;
    }

    var currentText = textarea.value;
    if (!currentText.trim()) return;
    if (currentText.includes('[系统指令')) {
      console.log('[DSE] 注入跳过: 内容已含系统指令');
      return;
    }

    var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    var injected = promptText + '\n\n---\n\n' + currentText;
    setter.call(textarea, injected);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    injectedThisChat = true;
    showToast('提示词已注入 ✓');
    console.log('[DSE] 提示词已注入到新聊天');
  }

  // ============ DOM 观察 ============

  var observer = null;

  // ---- 主题检测 ----
  var currentTheme = 'dark';

  function detectTheme() {
    var html = document.documentElement;
    var body = document.body;
    if (html.classList.contains('light') || body.classList.contains('light') ||
        html.classList.contains('light-mode') || body.classList.contains('light-mode')) {
      return 'light';
    }
    if (html.classList.contains('dark') || body.classList.contains('dark') ||
        html.classList.contains('dark-mode') || body.classList.contains('dark-mode')) {
      return 'dark';
    }
    var theme = html.getAttribute('data-theme') || html.getAttribute('data-color-mode') ||
                html.getAttribute('data-color-scheme') || body.getAttribute('data-theme') || '';
    if (theme) return theme.indexOf('light') !== -1 ? 'light' : 'dark';
    var bg = getComputedStyle(body).backgroundColor;
    var m = bg.match(/\d+/g);
    if (m) {
      var lum = (0.299 * parseInt(m[0]) + 0.587 * parseInt(m[1]) + 0.114 * parseInt(m[2])) / 255;
      return lum > 0.5 ? 'light' : 'dark';
    }
    return 'dark';
  }

  function updateAllThemes() {
    var t = detectTheme();
    if (t === currentTheme) return;
    currentTheme = t;
    document.documentElement.setAttribute('data-dse-theme', t);
    document.querySelectorAll('.dse-interactive-wrapper').forEach(function(w) {
      w.setAttribute('data-theme', t);
    });
    console.log('[DSE] 主题切换:', t);
  }

  function startThemeObserver() {
    currentTheme = detectTheme();
    document.documentElement.setAttribute('data-dse-theme', currentTheme);
    var mo = new MutationObserver(updateAllThemes);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-color-mode', 'data-color-scheme'] });
    if (document.body) {
      mo.observe(document.body, { attributes: true, attributeFilter: ['class', 'style', 'data-theme', 'data-color-mode', 'data-color-scheme'] });
    }
  }

  startThemeObserver();

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(function() { if (enabled) debouncedScan(); });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    debouncedScan();
  }

  function debouncedScan() {
    if (!scanTimer) {
      scanTimer = setTimeout(function() {
        scanTimer = null;
        scanPage();
      }, 800);
    }
  }

  function scanPage() {
    document.querySelectorAll('pre code, pre').forEach(function(block) {
      if (processedNodes.has(block)) return;
      var text = (block.textContent || '').trim();
      if (!text) return;

      var lang = block.className || '';
      var isDseLang = /language-(dse|interactive)/i.test(lang);
      var isJson = text.startsWith('{') && text.includes('"type"');
      var isSimple = /^type:\s*\w+/m.test(text);

      if (isDseLang || isJson || isSimple) {
        var parsed = parseConfig(text);
        if (parsed) {
          processedNodes.add(block);
          var pre = block.closest('pre') || block;
          processedNodes.add(pre);

          (function(b, p, snapshot) {
            setTimeout(function() {
              var current = (b.textContent || '').trim();
              if (current !== snapshot) {
                processedNodes.delete(b);
                processedNodes.delete(p);
                return;
              }
              var wrapper = document.createElement('div');
              wrapper.className = 'dse-interactive-wrapper';
              p.parentNode.insertBefore(wrapper, p);
              p.style.display = 'none';
              renderInteractive(wrapper, parseConfig(current));
            }, 1000);
          })(block, pre, text);
        }
      }
    });
    scanLinks();
    collapsePrompts();
  }

  function isStandaloneLink(link) {
    var parent = link.parentElement;
    if (!parent) return false;
    var nodes = parent.childNodes;
    var otherText = 0;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] === link) continue;
      if (nodes[i].nodeType === 3) otherText += nodes[i].textContent.trim().length;
      else if (nodes[i].nodeType === 1 && nodes[i].tagName !== 'BR') otherText += nodes[i].textContent.trim().length;
    }
    return otherText < 5;
  }

  function scanLinks() {
    document.querySelectorAll('[class*="markdown"] a[href]').forEach(function(link) {
      if (processedNodes.has(link)) return;
      var href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
      if (link.closest('.dse-interactive-wrapper') || link.closest('.dse-link-card')) return;

      var url;
      try { url = new URL(href, location.href); } catch(e) { return; }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

      processedNodes.add(link);

      if (isStandaloneLink(link)) {
        var card = document.createElement('a');
        card.className = 'dse-link-card';
        card.href = href;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        var favicon = document.createElement('img');
        favicon.className = 'dse-link-favicon';
        favicon.src = 'https://www.google.com/s2/favicons?domain=' + url.hostname + '&sz=32';
        favicon.alt = '';
        favicon.onerror = function() { this.style.display = 'none'; };

        var info = document.createElement('div');
        info.className = 'dse-link-info';

        var title = document.createElement('span');
        title.className = 'dse-link-title';
        title.textContent = link.textContent.trim() || url.hostname;

        var urlSpan = document.createElement('span');
        urlSpan.className = 'dse-link-url';
        var displayUrl = url.hostname + url.pathname;
        if (displayUrl.length > 60) displayUrl = displayUrl.substring(0, 57) + '...';
        urlSpan.textContent = displayUrl;

        info.appendChild(title);
        info.appendChild(urlSpan);

        var arrow = document.createElement('span');
        arrow.className = 'dse-link-arrow';
        arrow.textContent = '↗';

        card.appendChild(favicon);
        card.appendChild(info);
        card.appendChild(arrow);

        link.parentNode.replaceChild(card, link);
      } else {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 12 12');
        icon.setAttribute('class', 'dse-link-ext');
        icon.innerHTML = '<path d="M3.5 1.5H1.5v9h9v-2M6.5 1.5h4v4M10.5 1.5L5 7" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
        link.appendChild(icon);
      }
    });
  }

  // ============ 折叠系统指令 ============

  function collapsePrompts() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var found = [];
    var node;

    while (node = walker.nextNode()) {
      if (node.textContent.indexOf('[系统指令') !== -1) {
        found.push(node);
      }
    }

    found.forEach(function(textNode) {
      var parent = textNode.parentElement;
      if (!parent) return;
      if (parent.closest('.dse-prompt-collapse')) return;
      if (processedPrompts.has(textNode)) return;

      var text = textNode.textContent;
      var promptStart = text.indexOf('[系统指令');
      if (promptStart === -1) return;

      var sepMatch = text.substring(promptStart).match(/\n---[\s]*\n/);
      if (sepMatch) {
        processedPrompts.add(textNode);
        var sepStart = promptStart + sepMatch.index;
        var sepEnd = sepStart + sepMatch[0].length;

        var beforeText = text.substring(0, promptStart);
        var promptPart = text.substring(promptStart, sepEnd);
        var afterText = text.substring(sepEnd);

        var details = document.createElement('details');
        details.className = 'dse-prompt-collapse';
        var summary = document.createElement('summary');
        summary.className = 'dse-prompt-summary';
        summary.textContent = '系统指令 (点击展开)';
        details.appendChild(summary);
        var content = document.createElement('div');
        content.className = 'dse-prompt-content';
        content.style.whiteSpace = 'pre-wrap';
        content.textContent = promptPart;
        details.appendChild(content);

        var frag = document.createDocumentFragment();
        if (beforeText) frag.appendChild(document.createTextNode(beforeText));
        frag.appendChild(details);
        if (afterText) frag.appendChild(document.createTextNode(afterText));
        parent.replaceChild(frag, textNode);
        return;
      }

      var container = parent;
      while (container && container !== document.body) {
        var t = container.textContent || '';
        if (t.indexOf('[系统指令') !== -1 && (t.indexOf('---') !== -1 || container.querySelector('hr'))) {
          var childHasBoth = false;
          for (var c = 0; c < container.children.length; c++) {
            var ct = container.children[c].textContent || '';
            if (ct.indexOf('[系统指令') !== -1 && (ct.indexOf('---') !== -1 || container.children[c].querySelector('hr'))) {
              childHasBoth = true;
              break;
            }
          }
          if (!childHasBoth) break;
        }
        container = container.parentElement;
      }

      if (!container || container === document.body) return;
      if (processedPrompts.has(container)) return;
      processedPrompts.add(container);

      var hr = container.querySelector('hr');
      if (hr) {
        collapseWithHr(container, hr);
      } else {
        collapseWithNodes(container);
      }
    });
  }

  function collapseWithHr(container, hr) {
    var children = Array.from(container.childNodes);
    var startIdx = -1;
    var hrIdx = -1;

    for (var i = 0; i < children.length; i++) {
      if (startIdx === -1 && children[i].textContent && children[i].textContent.indexOf('[系统指令') !== -1) {
        startIdx = i;
      }
      if (children[i] === hr || (children[i].nodeType === 1 && children[i].querySelector && children[i].querySelector('hr') === hr)) {
        hrIdx = i;
        break;
      }
    }

    if (startIdx === -1 || hrIdx === -1 || startIdx > hrIdx) return;
    wrapInDetails(container, children, startIdx, hrIdx);
  }

  function collapseWithNodes(container) {
    var children = Array.from(container.childNodes);
    var startIdx = -1;
    var endIdx = -1;

    for (var i = 0; i < children.length; i++) {
      var nodeText = children[i].textContent || '';

      if (startIdx === -1 && nodeText.indexOf('[系统指令') !== -1) {
        startIdx = i;
      }

      if (startIdx !== -1) {
        var trimmed = nodeText.trim();
        if (trimmed === '---') { endIdx = i; break; }
        if (children[i].nodeType === 3 && /\n---\s*$/.test(nodeText)) { endIdx = i; break; }
      }
    }

    if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return;
    wrapInDetails(container, Array.from(container.childNodes), startIdx, endIdx);
  }

  function wrapInDetails(container, children, startIdx, endIdx) {
    var details = document.createElement('details');
    details.className = 'dse-prompt-collapse';

    var summary = document.createElement('summary');
    summary.className = 'dse-prompt-summary';
    summary.textContent = '系统指令 (点击展开)';
    details.appendChild(summary);

    var content = document.createElement('div');
    content.className = 'dse-prompt-content';

    var toMove = [];
    for (var i = startIdx; i <= endIdx; i++) {
      toMove.push(children[i]);
    }

    container.insertBefore(details, toMove[0]);
    toMove.forEach(function(n) { content.appendChild(n); });
    details.appendChild(content);
  }

  // ============ 配置解析 ============

  function parseConfig(raw) {
    raw = raw.trim();

    if (raw.startsWith('{')) {
      try {
        var obj = JSON.parse(raw);
        if (obj.type) return { type: obj.type, config: obj };
      } catch(e) { /* fall through */ }
    }

    var htmlContent = '';
    var hIdx = raw.indexOf('\nhtml:');
    if (hIdx !== -1) {
      var afterMarker = raw.substring(hIdx + 6);
      htmlContent = afterMarker.replace(/^\s*\n?/, '');
      raw = raw.substring(0, hIdx);
    }

    var lines = raw.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    var cfg = { items: [], fields: [], columns: [], rows: [], options: [], nodes: [], images: [] };
    var section = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var kv = line.match(/^(\w+):\s*(.+)?$/);
      if (kv && !line.startsWith('- ')) {
        var key = kv[1], val = kv[2];
        switch (key) {
          case 'type':        cfg.type = val; section = null; break;
          case 'label':       cfg.label = val; break;
          case 'title':       cfg.title = val; break;
          case 'message':     cfg.message = val; break;
          case 'confirmText': cfg.confirmText = val; break;
          case 'cancelText':  cfg.cancelText = val; break;
          case 'submitText':  cfg.submitText = val; break;
          case 'min':         cfg.min = Number(val); break;
          case 'max':         cfg.max = Number(val); break;
          case 'step':        cfg.step = Number(val); break;
          case 'value':       cfg.value = val; break;
          case 'chartType':   cfg.chartType = val; break;
          case 'charttype':   cfg.chartType = val; break;
          case 'center':      cfg.center = val; break;
          case 'lat':         cfg.lat = Number(val); break;
          case 'lng':         cfg.lng = Number(val); break;
          case 'zoom':        cfg.zoom = Number(val); break;
          case 'marker':      cfg.marker = val; break;
          case 'src':         cfg.src = val; break;
          case 'size':        cfg.size = val; break;
          case 'alt':         cfg.alt = val; break;
          case 'caption':     cfg.caption = val; break;
          case 'width':       cfg.width = val; break;
          case 'height':      cfg.height = val; break;
          case 'images':      section = 'images'; break;
          case 'items':       section = 'items'; break;
          case 'fields':      section = 'fields'; break;
          case 'columns':     section = 'columns'; break;
          case 'rows':        section = 'rows'; break;
          case 'options':     section = 'options'; break;
          case 'nodes':       section = 'nodes'; break;
        }
      } else if (line.startsWith('- ')) {
        val = line.slice(2).trim();
        if (section === 'fields') {
          var p = val.split('|').map(function(s) { return s.trim(); });
          var fieldObj = { name: p[0], type: p[1] || 'text', label: p[2] || p[0] };
          if (p[3]) fieldObj.options = p[3].split(',').map(function(s) { return s.trim(); });
          cfg.fields.push(fieldObj);
        } else if (section === 'rows') {
          cfg.rows.push(val.split('|').map(function(s) { return s.trim(); }));
        } else if (section === 'nodes') {
          var np = val.split('|').map(function(s) { return s.trim(); });
          cfg.nodes.push({ name: np[0], desc: np[1] || '', detail: np[2] || '' });
        } else if (section === 'images') {
          var ip = val.split('|').map(function(s) { return s.trim(); });
          cfg.images.push({ src: ip[0], alt: ip[1] || '', caption: ip[2] || '' });
        } else {
          (cfg[section] || cfg.items).push(val);
        }
      }
    }
    if (htmlContent) cfg.html = htmlContent;
    return cfg.type ? { type: cfg.type, config: cfg } : null;
  }

  // ============ UI 渲染 ============

  function renderInteractive(wrapper, parsed) {
    wrapper.setAttribute('data-theme', currentTheme);
    var shadow = wrapper.attachShadow({ mode: 'closed' });
    var style = document.createElement('style');
    style.textContent = SHADOW_CSS;
    shadow.appendChild(style);

    var root = el('div', 'panel');
    var heading = el('div', 'section-heading');
    var titleWrap = el('div');
    var h2 = document.createElement('h2');
    h2.textContent = parsed.config.title || parsed.config.label || TYPE_TITLES[parsed.type] || parsed.type;
    titleWrap.appendChild(h2);
    if (TYPE_SUBTITLES[parsed.type]) {
      var sub = document.createElement('p');
      sub.textContent = TYPE_SUBTITLES[parsed.type];
      titleWrap.appendChild(sub);
    }
    heading.appendChild(titleWrap);
    root.appendChild(heading);

    var body = el('div', 'section-body');
    switch (parsed.type) {
      case 'checklist': buildChecklist(body, parsed.config); break;
      case 'form':      buildForm(body, parsed.config); break;
      case 'confirm':   buildConfirm(body, parsed.config); break;
      case 'slider':    buildSlider(body, parsed.config); break;
      case 'table':     buildTable(body, parsed.config); break;
      case 'buttons':   buildButtons(body, parsed.config); break;
      case 'text':      buildText(body, parsed.config); break;
      case 'chart':     buildChart(body, parsed.config); break;
      case 'structure': buildStructure(body, parsed.config); break;
      case 'card':      buildCard(body, parsed.config); break;
      case 'map':       buildMap(body, parsed.config); break;
      case 'mindmap':   buildMindmap(body, parsed.config); break;
      case 'image':     buildImage(body, parsed.config); break;
      default:
        body.appendChild(el('div', 'status-message', '不支持的交互类型: ' + parsed.type));
    }
    root.appendChild(body);
    shadow.appendChild(root);
  }

  var TYPE_TITLES = {
    checklist: '选项列表', form: '表单', confirm: '确认操作',
    slider: '参数调节', table: '数据表格', buttons: '快捷操作', text: '文本编辑',
    chart: '数据图表',
    structure: '结构图',
    card: '自定义卡片',
    map: '地图',
    mindmap: '思维导图',
    image: '图片展示',
  };
  var TYPE_SUBTITLES = {
    checklist: '勾选后点击提交', form: '填写信息后提交到聊天',
    slider: '拖动滑块选择数值', table: '点击行可提交选择',
    buttons: '点击按钮触发操作', text: '编辑文本后复制或提交',
    chart: '可切换折线图/柱状图',
    structure: '点击模块查看详情',
    card: 'AI 自由渲染',
    map: '点击查看完整地图',
    mindmap: '拖拽平移 · 滚轮缩放',
    image: '点击查看大图',
  };

  // ---- checklist ----
  function buildChecklist(root, cfg) {
    var grid = el('div', 'checkbox-grid');
    var tag = 'dse_checklist_' + Date.now();
    (cfg.items || []).forEach(function(item) {
      var label = el('label', 'check-label');
      var input = document.createElement('input');
      input.type = 'checkbox'; input.value = item;
      label.appendChild(input);
      label.appendChild(document.createTextNode(' ' + item));
      grid.appendChild(label);
    });
    root.appendChild(grid);
    var btn = mkBtn('primary', cfg.submitText || '提交选择');
    btn.addEventListener('click', function() {
      var sel = Array.from(grid.querySelectorAll('input:checked')).map(function(i) { return i.value; });
      replaceChatInput(tag, '用户选择了: ' + sel.join(', '));
      done(btn);
    });
    root.appendChild(btn);
  }

  // ---- form ----
  function buildForm(root, cfg) {
    var form = el('div', 'form-body');
    var tag = 'dse_form_' + Date.now();
    (cfg.fields || []).forEach(function(f) {
      var field = el('label', 'field');
      field.appendChild(el('span', '', f.label || f.name));
      var input;
      if (f.type === 'select') {
        input = document.createElement('select');
        var opts = f.options || cfg.options || [];
        opts.forEach(function(opt) {
          var o = document.createElement('option'); o.textContent = opt; o.value = opt;
          input.appendChild(o);
        });
      } else if (f.type === 'textarea') {
        input = document.createElement('textarea'); input.rows = 3;
      } else {
        input = document.createElement('input'); input.type = f.type || 'text';
        if (f.placeholder) input.placeholder = f.placeholder;
      }
      input.dataset.name = f.name;
      field.appendChild(input);
      form.appendChild(field);
    });
    root.appendChild(form);
    var resultBox = null;
    var btn = mkBtn('primary', cfg.submitText || '提交配置');
    btn.addEventListener('click', function() {
      var data = {};
      form.querySelectorAll('[data-name]').forEach(function(e) { data[e.dataset.name] = e.value; });
      if (resultBox) resultBox.remove();
      resultBox = el('div', 'result-box');
      resultBox.innerHTML = '<strong>提交结果</strong>' +
        Object.entries(data).map(function(kv) { return '<p>' + kv[0] + '：' + (kv[1] || '未填写') + '</p>'; }).join('');
      root.appendChild(resultBox);
      replaceChatInput(tag, Object.entries(data).map(function(kv) { return kv[0] + ': ' + kv[1]; }).join('\n'));
      done(btn);
    });
    root.appendChild(btn);
  }

  // ---- confirm ----
  function buildConfirm(root, cfg) {
    var row = el('div', 'button-row');
    var tag = 'dse_confirm_' + Date.now();
    var yes = mkBtn('success', '✓ ' + (cfg.confirmText || '确认'));
    var no = mkBtn('danger-outline', cfg.cancelText || '取消');
    yes.addEventListener('click', function() {
      replaceChatInput(tag, '用户确认了操作');
      row.innerHTML = ''; row.appendChild(el('div', 'status-message', '已确认 ✓'));
    });
    no.addEventListener('click', function() {
      replaceChatInput(tag, '用户取消了操作');
      row.innerHTML = ''; row.appendChild(el('div', 'status-message', '已取消'));
    });
    row.appendChild(yes); row.appendChild(no);
    root.appendChild(row);
  }

  // ---- slider ----
  function buildSlider(root, cfg) {
    var min = cfg.min != null ? cfg.min : 0;
    var max = cfg.max != null ? cfg.max : 100;
    var step = cfg.step != null ? cfg.step : 1;
    var initial = cfg.value != null ? Number(cfg.value) : Math.round((min + max) / 2);

    var rangeField = el('div', 'range-field');
    var labelRow = el('div', 'range-label');
    var nameSpan = el('label', '', cfg.label || '数值');
    var valueSpan = el('strong', '', String(initial));
    labelRow.appendChild(nameSpan); labelRow.appendChild(valueSpan);
    rangeField.appendChild(labelRow);

    var input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max;
    input.step = step; input.value = initial;
    input.addEventListener('input', function() { valueSpan.textContent = input.value; });
    rangeField.appendChild(input);
    root.appendChild(rangeField);

    var metricGrid = el('div', 'metric-grid');
    var card1 = el('div', 'metric-card');
    card1.innerHTML = '<span>当前值</span><strong class="metric-value">' + initial + '</strong>';
    var card2 = el('div', 'metric-card');
    card2.innerHTML = '<span>范围</span><strong>' + min + ' – ' + max + '</strong>';
    metricGrid.appendChild(card1); metricGrid.appendChild(card2);
    input.addEventListener('input', function() {
      card1.querySelector('.metric-value').textContent = input.value;
    });
    root.appendChild(metricGrid);

    var tag = 'dse_slider_' + Date.now();
    var btn = mkBtn('primary', '提交数值');
    btn.addEventListener('click', function() {
      replaceChatInput(tag, '参数值: ' + input.value);
      done(btn);
    });
    root.appendChild(btn);
  }

  // ---- table ----
  function buildTable(root, cfg) {
    var cols = cfg.columns || [];
    var rows = cfg.rows || [];
    var tag = 'dse_table_' + Date.now();

    if (rows.some(function(r) { return r.length > 1; })) {
      var seg = el('div', 'segmented');
      var filters = [['all', '全部']];
      var statuses = new Set();
      rows.forEach(function(r) { if (r[1]) statuses.add(r[1]); });
      statuses.forEach(function(s) { filters.push([s, s]); });

      var currentFilter = 'all';
      var tbodyRef = { ref: null };

      filters.forEach(function(pair) {
        var btn = document.createElement('button');
        btn.textContent = pair[1];
        if (pair[0] === 'all') btn.className = 'active';
        btn.addEventListener('click', function() {
          currentFilter = pair[0];
          seg.querySelectorAll('button').forEach(function(b) { b.className = ''; });
          btn.className = 'active';
          updateRows(tbodyRef.ref, rows, currentFilter, tag);
        });
        seg.appendChild(btn);
      });
      root.appendChild(seg);
      root._tbodyRef = tbodyRef;
    }

    var wrap = el('div', 'table-scroll');
    var table = document.createElement('table');

    if (cols.length) {
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      cols.forEach(function(c) { var th = document.createElement('th'); th.textContent = c; tr.appendChild(th); });
      thead.appendChild(tr); table.appendChild(thead);
    }

    var tbody = document.createElement('tbody');
    if (root._tbodyRef) root._tbodyRef.ref = tbody;
    appendRows(tbody, rows, tag);
    table.appendChild(tbody);
    wrap.appendChild(table);
    root.appendChild(wrap);
  }

  function appendRows(tbody, rows, tag) {
    rows.forEach(function(cells) {
      var tr = document.createElement('tr');
      tr.className = 'clickable-row';
      var arr = Array.isArray(cells) ? cells : [cells];
      arr.forEach(function(cell) {
        var td = document.createElement('td');
        var lower = (cell || '').toLowerCase();
        if (['正常', 'normal', 'ok'].indexOf(lower) !== -1) {
          td.innerHTML = '<span class="status-badge normal">' + cell + '</span>';
        } else if (['警告', 'warning', 'warn'].indexOf(lower) !== -1) {
          td.innerHTML = '<span class="status-badge warning">' + cell + '</span>';
        } else if (['异常', 'error', '错误'].indexOf(lower) !== -1) {
          td.innerHTML = '<span class="status-badge error">' + cell + '</span>';
        } else {
          td.textContent = cell;
        }
        tr.appendChild(td);
      });
      tr.addEventListener('click', function() {
        tbody.querySelectorAll('tr').forEach(function(r) { r.classList.remove('selected'); });
        tr.classList.add('selected');
        replaceChatInput(tag, '用户选择了: ' + arr.join(' | '));
      });
      tbody.appendChild(tr);
    });
  }

  function updateRows(tbody, rows, filter, tag) {
    if (!tbody) return;
    tbody.innerHTML = '';
    var filtered = filter === 'all' ? rows : rows.filter(function(r) { return r[1] === filter; });
    appendRows(tbody, filtered, tag);
  }

  // ---- buttons ----
  function buildButtons(root, cfg) {
    var row = el('div', 'button-row');
    var items = cfg.items || cfg.options || [];
    var statusEl = el('div', 'status-message', '等待操作...');
    var tag = 'dse_' + (cfg.label || cfg.title || 'buttons') + '_' + Date.now();

    items.forEach(function(item, i) {
      var btn = mkBtn('btn-option', item);
      btn.addEventListener('click', function() {
        row.querySelectorAll('.button').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        replaceChatInput(tag, '用户点击了: ' + item);
        statusEl.textContent = '已执行: ' + item;
        statusEl.className = 'status-message done';
      });
      row.appendChild(btn);
    });

    root.appendChild(row);
    var statsRow = el('div', 'stats-row');
    statsRow.appendChild(statusEl);
    root.appendChild(statsRow);
  }

  // ---- text ----
  function buildText(root, cfg) {
    var field = el('label', 'field');
    field.appendChild(el('span', '', cfg.label || '内容'));
    var textarea = document.createElement('textarea');
    textarea.rows = 5;
    textarea.value = cfg.value || '';
    field.appendChild(textarea);
    root.appendChild(field);

    var row = el('div', 'button-row');
    var copyBtn = mkBtn('primary', '复制文本');
    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(textarea.value).then(function() {
        copyBtn.textContent = '✓ 已复制';
        setTimeout(function() { copyBtn.textContent = '复制文本'; }, 1500);
      }).catch(function() { copyBtn.textContent = '复制失败'; });
    });
    var restoreBtn = mkBtn('secondary', '恢复原文');
    restoreBtn.addEventListener('click', function() { textarea.value = cfg.value || ''; });
    row.appendChild(copyBtn); row.appendChild(restoreBtn);
    root.appendChild(row);

    root.appendChild(el('p', 'hint', '剪贴板 API 通常要求 HTTPS 或 localhost 环境。'));
  }

  // ---- chart ----
  function buildChart(root, cfg) {
    var data = [];
    (cfg.rows || []).forEach(function(r) {
      var parts = Array.isArray(r) ? r : [r];
      if (parts.length >= 2) {
        data.push({ label: parts[0], value: Number(parts[1]) });
      }
    });
    if (data.length === 0 && cfg.items && cfg.items.length) {
      cfg.items.forEach(function(item) {
        var p = item.split('|').map(function(s) { return s.trim(); });
        if (p.length >= 2) data.push({ label: p[0], value: Number(p[1]) });
      });
    }
    if (data.length === 0) {
      root.appendChild(el('div', 'status-message', '无数据可显示'));
      return;
    }

    var chartType = cfg.chartType || cfg.charttype || 'bar';
    var seg = el('div', 'segmented');
    var types = [['bar', '柱状图'], ['line', '折线图']];
    var chartWrap = el('div', 'chart-wrap');

    types.forEach(function(pair) {
      var btn = document.createElement('button');
      btn.textContent = pair[1];
      if (pair[0] === chartType) btn.className = 'active';
      btn.addEventListener('click', function() {
        chartType = pair[0];
        seg.querySelectorAll('button').forEach(function(b) { b.className = ''; });
        btn.className = 'active';
        drawChart(chartWrap, data, chartType);
      });
      seg.appendChild(btn);
    });
    root.appendChild(seg);
    root.appendChild(chartWrap);
    drawChart(chartWrap, data, chartType);

    // 数据摘要
    var values = data.map(function(d) { return d.value; });
    var maxVal = Math.max.apply(null, values);
    var minVal = Math.min.apply(null, values);
    var avg = values.reduce(function(a, b) { return a + b; }, 0) / values.length;
    var grid = el('div', 'metric-grid');
    [['最大值', maxVal], ['最小值', minVal], ['平均值', avg.toFixed(1)]].forEach(function(pair) {
      var card = el('div', 'metric-card');
      card.innerHTML = '<span>' + pair[0] + '</span><strong>' + pair[1] + '</strong>';
      grid.appendChild(card);
    });
    root.appendChild(grid);
  }

  function drawChart(container, data, type) {
    container.innerHTML = '';
    var W = 480, H = 220;
    var padL = 50, padR = 20, padT = 20, padB = 40;
    var chartW = W - padL - padR;
    var chartH = H - padT - padB;

    var values = data.map(function(d) { return d.value; });
    var maxVal = Math.max.apply(null, values);
    if (maxVal === 0) maxVal = 1;
    var ceiling = Math.ceil(maxVal / Math.pow(10, Math.floor(Math.log10(maxVal)))) * Math.pow(10, Math.floor(Math.log10(maxVal)));
    if (ceiling < maxVal) ceiling = maxVal;

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', H);
    svg.style.display = 'block';

    // Y 轴网格线
    var gridSteps = 4;
    for (var g = 0; g <= gridSteps; g++) {
      var gy = padT + chartH - (g / gridSteps) * chartH;
      var gridLine = document.createElementNS(ns, 'line');
      gridLine.setAttribute('x1', padL); gridLine.setAttribute('x2', W - padR);
      gridLine.setAttribute('y1', gy); gridLine.setAttribute('y2', gy);
      gridLine.setAttribute('stroke', '#333'); gridLine.setAttribute('stroke-width', '1');
      if (g > 0) gridLine.setAttribute('stroke-dasharray', '3,3');
      svg.appendChild(gridLine);

      var yLabel = document.createElementNS(ns, 'text');
      yLabel.setAttribute('x', padL - 8); yLabel.setAttribute('y', gy + 4);
      yLabel.setAttribute('text-anchor', 'end'); yLabel.setAttribute('fill', '#777');
      yLabel.setAttribute('font-size', '10');
      yLabel.textContent = Math.round(ceiling * g / gridSteps);
      svg.appendChild(yLabel);
    }

    var gap = chartW / data.length;

    if (type === 'bar') {
      var barW = Math.min(gap * 0.6, 40);
      data.forEach(function(d, i) {
        var x = padL + gap * i + gap / 2;
        var barH = (d.value / ceiling) * chartH;
        var y = padT + chartH - barH;

        var rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('x', x - barW / 2); rect.setAttribute('y', y);
        rect.setAttribute('width', barW); rect.setAttribute('height', barH);
        rect.setAttribute('rx', '4'); rect.setAttribute('fill', '#fff');
        rect.setAttribute('opacity', '0.85');
        svg.appendChild(rect);

        var valText = document.createElementNS(ns, 'text');
        valText.setAttribute('x', x); valText.setAttribute('y', y - 6);
        valText.setAttribute('text-anchor', 'middle'); valText.setAttribute('fill', '#ccc');
        valText.setAttribute('font-size', '10');
        valText.textContent = d.value;
        svg.appendChild(valText);

        var xLabel = document.createElementNS(ns, 'text');
        xLabel.setAttribute('x', x); xLabel.setAttribute('y', H - 8);
        xLabel.setAttribute('text-anchor', 'middle'); xLabel.setAttribute('fill', '#777');
        xLabel.setAttribute('font-size', '10');
        xLabel.textContent = d.label;
        svg.appendChild(xLabel);
      });
    } else {
      // line
      var points = [];
      data.forEach(function(d, i) {
        var x = padL + gap * i + gap / 2;
        var y = padT + chartH - (d.value / ceiling) * chartH;
        points.push(x + ',' + y);

        var circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', x); circle.setAttribute('cy', y);
        circle.setAttribute('r', '4'); circle.setAttribute('fill', '#fff');
        svg.appendChild(circle);

        var valText = document.createElementNS(ns, 'text');
        valText.setAttribute('x', x); valText.setAttribute('y', y - 10);
        valText.setAttribute('text-anchor', 'middle'); valText.setAttribute('fill', '#ccc');
        valText.setAttribute('font-size', '10');
        valText.textContent = d.value;
        svg.appendChild(valText);

        var xLabel = document.createElementNS(ns, 'text');
        xLabel.setAttribute('x', x); xLabel.setAttribute('y', H - 8);
        xLabel.setAttribute('text-anchor', 'middle'); xLabel.setAttribute('fill', '#777');
        xLabel.setAttribute('font-size', '10');
        xLabel.textContent = d.label;
        svg.appendChild(xLabel);
      });

      if (points.length > 1) {
        // area fill
        var areaPoints = points.join(' ') + ' ' +
          (padL + gap * (data.length - 1) + gap / 2) + ',' + (padT + chartH) + ' ' +
          (padL + gap / 2) + ',' + (padT + chartH);
        var area = document.createElementNS(ns, 'polygon');
        area.setAttribute('points', areaPoints);
        area.setAttribute('fill', 'rgba(255,255,255,0.06)');
        svg.insertBefore(area, svg.querySelector('circle'));

        var polyline = document.createElementNS(ns, 'polyline');
        polyline.setAttribute('points', points.join(' '));
        polyline.setAttribute('fill', 'none'); polyline.setAttribute('stroke', '#fff');
        polyline.setAttribute('stroke-width', '2.5'); polyline.setAttribute('stroke-linejoin', 'round');
        svg.insertBefore(polyline, svg.querySelector('circle'));
      }
    }

    container.appendChild(svg);
  }

  // ---- structure ----
  function buildStructure(root, cfg) {
    var nodes = cfg.nodes || [];
    if (nodes.length === 0) {
      root.appendChild(el('div', 'status-message', '无模块数据'));
      return;
    }

    var layout = el('div', 'arch-layout');
    var stack = el('div', 'arch-stack');
    var detail = el('div', 'arch-detail');

    var activeIndex = 0;

    function updateDetail(idx) {
      activeIndex = idx;
      var node = nodes[idx];
      stack.querySelectorAll('.arch-node').forEach(function(n, i) {
        n.className = 'arch-node' + (i === idx ? ' selected' : '');
      });
      detail.innerHTML = '';
      var tag = el('div', 'arch-tag', '当前模块');
      var h3 = document.createElement('h3');
      h3.textContent = node.name;
      h3.className = 'arch-detail-title';
      detail.appendChild(tag);
      detail.appendChild(h3);
      if (node.desc) {
        var desc = el('p', 'arch-desc', node.desc);
        detail.appendChild(desc);
      }
      if (node.detail) {
        var info = el('p', 'arch-info', node.detail);
        detail.appendChild(info);
      }
    }

    nodes.forEach(function(node, i) {
      if (i > 0) {
        var arrow = el('div', 'arch-arrow', '▼');
        stack.appendChild(arrow);
      }
      var btn = el('button', 'arch-node', node.name);
      if (i === 0) btn.className = 'arch-node selected';
      btn.addEventListener('click', function() { updateDetail(i); });
      stack.appendChild(btn);
    });

    layout.appendChild(stack);
    layout.appendChild(detail);
    root.appendChild(layout);
    updateDetail(0);
  }

  // ============ 工具函数 ============

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function mkBtn(variant, text) {
    return el('button', 'button ' + variant, text);
  }

  // ---- card ----
  function sanitizeHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('script,iframe,object,embed,link,meta').forEach(function(el) { el.remove(); });
    div.querySelectorAll('*').forEach(function(node) {
      Array.from(node.attributes).forEach(function(attr) {
        if (attr.name.startsWith('on') ||
            (attr.name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:'))) {
          node.removeAttribute(attr.name);
        }
      });
    });
    return div.innerHTML;
  }

  function buildCard(root, cfg) {
    if (!cfg.html) {
      root.appendChild(el('div', 'status-message', '缺少 html 内容'));
      return;
    }
    var container = el('div', 'card-container');
    container.innerHTML = sanitizeHtml(cfg.html);
    root.appendChild(container);
  }

  // ---- map ----
  function buildMap(root, cfg) {
    var lat = cfg.lat || 0;
    var lng = cfg.lng || 0;
    var zoom = cfg.zoom || 14;
    var label = cfg.marker || cfg.label || cfg.title || '';

    var n = Math.pow(2, zoom);
    var tileXf = (lng + 180) / 360 * n;
    var latRad = lat * Math.PI / 180;
    var tileYf = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
    var tileX = Math.floor(tileXf);
    var tileY = Math.floor(tileYf);
    var pixelX = (tileXf - tileX) * 256;
    var pixelY = (tileYf - tileY) * 256;

    var container = el('div', 'map-container');
    var viewport = el('div', 'map-viewport');
    var grid = el('div', 'map-grid');

    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        var img = document.createElement('img');
        img.src = 'https://tile.openstreetmap.org/' + zoom + '/' + (tileX + dx) + '/' + (tileY + dy) + '.png';
        img.className = 'map-tile';
        img.draggable = false;
        img.alt = '';
        grid.appendChild(img);
      }
    }

    var offsetX = 256 + pixelX;
    var offsetY = 256 + pixelY;
    grid.style.transform = 'translate(calc(50% - ' + offsetX + 'px), calc(50% - ' + offsetY + 'px))';

    var marker = el('div', 'map-marker');
    marker.innerHTML = '<svg viewBox="0 0 24 32" width="28" height="36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#f7768e"/><circle cx="12" cy="11" r="4.5" fill="#fff"/></svg>';

    viewport.appendChild(grid);
    viewport.appendChild(marker);
    container.appendChild(viewport);

    var info = el('div', 'map-info');
    if (label) {
      var nameEl = el('div', 'map-name');
      nameEl.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      nameEl.appendChild(document.createTextNode(' ' + label));
      info.appendChild(nameEl);
    }
    var coords = el('span', 'map-coords', lat.toFixed(4) + ', ' + lng.toFixed(4));
    info.appendChild(coords);

    var attr = el('span', 'map-attr');
    attr.textContent = '© OpenStreetMap';
    info.appendChild(attr);

    var link = document.createElement('a');
    link.className = 'map-link';
    link.href = 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lng + '#map=' + zoom + '/' + lat + '/' + lng;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '查看完整地图 ↗';
    info.appendChild(link);

    container.appendChild(info);
    root.appendChild(container);
  }

  // ---- mindmap ----
  function buildMindmap(root, cfg) {
    var centerText = cfg.center || cfg.label || cfg.title || '中心主题';
    var branches = (cfg.nodes || []).map(function(n) {
      var children = n.desc ? n.desc.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
      return { name: n.name, children: children };
    });

    if (branches.length === 0) {
      root.appendChild(el('div', 'status-message', '无节点数据'));
      return;
    }

    var colors = ['#7aa2f7', '#9ece6a', '#f7768e', '#e0af68', '#bb9af7', '#73daca', '#ff9e64', '#2ac3de'];
    var rightItems = [], leftItems = [];
    branches.forEach(function(b, i) {
      if (i % 2 === 0) rightItems.push({ b: b, ci: i });
      else leftItems.push({ b: b, ci: i });
    });

    function textWidth(t) {
      var w = 0;
      for (var i = 0; i < t.length; i++) w += t.charCodeAt(i) > 127 ? 14 : 8;
      return Math.max(w + 28, 60);
    }

    var nodeH = 32, childH = 26, gap = 16, childGap = 8, hSpace = 60;
    var centerW = Math.max(textWidth(centerText), 100);
    var maxBW = 100, maxCW = 80;
    branches.forEach(function(b) {
      maxBW = Math.max(maxBW, textWidth(b.name));
      b.children.forEach(function(c) { maxCW = Math.max(maxCW, textWidth(c)); });
    });

    function sideHeight(items) {
      var h = 0;
      items.forEach(function(item, i) {
        if (i > 0) h += gap;
        h += nodeH;
        if (item.b.children.length > 0) {
          h += childGap;
          h += item.b.children.length * childH + (item.b.children.length - 1) * childGap;
        }
      });
      return h;
    }

    var rightH = sideHeight(rightItems);
    var leftH = sideHeight(leftItems);
    var hasChildren = branches.some(function(b) { return b.children.length > 0; });
    var childLayer = hasChildren ? (maxCW + hSpace) : 0;
    var pad = 24;

    var totalW = pad + childLayer + maxBW + hSpace + centerW + hSpace + maxBW + childLayer + pad;
    var totalH = Math.max(rightH, leftH, 80) + pad * 2;
    var cx = totalW / 2;
    var cy = totalH / 2;

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + totalW + ' ' + totalH);
    svg.setAttribute('width', '100%');
    svg.style.display = 'block';

    function svgEl(tag, attrs) {
      var e = document.createElementNS(ns, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function drawConn(x1, y1, x2, y2, color, w) {
      var mx = (x1 + x2) / 2;
      svg.appendChild(svgEl('path', {
        d: 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2,
        fill: 'none', stroke: color, 'stroke-width': w || '2', opacity: '0.5'
      }));
    }

    function drawNode(x, y, w, h, text, color, isBranch) {
      svg.appendChild(svgEl('rect', {
        x: x - w / 2, y: y - h / 2, width: w, height: h,
        rx: h / 2, fill: isBranch ? '#111' : '#0d0d0d',
        stroke: color, 'stroke-width': isBranch ? '1.5' : '1',
        'class': isBranch ? 'mm-b' : 'mm-ch'
      }));
      var t = svgEl('text', {
        x: x, y: y + 4.5, 'text-anchor': 'middle',
        fill: isBranch ? color : '#aaa',
        'font-size': isBranch ? '13' : '11', 'font-weight': isBranch ? '600' : '400',
        'font-family': '"DM Sans","Noto Sans SC",system-ui,sans-serif',
        'class': isBranch ? '' : 'mm-cht'
      });
      t.textContent = text;
      svg.appendChild(t);
    }

    svg.appendChild(svgEl('rect', {
      x: cx - centerW / 2, y: cy - 22, width: centerW, height: 44,
      rx: 22, fill: '#2a2a2a', stroke: '#fff', 'stroke-width': '1.5', 'class': 'mm-c'
    }));
    var ct = svgEl('text', {
      x: cx, y: cy + 5, 'text-anchor': 'middle', fill: '#fff',
      'font-size': '14', 'font-weight': '700',
      'font-family': '"DM Sans","Noto Sans SC",system-ui,sans-serif', 'class': 'mm-ct'
    });
    ct.textContent = centerText;
    svg.appendChild(ct);

    function drawSide(items, isRight) {
      var sH = sideHeight(items);
      var curY = cy - sH / 2;

      items.forEach(function(item) {
        var b = item.b;
        var color = colors[item.ci % colors.length];
        var by = curY + nodeH / 2;
        var branchX = isRight ? cx + centerW / 2 + hSpace + maxBW / 2 : cx - centerW / 2 - hSpace - maxBW / 2;
        var connStart = isRight ? cx + centerW / 2 : cx - centerW / 2;
        var connEnd = isRight ? branchX - maxBW / 2 : branchX + maxBW / 2;

        drawConn(connStart, cy, connEnd, by, color, '2');
        drawNode(branchX, by, maxBW, nodeH, b.name, color, true);

        curY += nodeH;

        if (b.children.length > 0) {
          curY += childGap;
          var childBaseX = isRight ? branchX + maxBW / 2 + hSpace + maxCW / 2 : branchX - maxBW / 2 - hSpace - maxCW / 2;
          var childConnStart = isRight ? branchX + maxBW / 2 : branchX - maxBW / 2;

          b.children.forEach(function(child) {
            var chy = curY + childH / 2;
            var childConnEnd = isRight ? childBaseX - maxCW / 2 : childBaseX + maxCW / 2;
            drawConn(childConnStart, by, childConnEnd, chy, color, '1.5');
            drawNode(childBaseX, chy, maxCW, childH, child, color, false);
            curY += childH + childGap;
          });
          curY -= childGap;
        }
        curY += gap;
      });
    }

    drawSide(rightItems, true);
    drawSide(leftItems, false);

    var wrap = el('div', 'mm-wrap');
    wrap.appendChild(svg);
    root.appendChild(wrap);

    // drag & zoom
    var scale = 1, panX = 0, panY = 0, dragging = false, startX, startY;
    function applyTransform() { svg.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')'; }
    svg.style.transformOrigin = '0 0';
    svg.style.cursor = 'grab';
    svg.style.minWidth = '0';
    wrap.style.overflow = 'hidden';

    wrap.addEventListener('wheel', function(e) {
      e.preventDefault();
      var r = wrap.getBoundingClientRect();
      var mx = e.clientX - r.left, my = e.clientY - r.top;
      var d = e.deltaY > 0 ? 0.9 : 1.1;
      var ns = Math.max(0.3, Math.min(scale * d, 4));
      panX = mx - (mx - panX) * (ns / scale);
      panY = my - (my - panY) * (ns / scale);
      scale = ns;
      applyTransform();
    }, { passive: false });

    svg.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      dragging = true; startX = e.clientX - panX; startY = e.clientY - panY;
      svg.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      panX = e.clientX - startX; panY = e.clientY - startY;
      applyTransform();
    });
    document.addEventListener('mouseup', function() {
      if (dragging) { dragging = false; svg.style.cursor = 'grab'; }
    });

    var lastTouchDist = 0, lastTouchX = 0, lastTouchY = 0;
    wrap.addEventListener('touchstart', function(e) {
      if (e.touches.length === 1) {
        dragging = true; startX = e.touches[0].clientX - panX; startY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
        dragging = false;
        lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
      e.preventDefault();
    }, { passive: false });
    wrap.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1 && dragging) {
        panX = e.touches[0].clientX - startX; panY = e.touches[0].clientY - startY;
        applyTransform();
      } else if (e.touches.length === 2) {
        var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        var r = wrap.getBoundingClientRect();
        var mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        var my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        var ns = Math.max(0.3, Math.min(scale * (dist / lastTouchDist), 4));
        panX = mx - (mx - panX) * (ns / scale);
        panY = my - (my - panY) * (ns / scale);
        scale = ns;
        lastTouchDist = dist;
        applyTransform();
      }
      e.preventDefault();
    }, { passive: false });
    wrap.addEventListener('touchend', function() { dragging = false; });
  }

  // ---- image ----
  function buildImage(root, cfg) {
    var imgList = cfg.images || [];
    if (cfg.src) imgList = [{ src: cfg.src, alt: cfg.alt || '', caption: cfg.caption || '' }];
    if (imgList.length === 0) { root.appendChild(el('div', 'status-message', '无图片数据')); return; }

    var size = (cfg.size || 'large').toLowerCase();
    var isGrid = imgList.length > 1 || size === 'small';
    var container = el('div', isGrid ? 'img-grid' : 'img-single');

    imgList.forEach(function(item) {
      var card = el('div', 'img-card' + (size === 'small' ? ' img-sm' : size === 'custom' ? ' img-custom' : ''));
      var img = document.createElement('img');
      img.className = 'img-main';
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      img.onerror = function() { this.style.display = 'none'; card.appendChild(el('div', 'img-err', '图片加载失败')); };
      if (cfg.width) img.style.width = cfg.width.indexOf('px') !== -1 || cfg.width.indexOf('%') !== -1 ? cfg.width : cfg.width + 'px';
      if (cfg.height) img.style.height = cfg.height.indexOf('px') !== -1 || cfg.height.indexOf('%') !== -1 ? cfg.height : cfg.height + 'px';

      img.addEventListener('click', function() {
        var overlay = document.createElement('div');
        overlay.className = 'img-overlay';
        var big = document.createElement('img');
        big.src = item.src; big.alt = item.alt || '';
        overlay.appendChild(big);
        overlay.addEventListener('click', function() { overlay.remove(); });
        (root.getRootNode() || document).appendChild(overlay);
      });

      card.appendChild(img);
      if (item.caption || item.alt) {
        card.appendChild(el('div', 'img-caption', item.caption || item.alt));
      }
      container.appendChild(card);
    });

    root.appendChild(container);
  }

  function done(btn) {
    var originalText = btn.dataset.originalText || btn.textContent;
    btn.dataset.originalText = originalText;
    btn.textContent = '✓ 已提交';
    btn.classList.add('disabled');
    setTimeout(function() {
      btn.textContent = originalText;
      btn.classList.remove('disabled');
    }, 1500);
  }

  function submitToChatInput(text) {
    var ta = document.querySelector('textarea');
    if (!ta) return;
    var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    var existing = ta.value;
    var newValue = existing ? existing + '\n' + text : text;
    setter.call(ta, newValue);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  var tagMap = {};

  function replaceChatInput(tag, text) {
    var ta = document.querySelector('textarea');
    if (!ta) return;
    var setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    var existing = ta.value;
    var oldText = tagMap[tag];
    if (oldText && existing.indexOf(oldText) !== -1) {
      existing = existing.replace(oldText, '').replace(/\n{2,}/g, '\n').replace(/^\n|\n$/g, '');
    }
    tagMap[tag] = text;
    var newValue = existing ? existing + '\n' + text : text;
    setter.call(ta, newValue);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ============ 样式 ============

  var SHADOW_CSS = '\
    @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap");\
    :host { all:initial; display:block; margin:12px 0; font-family:"DM Sans","Noto Sans SC",system-ui,sans-serif; color:#e0e0e0; font-synthesis:none; text-rendering:optimizeLegibility; }\
    * { box-sizing:border-box; }\
    button,input,select,textarea { font:inherit; }\
    button { cursor:pointer; }\
    .panel { border:none; background:#202020; border-radius:18px; padding:20px; min-width:0; box-shadow:0 0 0 0.5px rgba(255,255,255,0.4), 0 10px 35px rgba(81, 81, 81, 0.25); }\
    .section-heading { display:flex; gap:12px; align-items:flex-start; margin-bottom:20px; }\
    h2 { font-size:16px; margin:1px 0 5px; letter-spacing:-.02em; color:#fff; }\
    .section-heading p { font-size:12px; color:#777; margin:0; line-height:1.55; }\
    .button-row { display:flex; gap:9px; flex-wrap:wrap; }\
    .button { border:1px solid #fff; border-radius:10px; padding:10px 14px; font-size:13px; font-weight:600; display:inline-flex; align-items:center; justify-content:center; gap:7px; transition:.15s ease; margin-top:8px; }\
    .button:hover { transform:translateY(-1px); filter:brightness(1.15); }\
    .primary { color:#000; background:#fff; }\
    .secondary { color:#ccc; background:#1a1a1a; border-color:#fff; }\
    .success { color:#aaa; background:#1a1a1a; border-color:#fff; }\
    .danger-outline { color:#999; border-color:#fff; background:transparent; }\
    .button.disabled { opacity:.4; cursor:default; transform:none!important; filter:none!important; }\
    .btn-option { color:#ccc; background:#1a1a1a; border-color:#555; }\
    .btn-option:hover { border-color:#888; color:#fff; }\
    .button.active { background:#fff; color:#000; border-color:#fff; box-shadow:0 0 12px rgba(255,255,255,0.3); }\
    .button-row:has(.active) .button:not(.active) { opacity:.45; }\
    .stats-row { margin-top:14px; }\
    .stat,.status-message,.metric-card { background:#111; border:1px solid #fff; border-radius:12px; padding:12px; }\
    .stat span,.metric-card span { display:block; font-size:11px; color:#888; margin-bottom:5px; }\
    .stat strong { font-size:26px; color:#fff; }\
    .status-message { display:flex; align-items:center; font-size:13px; color:#aaa; }\
    .status-message.done { color:#fff; }\
    .form-body { display:grid; gap:14px; }\
    .field { display:grid; gap:7px; min-width:0; }\
    .field>span,.field legend { color:#999; font-size:12px; }\
    input:not([type=checkbox]):not([type=range]),select,textarea { width:100%; border:1px solid #fff; border-radius:9px; background:#1a1a1a; color:#e0e0e0; padding:10px 11px; outline:none; }\
    select { appearance:auto; -webkit-appearance:menulist; }\
    select option { background:#1a1a1a; color:#e0e0e0; padding:6px 8px; }\
    input:focus,select:focus,textarea:focus { border-color:#fff; box-shadow:0 0 0 3px rgba(79, 78, 78, 0.1); }\
    textarea { resize:vertical; line-height:1.65; }\
    .checkbox-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }\
    .check-label { display:flex; gap:8px; align-items:center; font-size:13px; color:#ccc; padding:6px 8px; border-radius:6px; cursor:pointer; }\
    .check-label:hover { background:#1a1a1a; }\
    input[type=checkbox] { accent-color:#fff; width:16px; height:16px; }\
    .result-box { margin-top:14px; padding:13px; border:1px solid #fff; background:#111; border-radius:11px; font-size:13px; color:#ddd; line-height:1.6; }\
    .result-box p { margin:5px 0 0; color:#aaa; }\
    .range-field { margin:4px 0 8px; }\
    .range-label { display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#999; margin-bottom:10px; }\
    .range-label strong { color:#fff; font-size:14px; }\
    input[type=range] { width:100%; accent-color:#fff; }\
    .metric-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }\
    .metric-card strong { font-size:22px; color:#fff; }\
    .segmented { display:flex; gap:4px; padding:4px; border:1px solid #fff; background:#000; border-radius:11px; margin-bottom:12px; }\
    .segmented button { flex:1; min-width:0; padding:8px 9px; border:0; background:transparent; color:#888; border-radius:7px; font-size:12px; }\
    .segmented button.active { background:#333; color:#fff; box-shadow:inset 0 0 0 1px #555; }\
    .table-scroll { overflow-x:auto; }\
    table { width:100%; border-collapse:collapse; font-size:13px; }\
    th { text-align:left; color:#777; font-weight:500; }\
    td,th { padding:12px 8px; border-bottom:1px solid #333; }\
    td { color:#ddd; }\
    .clickable-row { cursor:pointer; transition:background .12s; }\
    .clickable-row:hover { background:#1a1a1a; }\
    .clickable-row.selected { background:#222; }\
    .status-badge { border-radius:20px; padding:4px 8px; font-size:10px; }\
    .status-badge.normal { color:#aaa; background:#1a1a1a; border:1px solid #555; }\
    .status-badge.warning { color:#ddd; background:#222; border:1px solid #777; }\
    .status-badge.error { color:#fff; background:#333; border:1px solid #999; }\
    .hint { color:#666; font-size:11px; line-height:1.6; margin:12px 0 0; }\
    .chart-wrap { width:100%; margin:8px 0 12px; overflow-x:auto; }\
    .chart-wrap svg { min-width:320px; }\
    .arch-layout { display:grid; grid-template-columns:minmax(120px,.85fr) 1.15fr; gap:14px; align-items:stretch; }\
    .arch-stack { display:flex; flex-direction:column; align-items:center; gap:0; }\
    .arch-node { display:flex; align-items:center; justify-content:center; width:100%; padding:13px 10px; color:#aaa; background:#111; border:1px solid #444; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; transition:.15s ease; }\
    .arch-node:hover { background:#1a1a1a; border-color:#888; color:#ddd; }\
    .arch-node.selected { color:#fff; background:#2a2a2a; border-color:#fff; }\
    .arch-arrow { color:#555; font-size:12px; padding:3px 0; user-select:none; }\
    .arch-detail { border-radius:12px; padding:18px; background:#111; border:1px solid #444; min-height:120px; }\
    .arch-tag { color:#777; font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px; }\
    .arch-detail-title { font-size:18px; color:#fff; margin:0 0 10px; }\
    .arch-desc { font-size:13px; line-height:1.7; color:#bbb; margin:0 0 8px; }\
    .arch-info { font-size:12px; line-height:1.6; color:#666; margin:0; }\
    .card-container { color:#e0e0e0; line-height:1.6; }\
    .card-container svg { vertical-align:middle; }\
    .card-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; }\
    .card-item { background:#111; border:1px solid #333; border-radius:12px; padding:16px; transition:border-color .15s,background .15s; }\
    .card-item:hover { background:#1a1a1a; border-color:#555; }\
    .card-icon { color:#888; margin-bottom:10px; }\
    .card-title { font-size:14px; font-weight:600; color:#fff; margin:0 0 6px; }\
    .card-desc { font-size:12px; color:#888; margin:0; line-height:1.5; }\
    .card-container h1,.card-container h2,.card-container h3 { color:#fff; margin:0 0 8px; }\
    .card-container h3 { font-size:14px; }\
    .card-container p { color:#aaa; font-size:13px; margin:4px 0; }\
    .card-container a { color:#7aa2f7; text-decoration:none; }\
    .card-container a:hover { text-decoration:underline; }\
    .card-badge { display:inline-block; padding:3px 8px; border-radius:6px; font-size:11px; background:#1a1a1a; color:#888; border:1px solid #333; }\
    .card-list { list-style:none; padding:0; margin:0; }\
    .card-list li { padding:10px 12px; border-bottom:1px solid #222; color:#bbb; font-size:13px; display:flex; align-items:center; gap:10px; }\
    .card-list li:last-child { border-bottom:none; }\
    .card-container style { display:none; }\
    .map-container { border-radius:12px; overflow:hidden; background:#111; }\
    .map-viewport { position:relative; width:100%; height:280px; overflow:hidden; background:#1a1a1a; }\
    .map-grid { position:absolute; top:0; left:0; display:grid; grid-template-columns:repeat(3,256px); width:768px; height:768px; filter:brightness(0.7) contrast(1.1); }\
    .map-tile { width:256px; height:256px; display:block; }\
    .map-marker { position:absolute; top:50%; left:50%; transform:translate(-50%,-100%); z-index:2; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }\
    .map-info { display:flex; align-items:center; gap:12px; padding:12px 16px; background:#111; flex-wrap:wrap; }\
    .map-name { color:#fff; font-size:14px; font-weight:500; display:flex; align-items:center; gap:6px; }\
    .map-coords { color:#666; font-size:12px; }\
    .map-attr { color:#555; font-size:10px; }\
    .map-link { color:#7aa2f7; font-size:12px; text-decoration:none; margin-left:auto; white-space:nowrap; }\
    .map-link:hover { text-decoration:underline; }\
    .mm-wrap { overflow:hidden; padding:8px 0; position:relative; }\
    .mm-wrap svg { cursor:grab; }\
    .img-single { width:100%; }\
    .img-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:10px; }\
    .img-card { border-radius:10px; overflow:hidden; background:#111; border:1px solid #333; }\
    .img-card.img-sm { max-width:200px; }\
    .img-main { display:block; width:100%; height:auto; cursor:pointer; transition:opacity .15s; object-fit:cover; }\
    .img-main:hover { opacity:.85; }\
    .img-caption { padding:8px 10px; font-size:12px; color:#aaa; }\
    .img-err { padding:24px; text-align:center; color:#666; font-size:12px; }\
    .img-overlay { position:fixed; top:0; left:0; right:0; bottom:0; z-index:999999; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; cursor:zoom-out; }\
    .img-overlay img { max-width:90vw; max-height:90vh; border-radius:8px; box-shadow:0 8px 40px rgba(0,0,0,.6); }\
    :host([data-theme="light"]) {\
      color:#333;\
      & .panel { background:#fff; box-shadow:0 0 0 1px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.06); }\
      & h2 { color:#1a1a1a; }\
      & .section-heading p { color:#888; }\
      & .button { border-color:#ddd; }\
      & .primary { color:#fff; background:#4f46e5; border-color:#4f46e5; }\
      & .success { color:#fff; background:#16a34a; border-color:#16a34a; }\
      & .secondary { color:#333; background:#f0f0f0; border-color:#ccc; }\
      & .danger-outline { color:#dc2626; border-color:#dc2626; background:transparent; }\
      & .btn-option { color:#555; background:#f5f5f5; border-color:#ddd; }\
      & .btn-option:hover { border-color:#aaa; color:#333; }\
      & .button.active { background:#4f46e5; color:#fff; border-color:#4f46e5; box-shadow:0 0 12px rgba(79,70,229,0.3); }\
      & .stat,& .status-message,& .metric-card { background:#f8f8f8; border-color:#e0e0e0; }\
      & .stat span,& .metric-card span { color:#999; }\
      & .stat strong,& .metric-card strong { color:#1a1a1a; }\
      & .status-message { color:#555; }\
      & .status-message.done { color:#1a1a1a; }\
      & .field>span,& .field legend { color:#777; }\
      & input:not([type=checkbox]):not([type=range]),& select,& textarea { border-color:#ddd; background:#fff; color:#333; }\
      & select option { background:#fff; color:#333; }\
      & input:focus,& select:focus,& textarea:focus { border-color:#7aa2f7; box-shadow:0 0 0 3px rgba(122,162,247,0.1); }\
      & .check-label { color:#555; }\
      & .check-label:hover { background:#f5f5f5; }\
      & input[type=checkbox] { accent-color:#333; }\
      & .result-box { border-color:#e0e0e0; background:#f8f8f8; color:#555; }\
      & .result-box p { color:#888; }\
      & .range-label { color:#777; }\
      & .range-label strong { color:#1a1a1a; }\
      & input[type=range] { accent-color:#333; }\
      & .segmented { border-color:#ddd; background:#f5f5f5; }\
      & .segmented button { color:#999; }\
      & .segmented button.active { background:#fff; color:#1a1a1a; box-shadow:0 1px 3px rgba(0,0,0,0.1); }\
      & th { color:#999; }\
      & td,& th { border-bottom-color:#e8e8e8; }\
      & td { color:#555; }\
      & .clickable-row:hover { background:#f8f8f8; }\
      & .clickable-row.selected { background:#f0f0f0; }\
      & .status-badge.normal { color:#16a34a; background:#f0fdf4; border-color:#bbf7d0; }\
      & .status-badge.warning { color:#ca8a04; background:#fefce8; border-color:#fde68a; }\
      & .status-badge.error { color:#dc2626; background:#fef2f2; border-color:#fecaca; }\
      & .hint { color:#999; }\
      & .arch-node { color:#555; background:#f8f8f8; border-color:#ddd; }\
      & .arch-node:hover { background:#f0f0f0; border-color:#aaa; color:#333; }\
      & .arch-node.selected { color:#1a1a1a; background:#e8e8e8; border-color:#333; }\
      & .arch-arrow { color:#ccc; }\
      & .arch-detail { background:#f8f8f8; border-color:#ddd; }\
      & .arch-tag { color:#999; }\
      & .arch-detail-title { color:#1a1a1a; }\
      & .arch-desc { color:#555; }\
      & .arch-info { color:#888; }\
      & .card-container { color:#333; }\
      & .card-container h1,& .card-container h2,& .card-container h3 { color:#1a1a1a; }\
      & .card-container p { color:#666; }\
      & .card-item { background:#f8f8f8; border-color:#e0e0e0; }\
      & .card-item:hover { background:#f0f0f0; border-color:#ccc; }\
      & .card-icon { color:#777; }\
      & .card-title { color:#1a1a1a; }\
      & .card-desc { color:#777; }\
      & .card-badge { background:#f0f0f0; color:#777; border-color:#ddd; }\
      & .card-list li { border-bottom-color:#e8e8e8; color:#555; }\
      & .map-container,& .map-info { background:#f8f8f8; }\
      & .map-viewport { background:#eee; }\
      & .map-grid { filter:none; }\
      & .map-name { color:#1a1a1a; }\
      & .map-coords,& .map-attr { color:#999; }\
      & .chart-wrap rect { fill:#333; }\
      & .chart-wrap circle { fill:#333; }\
      & .chart-wrap polyline { stroke:#333; }\
      & .chart-wrap polygon { fill:rgba(0,0,0,0.04); }\
      & .chart-wrap line { stroke:#e0e0e0; }\
      & .chart-wrap text { fill:#777; }\
      & .mm-c { fill:#f0f0f0; stroke:#333; }\
      & .mm-ct { fill:#1a1a1a; }\
      & .mm-b { fill:#f8f8f8; }\
      & .mm-ch { fill:#fff; }\
      & .mm-cht { fill:#555; }\
      & .img-card { background:#f8f8f8; border-color:#e0e0e0; }\
      & .img-caption { color:#666; }\
    }\
  ';
})();
