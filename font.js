(function() {
  // 1. 状態管理
  const state = {
    settings: {
      fontKey: 'default'
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
    localStorage.setItem('user-font-setting-data', JSON.stringify(state.settings));
  }

  function loadSettings() {
    const saved = localStorage.getItem('user-font-setting-data');
    if (saved) {
      try {
        state.settings = JSON.parse(saved);
      } catch(e) { console.error("Settings load error", e); }
    }
  }

  // 4. フォント適用関数 (グローバルに公開)
  window.setFont = function(fontKey) {
    const fontValue = FONT_PRESETS[fontKey] || FONT_PRESETS.default;
    state.settings.fontKey = fontKey in FONT_PRESETS ? fontKey : 'default';
    
    // CSS変数を更新
    document.documentElement.style.setProperty('--main-font', fontValue);
    
    // 状態を保存
    saveSettings();
    
    // UIの同期
    const select = $('font-select');
    if (select) select.value = state.settings.fontKey;
  };

  // 5. スタイルの注入 (Tailwindに負けないように !important を追加)
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
        --accent-color: #4a90e2;
        --panel-bg: rgba(255, 255, 255, 0.98);
      }

      /* Tailwindのフォント指定を上書き */
      body, button, input, select, textarea, [class*="font-"] {
        font-family: var(--main-font) !important;
      }

      #font-ui-wrapper {
        position: fixed;
        top: 15px;
        right: 15px;
        z-index: 99999;
      }

      #font-ui-toggle {
        background: var(--accent-color);
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        transition: transform 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      #font-ui-toggle:hover { transform: scale(1.05); }

      #font-ui-panel {
        display: none;
        position: absolute;
        top: 45px;
        right: 0;
        width: 240px;
        background: var(--panel-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        border: 1px solid #eee;
        backdrop-filter: blur(10px);
      }

      #font-ui-panel.show { display: block; }

      .setting-group { margin-bottom: 15px; }
      .setting-label {
        display: block;
        padding-left: 8px;
        border-left: 3px solid var(--accent-color);
        margin-bottom: 8px;
        font-weight: bold;
        font-size: 13px;
        color: #333;
      }

      .setting-control {
        width: 100%;
        padding: 8px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  // 6. UIの構築
  function initUI() {
    if ($('font-ui-wrapper')) return; // 重複防止

    const wrapper = document.createElement('div');
    wrapper.id = 'font-ui-wrapper';
    wrapper.innerHTML = `
      <button id="font-ui-toggle"><i class="fas fa-cog"></i> 設定</button>
      <div id="font-ui-panel">
        <div class="setting-group">
          <span class="setting-label">フォント切り替え</span>
          <select id="font-select" class="setting-control" onchange="window.setFont(this.value)">
            <optgroup label="標準">
              <option value="default">2045alphabet</option>
              <option value="mincho">明朝体</option>
              <option value="gothic">ゴシック体</option>
            </optgroup>
            <optgroup label="見やすい">
              <option value="sans">サンセリフ</option>
              <option value="mono">等幅 (Mono)</option>
            </optgroup>
            <optgroup label="特殊">
              <option value="acs">ACS FONT</option>
            </optgroup>
          </select>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    // イベント
    const toggleBtn = $('font-ui-toggle');
    const panel = $('font-ui-panel');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('show');
    });

    document.addEventListener('click', () => panel.classList.remove('show'));
    panel.addEventListener('click', (e) => e.stopPropagation());

    // 初期値適用
    window.setFont(state.settings.fontKey);
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
