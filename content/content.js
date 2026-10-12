(function () {
  'use strict';

  console.log('[DSE] DeepSeek Enhancer 已注入，当前页面:', location.href);

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

  let enabled = true;
  const processedNodes = new WeakSet();
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
    var checkUrl = location.href;
    setInterval(function() {
      if (location.href !== checkUrl) {
        checkUrl = location.href;
        if (isNewChatPage()) {
          injectedThisChat = false;
          skippedToastShown = false;
        }
        console.log('[DSE] URL变化:', location.pathname);
      }
    }, 500);
  }

  function interceptSend() {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        var ta = document.querySelector('textarea');
        if (ta && e.target === ta) {
          tryInjectPrompt(ta);
        }
      }
    }, true);

    document.addEventListener('click', function(e) {
      var btn = e.target.closest('button, [role="button"]');
      if (!btn) return;
      var ta = document.querySelector('textarea');
      if (!ta) return;
      var container = ta.closest('form, [class*="input"], [class*="chat"], [class*="send"]');
      if (container && container.contains(btn)) {
        tryInjectPrompt(ta);
      }
    }, true);
  }

  function tryInjectPrompt(textarea) {
    if (!autoPrompt || !promptText) return;
    if (!isNewChatPage()) {
      if (!skippedToastShown) {
        showToast('已有对话，跳过提示词注入');
        skippedToastShown = true;
      }
      return;
    }
    if (injectedThisChat) return;

    var currentText = textarea.value;
    if (!currentText.trim()) return;
    if (currentText.includes('[系统指令')) return;

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

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(function() { if (enabled) debouncedScan(); });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    debouncedScan();
  }

  function debouncedScan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scanPage, 800);
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

          var wrapper = document.createElement('div');
          wrapper.className = 'dse-interactive-wrapper';
          pre.parentNode.insertBefore(wrapper, pre);
          pre.style.display = 'none';

          renderInteractive(wrapper, parsed);
          console.log('[DSE] 交互 UI 已渲染:', parsed.type);
        }
      }
    });
    scanLinks();
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

  // ============ 配置解析 ============

  function parseConfig(raw) {
    raw = raw.trim();

    if (raw.startsWith('{')) {
      try {
        var obj = JSON.parse(raw);
        if (obj.type) return { type: obj.type, config: obj };
      } catch(e) { /* fall through */ }
    }

    var lines = raw.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    var cfg = { items: [], fields: [], columns: [], rows: [], options: [], nodes: [] };
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
        } else {
          (cfg[section] || cfg.items).push(val);
        }
      }
    }
    return cfg.type ? { type: cfg.type, config: cfg } : null;
  }

  // ============ UI 渲染 ============

  function renderInteractive(wrapper, parsed) {
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
  };
  var TYPE_SUBTITLES = {
    checklist: '勾选后点击提交', form: '填写信息后提交到聊天',
    slider: '拖动滑块选择数值', table: '点击行可提交选择',
    buttons: '点击按钮触发操作', text: '编辑文本后复制或提交',
    chart: '可切换折线图/柱状图',
    structure: '点击模块查看详情',
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

    var styles = ['primary', 'success', 'secondary', 'danger-outline'];
    items.forEach(function(item, i) {
      var btn = mkBtn(styles[i % styles.length], item);
      btn.addEventListener('click', function() {
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
    .panel { border:1px solid #fff; background:#202020; border-radius:18px; padding:20px; min-width:0; box-shadow:0 10px 35px rgba(81, 81, 81, 0.25); }\
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
  ';
})();
