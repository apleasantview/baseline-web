import { markdownFilter } from "./filters/markdown.js";
import relatedPostsFilter from "./filters/related-posts.js";
import inlinePostCSS from "./modules/assets-postcss/filters/inline-postcss.js";

export default {
	markdownFilter,
	relatedPostsFilter,
	inlinePostCSS
}
