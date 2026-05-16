/**
 * symbol.js — WASv1フォント記号展開ライブラリ
 * 
 * 使い方: <script src="symbol.js"></script> をHTMLに追加するだけ
 * HTML内に :symbol_name: と書くと自動的にWASv1フォントの文字に変換される
 * 
 * 例: :tired_ex: → WASv1フォントの対応グリフ
 */

(function () {
    'use strict';

    const FONT_URL = 'https://ec2045.github.io/2045font/WASv1.otf'; // 本番
    const FONT_FAMILY = 'WASv1';

    // 記号名 → WASv1フォント文字のマッピング
    // （./delete フォルダーのファイルをアルファベット順ソートした順番で割り当て）
    const SYMBOL_MAP = {
        // a-z
        'artist_r': 'a',
        'at_beta': 'b',
        'beta_ex': 'c',
        'bib_org': 'd',
        'binding_ex': 'e',
        'blank': 'f',
        'burst_ex': 'g',
        'ced_foundation': 'h',
        'censorship': 'i',
        'comma_ex': 'j',
        'comma_qu': 'k',
        'digital_burnout': 'l',
        'double_neg': 'm',
        'echo_ex': 'n',
        'fiction_exhibition': 'o',
        'flash_ex': 'p',
        'fragment_qu': 'q',
        'hyper_period': 'r',
        'incomplete_qu': 's',
        'incomplete_tesseract': 't',
        'infinite_qu': 'u',
        'jpex': 'v',
        'jpex_sub': 'w',
        'jpqu': 'x',
        'jpqu_sub': 'y',
        'labyrinth_qu': 'z',
        // A-Z
        'minimal_ex': 'A',
        'multilayer_qu': 'B',
        'node_labo': 'C',
        'oblivion_qu': 'D',
        'opaque_qu': 'E',
        'overlook': 'F',
        'pc_ultimate_right': 'G',
        'permeation_qu': 'H',
        'resonance_ex': 'I',
        'silent_ex': 'J',
        'simmer': 'K',
        'super_qu': 'L',
        'super_qu_sub': 'M',
        'thanks_ex': 'N',
        'tired_ex': 'O',
        'transparent_qu': 'P',
        'truth_key': 'Q',
        'unfinish_qu': 'R',
        'world_symbol_org': 'S',
        'z_sand': 'T',
    };

    /**
     * @font-face をページに挿入する
     */
    function injectFontFace() {
        if (document.getElementById('wasv1-font-style')) return;
        const style = document.createElement('style');
        style.id = 'wasv1-font-style';
        style.textContent = `
      @font-face {
        font-family: '${FONT_FAMILY}';
        src: url('${FONT_URL}') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
    `;
        document.head.appendChild(style);
    }

    /**
     * テキストノードを走査して :symbol_name: を <span> に置換する
     * @param {Node} root - 走査ルートノード
     */
    function processNode(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    // script / style タグ内は無視
                    const parent = node.parentNode;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    const tag = parent.nodeName.toUpperCase();
                    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // すでに変換済みの span は無視
                    if (tag === 'SPAN' && parent.dataset && parent.dataset.wasv1) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return /:[\w_]+:/.test(node.nodeValue)
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_SKIP;
                }
            }
        );

        const nodesToReplace = [];
        let current;
        while ((current = walker.nextNode())) {
            nodesToReplace.push(current);
        }

        for (const textNode of nodesToReplace) {
            replaceTextNode(textNode);
        }
    }

    /**
     * テキストノード内の :name: パターンを <span> に置換する
     * @param {Text} textNode
     */
    function replaceTextNode(textNode) {
        const text = textNode.nodeValue;
        const regex = /:([\w_]+):/g;
        let lastIndex = 0;
        let match;
        const fragment = document.createDocumentFragment();
        let hasMatch = false;

        while ((match = regex.exec(text)) !== null) {
            const name = match[1];
            const char = SYMBOL_MAP[name];
            if (char === undefined) continue;

            hasMatch = true;

            // マッチ前のテキスト
            if (match.index > lastIndex) {
                fragment.appendChild(
                    document.createTextNode(text.slice(lastIndex, match.index))
                );
            }

            // WASv1フォントの <span>
            const span = document.createElement('span');
            span.dataset.wasv1 = name;
            span.title = `:${name}:`;
            span.style.fontFamily = `'${FONT_FAMILY}', sans-serif`;
            span.style.display = 'inline-block';
            span.style.fontSize = '1.2em';
            span.style.verticalAlign = 'middle';
            span.style.lineHeight = '1';
            span.style.margin = '0 0.1em';
            span.textContent = char;
            fragment.appendChild(span);

            lastIndex = regex.lastIndex;
        }

        if (!hasMatch) return;

        // 残りのテキスト
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        textNode.parentNode.replaceChild(fragment, textNode);
    }

    /**
     * MutationObserver で動的追加された要素にも対応する
     */
    function startObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const parent = node.parentNode;
                        if (parent) processNode(parent);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        processNode(node);
                    }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * 初期化
     */
    function init() {
        injectFontFace();
        processNode(document.body);
        startObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
