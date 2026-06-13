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