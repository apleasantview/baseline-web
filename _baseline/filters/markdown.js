import markdownit from 'markdown-it';

const md = markdownit({
	html: true
});

export const markdownFilter = (string) => {
  return md.renderInline(string);
};
