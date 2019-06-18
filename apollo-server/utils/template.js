const fs = require('fs');
const path = require('path');

module.exports = {};

const variants = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
  'link',
];

if (process.env.NODE_ENV === 'production') {
  const templateFile = path.resolve(__dirname, '../../dist/index.email.html');
  const makeEmailContext = ({ subject, body }) => ({
    email: {
      subject,
      body,
    },
  });
  module.exports.makeContext = makeEmailContext;
  module.exports.template = fs.readFileSync(templateFile, 'utf8');
} else {
  const bundle = require('../../package');
  const logoFile = path.resolve(__dirname, '../../src/assets/varda-logo.svg');
  const logoSource = fs.readFileSync(logoFile, 'utf8');
  const logoBase64 = Buffer.from(logoSource).toString('base64');
  const templateFile = path.resolve(__dirname, '../../templates/index.static.html');
  const makeStaticContext = ({ subject, body }) => ({
    params: {
      generator: {
        name: bundle.name,
        version: bundle.version,
      },
      logo: `<img src="data:image/svg+xml;base64,${logoBase64}" alt="Logo"/>`,
      credits: `${bundle.name} v${bundle.version}`,
      title: subject,
      content: body,
    },
  });
  module.exports.makeContext = makeStaticContext;
  module.exports.template = fs.readFileSync(templateFile, 'utf8');
}

const htmlEntities = function (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const parseParam = function (param, fallback = '') {
  if (typeof param === 'function') {
    param = param();
  }
  if (Array.isArray(param)) {
    param = param.filter(p => typeof p === 'string');
  }
  if (param
    && typeof param !== 'function'
    && String(param).length
    && String(param) !== '[object Object]'
  ) {
    param = htmlEntities(param);
  } else {
    param = fallback;
  }
  return param;
};

const parseTemplate = function (
  context = {},
  template = module.exports.template,
) {
  let match;
  let tokens = new Set();
  const re = /<%=\s*([a-zA-Z_][a-zA-Z0-9_]*([.][a-zA-Z_][a-zA-Z0-9_]*)*)\s*%>/g;
  while ((match = re.exec(template)) !== null) {
    tokens.add(match[1]);
  }
  let replacements = Array.from(tokens.values()).map(v => ({
    token: v,
    value: v.split('.').reduce((ctx, k) => ctx && ctx[k] || undefined, context),
  }));
  replacements.forEach(r => {
    template = template.replace(
      /** @type {RegExp} */ (new RegExp(`<%=\\s*${r.token}\\s*%>`, 'g')),
      (r.value !== undefined ? String(r.value) : ''),
    );
  });
  return template;
};

const generateEmail = function ({ subject, paragraphs, buttons }) {
  subject = parseParam(subject, 'System Notification');
  if (!Array.isArray(paragraphs)) {
    paragraphs = [paragraphs];
  }
  paragraphs = paragraphs.map(p => parseParam(p)).filter(p => p.length);
  if (!paragraphs.length) {
    throw new Error('No content provided for email template!');
  }
  paragraphs = paragraphs.map(p => `<p>${p}</p>`);
  if (!Array.isArray(buttons)) {
    buttons = [buttons];
  }
  buttons = buttons.map(b => ({
    href: b && typeof b.href === 'string' ? b.href : '',
    title: b && typeof b.title === 'string' ? b.title : '',
    variant: b && variants.includes(b.variant) ? b.variant : 'primary',
  })).filter(b => b.href.length && b.title.length);
  buttons = buttons.map(b => ''
    + `<a role="button" class="btn btn-${b.variant} mb-3 mt-1 w-100" href="${b.href}">`
    + `<span>${b.title}</span>`
    + '</a>',
  );
  return parseTemplate(module.exports.makeContext({
      body: paragraphs.join('\n') + buttons.join('\n'),
      subject,
    }),
  );
};

module.exports.generateEmail = generateEmail;
module.exports.parseTemplate = parseTemplate;
