import dotenv from "dotenv";

dotenv.config();

const transporter = {

    async sendMail({ to, subject, html }) {

        if (!process.env.BREVO_API_KEY) {
            throw new Error(
                "Falta BREVO_API_KEY en variables de entorno"
            );
        }

        const senderEmail =
            process.env.BREVO_SENDER_EMAIL ||
            process.env.EMAIL_USER;

        if (!senderEmail) {
            throw new Error(
                "Falta BREVO_SENDER_EMAIL o EMAIL_USER"
            );
        }

        const respuesta = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: {
                        name: "LinceExpress",
                        email: senderEmail
                    },
                    to: [
                        {
                            email: to
                        }
                    ],
                    subject: subject,
                    htmlContent: html
                })
            }
        );

        const texto =
            await respuesta.text();

        let datos = {};

        try {
            datos = JSON.parse(texto);
        } catch {
            datos = {
                mensaje: texto
            };
        }

        if (!respuesta.ok) {
            console.error(
                "❌ Error Brevo:",
                datos
            );

            throw new Error(
                datos.message ||
                datos.mensaje ||
                "Error al enviar correo con Brevo"
            );
        }

        console.log(
            "📧 Correo enviado con Brevo a:",
            to
        );

        return datos;

    }

};

export default transporter;