/* Site config */
import "dotenv/config";

import debug from "./_11ty/debug.js";
import filters from "./_11ty/filters.js";
import plugins from "./_11ty/plugins.js";
import shortcodes from "./_11ty/shortcodes.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function (eleventyConfig) {
	// Debug filters.
	eleventyConfig.addFilter("inspect", debug.inspect);
	eleventyConfig.addFilter("json", debug.json);
	eleventyConfig.addFilter("keys", debug.keys);

	// Filters.
	eleventyConfig.addFilter("markdown", filters.markdownFilter);
	eleventyConfig.addFilter("relatedPosts", filters.relatedPostsFilter);
	eleventyConfig.addFilter("inlinePostCSS", filters.inlinePostCSS);

	// Passthrough copy.
	eleventyConfig.addPassthroughCopy({ "./src/static": "/" });

	// Plugins.
	eleventyConfig.addPlugin(plugins.EleventyHtmlBasePlugin, { baseHref: process.env.URL || "/" });
	eleventyConfig.addPlugin(plugins.assetsPostCSS);
	eleventyConfig.addPlugin(plugins.assetsESBuild);

	// Shortcodes.
	eleventyConfig.addShortcode("image", shortcodes.imageShortcode);

	// Watch target.
	eleventyConfig.addWatchTarget('./src/assets/**/*.{css,js,svg,png,jpeg}');

	return {
		dir: {
			input: "src",
			output: "dist",
			data: "_data",
			includes: "_includes"
		},
		htmlTemplateEngine: "njk",
		markdownTemplateEngine: "njk",
		templateFormats: ["html", "njk", "md"]
	}
};
