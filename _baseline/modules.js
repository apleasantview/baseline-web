// Eleventy plugins
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

// Custom plugins
import assetsManager from "./modules/assets-manager/plugins/assets-manager.js";
import assetsPostCSS from "./modules/assets-postcss/plugins/assets-postcss.js";
import assetsESBuild from "./modules/assets-esbuild/plugins/assets-esbuild.js";
import navigatorCore from "./modules/navigator-core/plugins/navigator-core.js";
import navigatorContext from "./modules/navigator-context/plugins/navigator-context.js";

export default {
	EleventyHtmlBasePlugin,
	syntaxHighlight,
	assetsManager,
	assetsPostCSS,
	assetsESBuild,
	navigatorCore,
	navigatorContext
};
