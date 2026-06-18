import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function verBaseDatos() {

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
        console.log("📌 Base de datos:", process.env.DB_NAME);
        console.log("🌐 Host:", process.env.DB_HOST);

        const [usuarios] = await db.query(`
            SELECT
                id,
                nombre,
                correo,
                verificado,
                telefono,
                carrera,
                creado_en
            FROM usuarios
            ORDER BY id DESC;
        `);

        console.log("\n👤 TABLA USUARIOS");
        console.table(usuarios);

        const [productos] = await db.query(`
            SELECT
                productos.id,
                productos.nombre,
                productos.precio,
                productos.ubicacion,
                usuarios.nombre AS vendedor,
                productos.creado_en
            FROM productos
            INNER JOIN usuarios
                ON productos.id_vendedor = usuarios.id
            ORDER BY productos.id DESC;
        `);

        console.log("\n📦 TABLA PRODUCTOS");
        console.table(productos);

        await db.end();

    } catch (error) {

        console.error("❌ Error al consultar la base:", error);

    }

}

verBaseDatos();