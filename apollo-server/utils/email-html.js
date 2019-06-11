const fs = require('fs');
const path = require('path');
const bundle = require('../../package.json');

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
const logoFile = path.resolve(__dirname, '../../src/assets/varda-logo.svg');
const templateFile = path.resolve(__dirname, 'index.email.html');
const emailTemplate = fs.readFileSync(templateFile, 'utf8');
const logoSource = Buffer.from(
  fs.readFileSync(logoFile, 'utf8').replace('/* INJECT_INLINE_CSS */', `
            svg.app-logo {
                background: whitesmoke;
            }
            svg g#brand-logo {
                transform: translate(6.25%, 6.25%) scale(0.875, 0.875);
            }`),
).toString('base64');

const logo = `<img src="data:image/svg+xml;base64,${logoSource}" alt="Logo"/>`;

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

const parseTemplate = function (context = {}, template = emailTemplate) {
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
    + `<button type="button" class="btn btn-${b.variant} mb-3 mt-1 w-100">`
    + `<span>${b.title}</span>`
    + '</button>',
  );
  return parseTemplate({
    email: {
      logo: logo,
      subject: subject,
      body: paragraphs.join('\n') + buttons.join('\n'),
      credits: `${bundle.name} v${bundle.version}`,
    },
  });
};

module.exports = {
  generateEmail,
  parseTemplate,
};
