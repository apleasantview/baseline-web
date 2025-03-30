import "dotenv/config";

import debug from "./_11ty/debug.js";
import plugins from "./_11ty/plugins.js";

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default async function(eleventyConfig) {
	// Debug filters.
	eleventyConfig.addFilter("inspect", debug.inspect);
	eleventyConfig.addFilter("json", debug.json);
	eleventyConfig.addFilter("keys", debug.keys);

	eleventyConfig.addPassthroughCopy({"./src/static": "/"});

	eleventyConfig.addPlugin(plugins.EleventyHtmlBasePlugin, {
		baseHref: process.env.URL || "http://localhost:8080/"
	});

	eleventyConfig.addPlugin(plugins.assetsPostCSS);
	eleventyConfig.addPlugin(plugins.assetsESBuild);

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
