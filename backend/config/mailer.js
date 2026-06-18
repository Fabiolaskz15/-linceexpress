import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error) => {

    if (error) {

        console.error(
            "❌ Error configurando correo:",
            error
        );

    } else {

        console.log(
            "📧 Correo configurado correctamente"
        );

    }

});

export default transporter;