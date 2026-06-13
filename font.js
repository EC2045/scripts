(function () {
  // 1. 状態管理
  const state = {
    settings: {
      fontKey: 'default',
      theme: localStorage.getItem('theme') || (document.body?.classList.contains('light-mode') ? 'light' : 'dark'),
      lang: localStorage.getItem('user-lang-setting') || null
    },
    langData: {}
  };

  const $ = (id) => document.getElementById(id);

  // ---- 対応言語の定義（ここに追加するだけでUIに反映される）----
  const LANG_OPTIONS = {
    ja: '日本語',
    en: 'English',
    eo: "Esperanto",
    moen: 'Modern English（original)',
    moja: '現代日本語(オリジナル）',
    langkey: 'langkey'
  };

  const LANG_DEFAULT = Object.keys(LANG_OPTIONS)[0]; // 最初のキーがデフォルト

  // ---- 言語システム ----

  // 2a. langファイルのパスを取得（script要素のdata-lang-path属性から）
  function getLangPath(langCode) {
    const scriptEl = document.currentScript || (function () {
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.includes('font.js')) return scripts[i];
      }
    })();
    if (!scriptEl) return null;
    const pattern = scriptEl.getAttribute('data-lang-path');
    if (!pattern) return null;
    return pattern.replace('{lang}', langCode);
  }

  // 2b. 使用言語を決定（優先順位: localStorage > navigator.language > LANG_DEFAULT）
  function detectLang() {
    if (state.settings.lang && LANG_OPTIONS[state.settings.lang]) return state.settings.lang;
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    // ブラウザ言語が対応言語に含まれていればそれを使う
    const matched = Object.keys(LANG_OPTIONS).find(code => browserLang.startsWith(code));
    return matched || LANG_DEFAULT;
  }

  // 2c. INI形式をパース（key=value、'#'はコメント）
  function parseLang(text) {
    const data = {};
    text.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const sep = line.indexOf('=');
      if (sep < 0) return;
      const key = line.slice(0, sep).trim();
      const value = line.slice(sep + 1).trim();
      if (key) data[key] = value;
    });
    return data;
  }

  // 2d. langファイルをfetchしてDOMに適用
  async function loadAndApplyLang(langCode) {
    const path = getLangPath(langCode);
    if (!path) return; // data-lang-path未設定なら何もしない

    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`lang fetch failed: ${path} (${res.status})`);
      const text = await res.text();
      state.langData = parseLang(text);
      applyLang();
      state.settings.lang = langCode;
      localStorage.setItem('user-lang-setting', langCode);
      updateLangSelect();
    } catch (e) {
      console.warn('[font.js] Lang load error:', e.message);
    }
  }

  // 2e. DOM全体を走査して "xxx.yyy" 形式のテキストノードを置換
  function applyLang() {
    // 1. data-lang-key属性を持つ要素のテキストを更新
    document.querySelectorAll('[data-lang-key]').forEach(el => {
      const key = el.getAttribute('data-lang-key');
      if (key && state.langData[key] !== undefined) {
        el.innerHTML = state.langData[key];
      }
    });

    // 2. まだ属性が付いていないテキストノードを探して属性を付与した上で置換
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          // scriptやstyleの中身、および既にdata-lang-keyを持つ親要素の配下は無視
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT;
          if (parent.hasAttribute('data-lang-key')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodesToReplace = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const trimmed = node.textContent.trim();
      if (state.langData[trimmed] !== undefined) {
        nodesToReplace.push({ node, key: trimmed });
      }
    }

    nodesToReplace.forEach(({ node, key }) => {
      const parent = node.parentElement;
      if (parent && parent.childNodes.length === 1) {
        // 親要素がこのテキストノード1つだけを持つ場合は親に属性を付与
        parent.setAttribute('data-lang-key', key);
        parent.innerHTML = state.langData[key];
      } else {
        // そうでない（テキスト以外も混ざっている）場合はテキストノードのみ書き換える
        // ただしこの場合は次回切り替え時に元のキー情報が失われるため、
        // 独自にspanで囲んでdata-lang-keyを付与するなどの安全な置換を行う
        const span = document.createElement('span');
        span.setAttribute('data-lang-key', key);
        span.innerHTML = state.langData[key];
        node.parentNode.replaceChild(span, node);
      }
    });

    // 3. data-lang-img属性を持つimg要素の src を言語に合わせて更新
    //    data-lang-img="art.hand.name"  → langDataのキー（ファイル名が入っている）
    //    data-lang-img-dir="./images_{lang}/"  → {lang}を現在の言語コードに置換するパターン
    const currentLang = langCode || 'ja';
    document.querySelectorAll('img[data-lang-img]').forEach(img => {
      const key = img.getAttribute('data-lang-img');
      const dirPattern = img.getAttribute('data-lang-img-dir');
      if (!key || !dirPattern) return;

      const filename = state.langData[key];
      if (!filename) return;

      const dir = dirPattern.replace('{lang}', currentLang.replace("mo", "").replace("langkey", "ja"));
      img.src = dir + filename.trim();
      img.alt = filename.trim();
    });
  }

  // 2f. 言語切り替えのpublic API
  window.setLang = function (langCode) {
    loadAndApplyLang(langCode);
  };

  function updateLangSelect() {
    const sel = $('lang-select');
    if (sel) sel.value = state.settings.lang || detectLang();
  }

  // ---- フォントシステム ----

  // 2. フォントの定義
  const FONT_PRESETS = {
    default: '"2045alphabet", "Hiragino Mincho ProN", serif',
    mincho: '"Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif',
    gothic: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    sans: '"Arial", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    mono: '"Courier New", "Consolas", "Cascadia Mono", monospace',
    acs: '"ACS FONT","2045alphabet", "Hiragino Mincho ProN", serif'
  };

  // 3. 設定の保存・読み込み
  function saveSettings() {
    localStorage.setItem('user-font-setting-data', JSON.stringify({ fontKey: state.settings.fontKey }));
    localStorage.setItem('theme', state.settings.theme);
  }

  function loadSettings() {
    const savedFont = localStorage.getItem('user-font-setting-data');
    if (savedFont) {
      try {
        const parsed = JSON.parse(savedFont);
        state.settings.fontKey = parsed.fontKey || 'default';
      } catch (e) { console.error("Font settings load error", e); }
    }
    // 保存されたテーマがない場合は現在のHTMLの状態を優先
    if (!localStorage.getItem('theme')) {
      state.settings.theme = document.body?.classList.contains('light-mode') ? 'light' : 'dark';
    } else {
      state.settings.theme = localStorage.getItem('theme');
    }
  }

  // 4. 設定適用関数
  window.setFont = function (fontKey) {
    const fontValue = FONT_PRESETS[fontKey] || FONT_PRESETS.default;
    state.settings.fontKey = fontKey in FONT_PRESETS ? fontKey : 'default';
    document.documentElement.style.setProperty('--main-font', fontValue);
    saveSettings();
    const select = $('font-select');
    if (select) select.value = state.settings.fontKey;
  };

  window.toggleTheme = function () {
    const htmlElement = document.documentElement;
    const body = document.body;
    const currentTheme = state.settings.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // 両方のパターンに対応
    htmlElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'light') {
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
    }

    state.settings.theme = newTheme;
    saveSettings();

    // アイコンの回転演出
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
      icon.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      icon.style.transform = newTheme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    const themeText = $('theme-status-text');
    if (themeText) themeText.textContent = newTheme === 'light' ? 'ライト' : 'ダーク';
  };

  // 5. スタイルの注入
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: '2045alphabet';
        src: url('https://ec2045.github.io/2045font/2045alphabet.otf') format('opentype');
        font-display: swap;
      }
      @font-face {
        font-family: 'ACS FONT';
        src: url('https://ec2045.github.io/2045font/ACS FONT.otf') format('opentype');
        font-display: swap;
      }

      :root {
        --main-font: ${FONT_PRESETS.default};
      }

      /* フォント強制適用 */
      body, button, input, select, textarea, [class*="font-"] {
        font-family: var(--main-font) !important;
      }

      #font-ui-wrapper {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 100000;
        color: #000 !important;
        line-height: 1.5 !important;
      }

      #font-ui-toggle {
        background: rgba(255, 255, 255, 0.9) !important;
        color: #000 !important;
        border: 1px solid rgba(0, 0, 0, 0.1) !important;
        width: 48px !important;
        height: 48px !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        backdrop-filter: blur(8px) !important;
      }

      #font-ui-toggle:hover {
        transform: scale(1.05) !important;
        box-shadow: 0 6px 16px rgba(0,0,0,0.15) !important;
      }

      #font-ui-toggle i {
        font-size: 20px !important;
        color: #333 !important;
      }

      #font-ui-panel {
        display: none;
        position: absolute;
        top: 65px;
        right: 0;
        width: 280px;
        background: #fff !important;
        padding: 24px !important;
        border-radius: 20px !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
        border: 2px solid #000 !important;
        color: #000 !important;
      }

      #font-ui-panel.show { display: block !important; }

      .setting-group { margin-bottom: 22px !important; }
      .setting-group:last-child { margin-bottom: 0 !important; }
      
      .setting-label {
        display: block !important;
        padding-left: 10px !important;
        border-left: 4px solid #000 !important;
        margin-bottom: 12px !important;
        font-weight: 800 !important;
        font-size: 14px !important;
        text-align: left !important;
      }

      .setting-control {
        width: 100% !important;
        padding: 12px !important;
        background: #fff !important;
        color: #000 !important;
        border: 2px solid #eee !important;
        border-radius: 12px !important;
        font-size: 14px !important;
        outline: none !important;
        appearance: auto !important;
      }

      #theme-toggle {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
        padding: 12px 16px !important;
        background: #f4f4f4 !important;
        color: #000 !important;
        border: none !important;
        border-radius: 12px !important;
        cursor: pointer !important;
        font-weight: bold !important;
      }
    `;
    document.head.appendChild(style);
  }

  // 6. UIの構築
  function initUI() {
    if ($('font-ui-wrapper')) return;

    // lang-selectのオプションを動的に生成（data-lang-pathが設定されている場合のみ）
    const hasLangPath = (function () {
      const scripts = document.getElementsByTagName('script');
      for (let i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && scripts[i].src.includes('font.js')) {
          return !!scripts[i].getAttribute('data-lang-path');
        }
      }
      return false;
    })();

    // LANG_OPTIONSからselectオプションを動的生成
    const langOptionsHTML = Object.entries(LANG_OPTIONS)
      .map(([code, label]) => `<option value="${code}">${label}</option>`)
      .join('\n            ');

    const langSectionHTML = hasLangPath ? `
        <div class="setting-group">
          <span class="setting-label">言語 / Language</span>
          <select id="lang-select" class="setting-control" onchange="window.setLang(this.value)">
            ${langOptionsHTML}
          </select>
        </div>
    ` : '';

    const wrapper = document.createElement('div');
    wrapper.id = 'font-ui-wrapper';
    wrapper.innerHTML = `
      <button id="font-ui-toggle">
        <i class="fas fa-bars"></i>
      </button>
      <div id="font-ui-panel">
        <div class="setting-group">
          <span class="setting-label">フォント設定</span>
          <select id="font-select" class="setting-control" onchange="window.setFont(this.value)">
            <optgroup label="メイン">
              <option value="default">2045alphabet</option>
              <option value="mincho">明朝体</option>
              <option value="gothic">ゴシック体</option>
            </optgroup>
            <optgroup label="システム">
              <option value="sans">サンセリフ</option>
              <option value="mono">等幅 (Code)</option>
            </optgroup>
            <optgroup label="カスタム">
              <option value="acs">ACS FONT</option>
            </optgroup>
          </select>
        </div>
        <div class="setting-group">
          <span class="setting-label">テーマ切り替え</span>
          <button id="theme-toggle" onclick="window.toggleTheme()">
            <span><i class="fas fa-adjust"></i> <span id="theme-status-text">${state.settings.theme === 'light' ? 'ライト' : 'ダーク'}</span></span>
            <i class="fas fa-chevron-right" style="font-size: 12px; opacity: 0.3;"></i>
          </button>
        </div>
        ${langSectionHTML}
      </div>
    `;
    document.body.appendChild(wrapper);

    // パネルの開閉
    const toggleBtn = $('font-ui-toggle');
    const panel = $('font-ui-panel');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('show');
    });

    document.addEventListener('click', () => panel.classList.remove('show'));
    panel.addEventListener('click', (e) => e.stopPropagation());

    // 初期状態の適用
    applyInitialTheme();
    window.setFont(state.settings.fontKey);

    // 言語の初期化（data-lang-pathがある場合のみ）
    if (hasLangPath) {
      const initialLang = detectLang();
      updateLangSelect();
      loadAndApplyLang(initialLang);
    }
  }

  function applyInitialTheme() {
    const htmlElement = document.documentElement;
    const body = document.body;
    htmlElement.setAttribute('data-theme', state.settings.theme);
    if (state.settings.theme === 'light') {
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
    }
  }

  // 7. 実行
  function run() {
    loadSettings();
    injectStyles();
    initUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
