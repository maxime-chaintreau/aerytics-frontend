import type { Plugin } from "vite";

/**
 * Adds <link rel="preload"> tags for font files in the built index.html
 *
 * @param patterns regexes matched against output file names
 */
export function preloadFonts(patterns: RegExp[]): Plugin {
  let base = "/";

  return {
    name: "preload-fonts",
    apply: "build",

    configResolved(config) {
      base = config.base;
    },

    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((file) => patterns.some((pattern) => pattern.test(file)));

        if (files.length === 0) {
          console.warn("[preload-fonts] no font file matched, preload skipped");
        }

        return files.map((file) => ({
          tag: "link",
          injectTo: "head" as const,
          attrs: {
            rel: "preload",
            as: "font",
            type: "font/woff2",
            href: `${base}${file}`,
            crossorigin: "",
          },
        }));
      },
    },
  };
}
