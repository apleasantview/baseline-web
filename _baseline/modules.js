// Eleventy
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

// Custom plugins
import assetsPostCSS from "./modules/assets-postcss/plugins/assets-postcss.js";
import assetsESBuild from "./modules/assets-esbuild/plugins/assets-esbuild.js";
import coreNavigator from "./modules/core-navigator/plugins/core-navigator.js";

export default {
	EleventyHtmlBasePlugin,
	assetsPostCSS,
	assetsESBuild,
	coreNavigator
};
