const nodemailer = require("nodemailer");

const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
});

exports.sendEmail = (to, subject, text) => {
    return transporter.sendMail({
        from: smtpUser,
        to,
        subject,
        text,
    });
};

exports.sendHTMLEmail = (to, subject, htmlContent) => {
  return transporter.sendMail({
    from: `"Beedata Technologies" <${smtpUser}>`,
    to,
    subject,
    html: htmlContent,
  });
};