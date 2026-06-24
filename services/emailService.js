require("dotenv").config();
const nodemailer = require("nodemailer");

/* ================= EMAIL CONFIG ================= */
const cleanEnv = (value = "") => String(value).trim().replace(/^"|"$/g, "");

const getEmailConfig = () => {
  const host = cleanEnv(process.env.EMAIL_HOST);
  const port = Number(cleanEnv(process.env.EMAIL_PORT));
  const secure = cleanEnv(process.env.EMAIL_SECURE) === "true";
  const user = cleanEnv(process.env.EMAIL_USER);
  const pass = cleanEnv(process.env.EMAIL_PASS).replace(/\s+/g, "");
    let from = cleanEnv(process.env.EMAIL_FROM) || `Egypt Holiday <${user}>`;

  if (host === "smtp.gmail.com" && !from.includes(user)) {
    from = `Egypt Holiday Travel <${user}>`;
  }

  if (!host || !port || !user || !pass) {
    const error = new Error("Email configuration is missing in Backend/.env.");
    error.code = "EMAIL_CONFIG_MISSING";
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user)) {
    const error = new Error(
      "EMAIL_USER must be a full email address, for example name@gmail.com."
    );
    error.code = "EMAIL_CONFIG_INVALID";
    throw error;
  }

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
  };
};

const createTransporter = () => {
  const config = getEmailConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/* ================= SEND EMAIL ================= */
const sendEmail = async (to, subject, html) => {
  const config = getEmailConfig();
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: config.from,
    to,
    subject,
    html,
  });

  console.log("Email sent:", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });
  return info;
};

module.exports = { sendEmail };
