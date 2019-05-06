const chalk = require('chalk').default;
const nodemailer = require('nodemailer');

async function setup () {
  if (!process.env.SMTP_DEFAULT_HOST) {
    let account = await nodemailer.createTestAccount();
    return {
      previews: true,
      connection: {
        secure: false,
        host: 'smtp.ethereal.email',
        auth: {
          user: account.user, // generated ethereal user
          pass: account.pass, // generated ethereal password
        },
      },
    };
  } else {
    return {
      previews: false,
      connection: {
        secure: true,
        host: process.env.SMTP_DEFAULT_HOST,
        auth: {
          user: process.env.SMTP_DEFAULT_USER,
          pass: process.env.SMTP_DEFAULT_PASSWORD,
        },
      },
    };
  }
}

async function createTransport () {
  const { connection, previews } = await setup();
  const system = '"System" <no-reply@example.com>';
  const from = process.env.SMTP_DEFAULT_FROM || system;
  const transport = nodemailer.createTransport(connection, { from });
  const wrapper = {
    sendMail: async () => true,
  };
  transport.verify().then(() => {
    console.log(
      chalk.yellow('Using SMTP transport for emails from: %s %s'), from, previews
        ? chalk.green('(Ethereal)')
        : chalk.red('(Live)'),
    );
    wrapper.sendMail = async (...args) => transport.sendMail(...args)
      .then(info => console.log('Message sent: %s', info.messageId) || info)
      .then(info => previews ? console.log(
        'Preview URL: %s',
        chalk.blueBright(nodemailer.getTestMessageUrl(info)),
      ) || info : info);
  }).catch(console.error);
  return wrapper;
}

module.exports = createTransport();
