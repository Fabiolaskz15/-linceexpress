import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function crearTablas() {

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

        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                correo VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                token_verificacion VARCHAR(255),
                token_recuperacion VARCHAR(255),
                verificado TINYINT(1) DEFAULT 0,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                telefono VARCHAR(20),
                carrera VARCHAR(100),
                descripcion TEXT
            );
        `);

        console.log("✅ Tabla usuarios creada");

        await db.query(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(150) NOT NULL,
                descripcion TEXT NOT NULL,
                precio DECIMAL(10,2) NOT NULL,
                imagen LONGTEXT NOT NULL,
                ubicacion VARCHAR(100) NOT NULL,
                id_vendedor INT NOT NULL,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (id_vendedor)
                REFERENCES usuarios(id)
                ON DELETE CASCADE
            );
        `);

        console.log("✅ Tabla productos creada");

        await db.end();

        console.log("🎉 Base de datos lista para LinceExpress");

    } catch (error) {

        console.error("❌ Error al crear tablas:", error);

    }

}

crearTablas();