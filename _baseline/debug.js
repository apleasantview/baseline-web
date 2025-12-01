import { inspect } from "node:util";

// by pdehaan - https://github.com/pdehaan/eleventy-plugin-debug
const debugOptions = Object.assign({
  space: 0
});

function json(obj, space = debugOptions.space) {
  return JSON.stringify(obj, null, space);
}

function keys(obj) {
  return Object.keys(obj).sort();
}

function context() {
  return `<pre>${inspect(this.ctx, { depth: 0, colors: false })}</pre>`;
}

export default { inspect, json, keys, context };
