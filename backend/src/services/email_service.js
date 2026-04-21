// nodemailer setup — tried to keep this simple, might tweak later if needed
const nodemailer = require("nodemailer");

// caching this so we don't recreate transporter every time
let transporterPromise;

async function getTransporter() {
    // using ethereal for testing (make sense for testing since no extra baggage like they would be with gmail etc) 
    if (!transporterPromise) {
        transporterPromise = nodemailer.createTestAccount().then((testAccount) => {
            return nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        });
    }
    return transporterPromise;
}

// main function for sending emails
const sendEmail = async (options) => {
    // destructuring, i have purposefully left it loose if anyone wants to add more fields
    const { to, subject, text, html } = options;

    const transporter = await getTransporter();

    const info = await transporter.sendMail ({
        from: '"HexW0rms" <no-reply@hexworms.local>', // maybe make this configurable later?
        to: to,
        subject: subject,
        text: text,
        html: html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    // logging its not a proper logger but more than enough than we need 
    console.log("Email sent:", info.messageId);
    if (previewUrl) {
        console.log("Preview URL:", previewUrl);
    } else {
        console.log("No preview URL (not ethereal?)");
    }

    return {
        messageId: info.messageId,
        previewUrl: previewUrl,
    };

    };

    module.exports = {
    sendEmail,
    };