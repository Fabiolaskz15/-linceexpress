import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
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

db.connect((error) => {

    if (error) {

        console.error("❌ Error MySQL:", error);

        return;

    }

    console.log("🗄️ MySQL conectado correctamente");

});

export default db;