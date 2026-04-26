const nodemailer = require("nodemailer");

let transporterPromise;
const DEFAULT_EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS) || 10000;

function createTimeoutError(timeoutMs) {
  const error = new Error(`Email sending timed out after ${timeoutMs}ms.`);
  error.code = "EMAIL_TIMEOUT";
  return error;
}

async function withTimeout(promise, timeoutMs) {
  let timeoutHandle;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(createTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTestAccount().then((testAccount) =>
      nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        connectionTimeout: DEFAULT_EMAIL_TIMEOUT_MS,
        greetingTimeout: DEFAULT_EMAIL_TIMEOUT_MS,
        socketTimeout: DEFAULT_EMAIL_TIMEOUT_MS,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    );
  }

  try {
    return await transporterPromise;
  } catch (error) {
    transporterPromise = null;
    throw error;
  }
}

const sendEmail = async (options, { timeoutMs = DEFAULT_EMAIL_TIMEOUT_MS } = {}) => {
  const { to, subject, text, html } = options;

  const emailTask = (async () => {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: '"HexW0rms" <no-reply@hexworms.local>',
      to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log("Email sent:", info.messageId);
    if (previewUrl) {
      console.log("Preview URL:", previewUrl);
    } else {
      console.log("No preview URL (not ethereal?)");
    }

    return {
      messageId: info.messageId,
      previewUrl,
    };
  })();

  return withTimeout(emailTask, timeoutMs);
};

module.exports = {
  sendEmail,
  DEFAULT_EMAIL_TIMEOUT_MS,
};
