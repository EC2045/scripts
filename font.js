(function() {
  // Constants for Font Presets
  const FONT_PRESETS = {
    default: '"2045alphabet", "Hiragino Mincho ProN", serif',
    mincho: '"Hiragino Mincho ProN", "Yu Mincho", "MS PMincho", serif',
    gothic: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    sans: '"Arial", "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif',
    mono: '"Courier New", "Consolas", "Cascadia Mono", monospace',
    acs: '"ACS FONT","2045alphabet", "Hiragino Mincho ProN", serif'
  };

  const style = document.createElement('style');
  style.textContent = `
    /* Font Faces */
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

    /* CSS Variables Fallback and Global Font Rule */
    :root {
      --main-font: ${FONT_PRESETS.default};
      --accent-color: #4a90e2;
      --input-bg: #ffffff;
      --text-color: #333333;
      --border-color: #dddddd;
      --panel-bg: rgba(255, 255, 255, 0.95);
    }

    body {
      font-family: var(--main-font);
    }

    /* Floating Settings UI */
    #font-settings-wrapper {
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: 9999;
      font-family: sans-serif;
    }

    #font-settings-btn {
      background: var(--accent-color);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    #font-settings-btn:hover {
      transform: scale(1.05);
    }

    #font-settings-panel {
      display: none;
      position: absolute;
      top: 45px;
      right: 0;
      width: 220px;
      background: var(--panel-bg);
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(5px);
    }

    #font-settings-panel.active {
      display: block;
    }

    .setting-group {
      margin-bottom: 10px;
    }

    .setting-label {
      display: block;
      padding-left: 8px;
      border-left: 3px solid var(--accent-color);
      margin-bottom: 8px;
      font-weight: 700;
      font-size: .85rem;
      color: var(--text-color);
    }

    .setting-control {
      width: 100%;
      padding: 8px;
      background: var(--input-bg);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.id = 'font-settings-wrapper';
  wrapper.innerHTML = `
    <button id="font-settings-btn">⚙️ 設定</button>
    <div id="font-settings-panel">
      <div class="setting-group">
        <span class="setting-label">フォント切替</span>
        <select id="font-select" class="setting-control">
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

  const panel = document.getElementById('font-settings-panel');
  const btn = document.getElementById('font-settings-btn');
  const select = document.getElementById('font-select');

  // Toggle panel
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('active');
  });

  // Close panel when clicking outside
  document.addEventListener('click', () => {
    panel.classList.remove('active');
  });
  panel.addEventListener('click', (e) => e.stopPropagation());

  // Set Font Function
  function setFont(fontKey, save = true) {
    const fontValue = FONT_PRESETS[fontKey] || FONT_PRESETS.default;
    document.documentElement.style.setProperty('--main-font', fontValue);
    
    if (select) select.value = fontKey;
    
    if (save) {
      localStorage.setItem('user-font-setting', fontKey);
    }
  }

  const savedFont = localStorage.getItem('user-font-setting') || 'default';
  setFont(savedFont, false);

  // Handle select change
  select.addEventListener('change', (e) => {
    setFont(e.target.value);
  });

})();
