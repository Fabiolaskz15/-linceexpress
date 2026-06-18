import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000
});

transporter.verify((error, success) => {

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