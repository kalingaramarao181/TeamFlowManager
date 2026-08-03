const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, 
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"Team Flow Manager" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;
