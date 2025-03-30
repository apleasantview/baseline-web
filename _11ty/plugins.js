// Eleventy
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

// Custom plugins
import assetsPostCSS from "./plugins/assets-postcss.js";
import assetsESBuild from "./plugins/assets-esbuild.js";

export default {
	EleventyHtmlBasePlugin,
	assetsPostCSS,
	assetsESBuild
};
