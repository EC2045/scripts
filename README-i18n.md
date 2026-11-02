# Site translations and typography

Each site owns its `i18n.js` loader and `lang/ja.lang` / `lang/en.lang` files. Translation data is loaded relative to the loader URL, so it works on project Pages and custom domains. The shared `i18n.js` is the maintenance source; copy changes into the site loaders together.

The UTF-8 format is `key=value`, with `#` and `;` comments. Escape backslashes, equals signs, and line breaks as `\\`, `\=`, and `\n`. Ordinary keys match whitespace-normalised source text. `@intro` contains the site description. `data-i18n-html` explicitly marks trusted, repository-owned translation blocks; ordinary text is applied with text nodes.

Existing key-based language systems keep their own root `.lang` files. The portal has a dedicated loader in `src/locales.js`, with data in its own `lang/` folder. Symbolencyclopedia keeps its existing six language files.

Rittsu’s Blog additionally has `en-x-es.lang`: a fictional Spanish-inspired spelling, not Spanish translation. Initial pronounced h becomes j (`have → jave`, `home → jome`); ph becomes f (`photo → foto`); silent initial h is retained. The original/corrected buttons switch these spellings without replacing Japanese content.

`font.js` defaults to the site’s CSS font stacks. `default` no longer forces the 2045 alphabet; `onva` is the explicit custom-font choice. Font controls and language controls remain independent.
