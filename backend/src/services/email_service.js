const nodemailer = require("nodemailer");
const sendgridMail = require("@sendgrid/mail");

let transporterPromise;
const DEFAULT_EMAIL_TIMEOUT_MS = Number(process.env.EMAIL_SEND_TIMEOUT_MS) || 10000;
const EMAIL_FROM = process.env.EMAIL_FROM || '"HexW0rms" <no-reply@hexworms.local>';

function getProviderMode() {
  if (process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
    return "sendgrid";
  }

  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM
  ) {
    return "smtp";
  }

  return "ethereal";
}

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
    const providerMode = getProviderMode();

    if (providerMode === "smtp") {
      transporterPromise = Promise.resolve(
        nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
          connectionTimeout: DEFAULT_EMAIL_TIMEOUT_MS,
          greetingTimeout: DEFAULT_EMAIL_TIMEOUT_MS,
          socketTimeout: DEFAULT_EMAIL_TIMEOUT_MS,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
      );
    } else {
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
  const providerMode = getProviderMode();

  const emailTask =
    providerMode === "sendgrid"
      ? (async () => {
          sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

          const [response] = await sendgridMail.send({
            to,
            from: EMAIL_FROM,
            subject,
            text,
            html,
          });

          const messageId =
            response?.headers?.["x-message-id"] ||
            response?.headers?.["X-Message-Id"] ||
            null;

          console.log(`Email sent via SendGrid: ${messageId || "accepted"}`);

          return {
            messageId,
            previewUrl: null,
          };
        })()
      : (async () => {
          const transporter = await getTransporter();
          const info = await transporter.sendMail({
            from: EMAIL_FROM,
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
            console.log("No preview URL (non-ethereal SMTP)");
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
