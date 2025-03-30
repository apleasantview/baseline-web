import postcssImport from "postcss-import";
import postcssPresetEnv from "postcss-preset-env";
import cssnano from "cssnano"; // Import cssnano for minification

const isProd = process.env.ELEVENTY_ENV === "production" || false;
const productionPlugins = [];

if (isProd) {
	productionPlugins.push(cssnano);
}

const config = {
	plugins: [postcssImport, postcssPresetEnv, ...productionPlugins],
	map: !isProd
};

export default config;
