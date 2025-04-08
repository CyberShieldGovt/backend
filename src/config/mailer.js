import nodemailer from 'nodemailer';


console.log("📩 Setting up email transporter...");
console.log("➡️ Email User:", process.env.EMAIL_USER);
console.log("➡️ Email Host: smtpout.secureserver.net");
console.log("➡️ Email Port: 465");


const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: "support@cybertrinetra.com",
      pass: "Csr@ybertrinetra_2@2024",
    },
    authMethod: "LOGIN",
    // logger: true,
    // debug: true,
  });

transporter.verify(function (error, success) {
    if (error) {
        console.log('Email setup error:', error);
    } else {
        console.log('Email server is ready to take messages');
    }
});

export default transporter;