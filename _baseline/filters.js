import { markdownFilter } from "./filters/markdown.js";
import relatedPostsFilter from "./filters/related-posts.js";
import isStringFilter from "./filters/isString.js";
import inlinePostCSS from "./modules/assets-postcss/filters/inline-postcss.js";
import inlineESbuild from "./modules/assets-esbuild/filters/inline-esbuild.js";

export default {
	markdownFilter,
	relatedPostsFilter,
	inlinePostCSS,
	isStringFilter,
	inlineESbuild
}
