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
        'artist_r': 'a', '同一アート作家_R': 'a', '同一アート作家R': 'a',
        'at_beta': 'b', 'アット:β': 'b', 'アットβ': 'b',
        'beta_ex': 'c', 'ベタクラメーション': 'c',
        'bib_org': 'd', 'BIB': 'd',
        'binding_ex': 'e', '束縛感嘆符': 'e',
        'blank': 'f', '空白': 'f',
        'burst_ex': 'g', '破裂感嘆符': 'g',
        'ced_foundation': 'h', 'CED財団': 'h',
        'censorship': 'i', '検閲符': 'i',
        'comma_ex': 'j', '句点和感嘆符': 'j',
        'comma_qu': 'k', '句点和疑問符': 'k',
        'digital_burnout': 'l', 'デジタル_バーンアウト': 'l', 'デジタルバーンアウト': 'l',
        'double_neg': 'm', '二重否符': 'm',
        'echo_ex': 'n', '反響感嘆符': 'n',
        'fiction_exhibition': 'o', '架空疑問展': 'o',
        'flash_ex': 'p', '閃光感嘆符': 'p',
        'fragment_qu': 'q', '断片疑問符': 'q',
        'hyper_period': 'r', 'ハイパーピリオド': 'r',
        'incomplete_qu': 's', '不完全疑問符': 's',
        'incomplete_tesseract': 't', '不完全超立方体': 't',
        'infinite_qu': 'u', '無限疑問符': 'u',
        'jpex': 'v', '読点和感嘆符': 'v',
        'jpex_sub': 'w', '読点和感嘆符（亜種）': 'w', '読点和感嘆符亜種': 'w',
        'jpqu': 'x', '読点和疑問符': 'x',
        'jpqu_sub': 'y', '読点和疑問符（亜種）': 'y', '読点和疑問符亜種': 'y',
        'labyrinth_qu': 'z', '迷宮疑問符': 'z',
        // A-Z
        'minimal_ex': 'A', '極小感嘆符': 'A',
        'multilayer_qu': 'B', '多層疑問符': 'B',
        'node_labo': 'C', 'NodeLABO': 'C',
        'oblivion_qu': 'D', '忘却疑問符': 'D',
        'opaque_qu': 'E', '不透明疑問符': 'E',
        'overlook': 'F', '俯瞰符': 'F',
        'pc_ultimate_right': 'G', 'PCの究極権利': 'G',
        'permeation_qu': 'H', '浸透疑問符': 'H',
        'resonance_ex': 'I', '共鳴感嘆符': 'I',
        'silent_ex': 'J', '静寂感嘆符': 'J',
        'simmer': 'K', '似煮符': 'K',
        'super_qu': 'L', '超疑問符': 'L',
        'super_qu_sub': 'M', '超疑問符（亜種）': 'M', '超疑問符亜種': 'M',
        'thanks_ex': 'N', '感嘆謝符': 'N',
        'tired_ex': 'O', '疲感嘆符': 'O',
        'transparent_qu': 'P', '透過疑問符': 'P',
        'truth_key': 'Q', '真実_of_鍵': 'Q', '真実of鍵': 'Q',
        'unfinish_qu': 'R', '未完疑問符': 'R',
        'world_symbol_org': 'S', '世界記号統一団体': 'S',
        'z_sand': 'T', 'ゼット_サンド': 'T', 'ゼットサンド': 'T',
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
                    return /:([^\s:]+):/.test(node.nodeValue)
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
        const regex = /:([^\s:]+):/g;
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
            span.style.fontSize = '2em';
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
