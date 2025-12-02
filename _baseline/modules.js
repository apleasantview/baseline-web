// Eleventy
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";

// Custom plugins
import assetsPostCSS from "./modules/assets-postcss/plugins/assets-postcss.js";
import assetsESBuild from "./modules/assets-esbuild/plugins/assets-esbuild.js";
import navigatorCore from "./modules/navigator-core/plugins/navigator-core.js";
import navigatorContext from "./modules/navigator-context/plugins/navigator-context.js";

export default {
	EleventyHtmlBasePlugin,
	assetsPostCSS,
	assetsESBuild,
	navigatorCore,
	navigatorContext
};
