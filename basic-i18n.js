(() => {
  'use strict';
  const script = document.currentScript;
  if (!script || document.getElementById('ec-language-guide')) return;
  const ja = script.dataset.ja || '', en = script.dataset.en || '';
  const key = 'ec2045-basic-language';
  const read = () => {try {return localStorage.getItem(key) || 'auto';}catch {return 'auto';}};
  const detect = () => (navigator.languages || [navigator.language]).find(x => /^(ja|en)(-|$)/i.test(x))?.slice(0,2).toLowerCase() || 'ja';
  const box = document.createElement('aside');
  box.id = 'ec-language-guide';
  box.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:99999;max-width:min(390px,calc(100vw - 32px));padding:12px 16px;border:1px solid #888;border-radius:12px;background:#fff;color:#18202a;box-shadow:0 4px 24px #0003;font:14px/1.6 system-ui,sans-serif;text-align:left;box-sizing:border-box';
  const label = document.createElement('label');
  label.textContent = '日本語 / English '; label.htmlFor = 'ec-language-choice';
  const select = document.createElement('select'); select.id='ec-language-choice'; select.style.cssText='background:#fff;color:#18202a;border:1px solid #888;border-radius:5px;padding:4px;font:inherit';
  for (const [value,text] of [['auto','自動 / Auto'],['ja','日本語'],['en','English']]) {const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}
  const details = document.createElement('details'), summary = document.createElement('summary'), text = document.createElement('p'), note = document.createElement('p'), link = document.createElement('a');
  text.style.margin='8px 0'; note.style.cssText='font-size:12px;margin:6px 0';link.href='https://ec2045.github.io/'; link.style.color='#2454aa';
  details.append(summary,text,note,link); box.append(label,select,details);document.body.append(box);
  const native = !!document.querySelector('script[data-lang-path]');
  function apply(syncNative = false) {
    const chosen=select.value, lang=chosen==='auto'?detect():chosen;
    box.lang=lang; summary.textContent=lang==='en'?'About this site':'このサイトについて';text.textContent=lang==='en'?en:ja;
    note.textContent=lang==='en'?'This is a short English introduction. Some original pages and records are available only in Japanese.':'サイトの紹介です。記事・記録の本文には、日本語のみのものがあります。';
    link.textContent=lang==='en'?'Explore the World Portal →':'世界ポータルへ →';
    if(syncNative && native && typeof window.setLang==='function')window.setLang(lang);
  }
  select.value=['ja','en','auto'].includes(read())?read():'auto';details.open=select.value==='en'||(select.value==='auto'&&detect()==='en');apply();
  select.addEventListener('change',()=>{try{localStorage.setItem(key,select.value);}catch{}details.open=true;apply(true);});
  window.addEventListener('languagechange',()=>{if(select.value==='auto')apply();});
})();
