const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const smtpPort = Number(process.env.SMTP_PORT || 587);
const requiredSettings = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
const missingSettings = requiredSettings.filter((key) => !process.env[key]);

if (missingSettings.length) {
    throw new Error(`Missing email configuration: ${missingSettings.join(", ")}`);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : smtpPort === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

const sendEmail = async (to, subject, text, html) => {
    try {
        return await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || "Team Flow Manager"}" <${process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Error sending email:", { code: error.code, command: error.command, message: error.message });
        throw new Error("Email sending failed");
    }
};

sendEmail.verifyConnection = () => transporter.verify();
module.exports = sendEmail;
