(function() {
  // 1. 状態管理
  const state = {
    settings: {
      fontKey: 'default',
      theme: localStorage.getItem('theme') || (document.body.classList.contains('light-mode') ? 'light' : 'dark')
    }
  };

  const $ = (id) => document.getElementById(id);

  // 2. フォントの定義
  const FONT_PRESETS = {
    default: '"2045alphabet", "Hiragino Mincho ProN", serif',
    mincho: '"Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif',
    gothic: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    sans: '"Arial", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    mono:  '"Courier New", "Consolas", "Cascadia Mono", monospace',
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
      } catch(e) { console.error("Font settings load error", e); }
    }
    // 保存されたテーマがない場合は現在のHTMLの状態を優先
    if (!localStorage.getItem('theme')) {
      state.settings.theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    } else {
      state.settings.theme = localStorage.getItem('theme');
    }
  }

  // 4. 設定適用関数
  window.setFont = function(fontKey) {
    const fontValue = FONT_PRESETS[fontKey] || FONT_PRESETS.default;
    state.settings.fontKey = fontKey in FONT_PRESETS ? fontKey : 'default';
    document.documentElement.style.setProperty('--main-font', fontValue);
    saveSettings();
    const select = $('font-select');
    if (select) select.value = state.settings.fontKey;
  };

  window.toggleTheme = function() {
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

      /* 画像のデザインを完全再現 */
      #font-ui-toggle {
        background: #fff !important;
        color: #000 !important;
        border: 2px solid #000 !important;
        padding: 8px 24px !important;
        border-radius: 20px !important; /* 画像のような大きな角丸 */
        cursor: pointer !important;
        font-weight: 600 !important;
        font-size: 18px !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        transition: transform 0.2s ease !important;
        box-shadow: none !important;
      }

      #font-ui-toggle:hover {
        transform: scale(1.02);
      }

      #font-ui-toggle i {
        font-size: 22px !important;
        color: #888 !important;
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

    const wrapper = document.createElement('div');
    wrapper.id = 'font-ui-wrapper';
    wrapper.innerHTML = `
      <button id="font-ui-toggle">
        <i class="fas fa-cog"></i>
        <span>設定</span>
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
