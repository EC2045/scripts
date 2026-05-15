(function() {
  // 1. 状態管理（state）の定義
  const state = {
    settings: {
      fontKey: 'default'
    }
  };

  // 2. セレクタの簡易関数 ($)
  const $ = (id) => document.getElementById(id);

  // 3. フォントの定義
  const FONT_PRESETS = {
    default: '"2045alphabet", "Hiragino Mincho ProN", serif',
    mincho: '"Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif',
    gothic: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    sans: '"Arial", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    mono:  '"Courier New", "Consolas", "Cascadia Mono", monospace',
    acs: '"ACS FONT","2045alphabet", "Hiragino Mincho ProN", serif '
  };

  // 4. 設定の保存・読み込み
  function saveSettings() {
    localStorage.setItem('user-font-setting-data', JSON.stringify(state.settings));
  }

  function loadSettings() {
    const saved = localStorage.getItem('user-font-setting-data');
    if (saved) {
      state.settings = JSON.parse(saved);
    }
  }

  // 5. フォント適用関数 (提供されたロジックを統合)
  window.setFont = function(fontKey) {
    const fontValue = FONT_PRESETS[fontKey] || FONT_PRESETS.default;
    state.settings.fontKey = fontKey in FONT_PRESETS ? fontKey : 'default';
    
    // CSS変数を更新
    document.documentElement.style.setProperty('--main-font', fontValue);
    
    // 状態を保存
    saveSettings();
    
    // UIのセレクトボックスを同期
    if ($('font-select')) $('font-select').value = state.settings.fontKey;
  };

  // 6. スタイルの注入
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
      --text-color: #333333;
      --panel-bg: rgba(255, 255, 255, 0.98);
      --border-color: #dddddd;
      --input-bg: #ffffff;
    }

    body {
      font-family: var(--main-font);
    }

    #font-ui-wrapper {
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: 10000;
      font-family: sans-serif;
    }

    #font-ui-toggle {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      font-size: 14px;
    }

    #font-ui-panel {
      display: none;
      position: absolute;
      top: 45px;
      right: 0;
      width: 220px;
      background: var(--panel-bg);
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border: 1px solid var(--border-color);
    }

    #font-ui-panel.show {
      display: block;
    }

    .setting-group {
      margin-bottom: 22px;
    }

    .setting-label {
      display: block;
      padding-left: 8px;
      border-left: 3px solid var(--accent-color);
      margin-bottom: 8px;
      font-weight: 700;
      font-size: .92rem;
      color: var(--text-color);
    }

    .setting-control {
      width: 100%;
      padding: 8px 10px;
      background: var(--input-bg);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      font-size: 14px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // 7. UI要素の構築
  const wrapper = document.createElement('div');
  wrapper.id = 'font-ui-wrapper';
  wrapper.innerHTML = `
    <button id="font-ui-toggle">⚙️ 設定</button>
    <div id="font-ui-panel">
      <div class="setting-group">
        <span class="setting-label">フォント</span>
        <select id="font-select" class="setting-control" onchange="setFont(this.value)">
          <optgroup label="標準">
            <option value="default">2045alphabet</option>
            <option value="mincho">明朝</option>
            <option value="gothic">ゴシック</option>
          </optgroup>
          <optgroup label="見やすい表示">
            <option value="sans">サンセリフ</option>
            <option value="mono">等幅</option>
          </optgroup>
          <optgroup label="読みずらい字体">
            <option value="acs">ACS FONT</option>
          </optgroup>
        </select>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // 8. イベントリスナーの設定
  const toggleBtn = $('font-ui-toggle');
  const panel = $('font-ui-panel');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    panel.classList.remove('show');
  });

  panel.addEventListener('click', (e) => e.stopPropagation());

  // 9. 初期ロード処理
  loadSettings();
  setFont(state.settings.fontKey);

})();
