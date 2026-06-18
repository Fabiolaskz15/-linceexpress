import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function borrarUsuariosPrueba() {

    try {

        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            ssl: process.env.DB_SSL === "true"
                ? {
                    rejectUnauthorized: false
                }
                : false
        });

        console.log("🗄️ Conectado a Aiven MySQL");

        const [usuarios] = await db.query(`
            SELECT
                id,
                nombre,
                correo,
                verificado
            FROM usuarios
            WHERE correo LIKE '%+prueba%@gmail.com'
            ORDER BY id DESC;
        `);

        if (usuarios.length === 0) {
            console.log("✅ No hay usuarios de prueba para borrar");
            await db.end();
            return;
        }

        console.log("👤 Usuarios de prueba encontrados:");
        console.table(usuarios);

        const [resultado] = await db.query(`
            DELETE FROM usuarios
            WHERE correo LIKE '%+prueba%@gmail.com';
        `);

        console.log(
            "✅ Usuarios eliminados:",
            resultado.affectedRows
        );

        await db.end();

    } catch (error) {

        console.error("❌ Error:", error);

    }

}

borrarUsuariosPrueba();