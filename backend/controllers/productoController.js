import db from "../config/db.js";

function convertirImagenABase64(file) {

    if (!file) {
        return null;
    }

    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

}

export const crearProducto = (req, res) => {

    const {
        nombre,
        descripcion,
        precio,
        ubicacion,
        id_vendedor
    } = req.body;

    const imagen =
        convertirImagenABase64(req.file);

    if (
        !nombre ||
        !descripcion ||
        !precio ||
        !ubicacion ||
        !id_vendedor ||
        !imagen
    ) {

        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });

    }

    const sql = `
    INSERT INTO productos
    (
        nombre,
        descripcion,
        precio,
        imagen,
        ubicacion,
        id_vendedor
    )
    VALUES
    (
        ?, ?, ?, ?, ?, ?
    )
    `;

    db.query(
        sql,
        [
            nombre,
            descripcion,
            precio,
            imagen,
            ubicacion,
            id_vendedor
        ],
        (error) => {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    mensaje: "Error al guardar producto"
                });

            }

            return res.status(201).json({
                mensaje: "Producto publicado correctamente"
            });

        }
    );

};

export const obtenerProductos = (req, res) => {

    const sql = `
    SELECT
        productos.*,
        usuarios.nombre AS vendedor,
        usuarios.correo,
        usuarios.telefono
    FROM productos
    INNER JOIN usuarios
        ON productos.id_vendedor = usuarios.id
    ORDER BY productos.id DESC
    `;

    db.query(sql, (error, resultados) => {

        if (error) {

            console.error(error);

            return res.status(500).json({
                mensaje: "Error al obtener productos"
            });

        }

        return res.status(200).json(resultados);

    });

};

export const actualizarProducto = (req, res) => {

    const { id } = req.params;

    const {
        nombre,
        descripcion,
        precio,
        ubicacion,
        id_vendedor
    } = req.body;

    const nuevaImagen =
        convertirImagenABase64(req.file);

    if (
        !nombre ||
        !descripcion ||
        !precio ||
        !ubicacion ||
        !id_vendedor
    ) {

        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });

    }

    let sql = "";
    let valores = [];

    if (nuevaImagen) {

        sql = `
        UPDATE productos
        SET
            nombre = ?,
            descripcion = ?,
            precio = ?,
            ubicacion = ?,
            imagen = ?
        WHERE id = ? AND id_vendedor = ?
        `;

        valores = [
            nombre,
            descripcion,
            precio,
            ubicacion,
            nuevaImagen,
            id,
            id_vendedor
        ];

    } else {

        sql = `
        UPDATE productos
        SET
            nombre = ?,
            descripcion = ?,
            precio = ?,
            ubicacion = ?
        WHERE id = ? AND id_vendedor = ?
        `;

        valores = [
            nombre,
            descripcion,
            precio,
            ubicacion,
            id,
            id_vendedor
        ];

    }

    db.query(
        sql,
        valores,
        (error, resultado) => {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    mensaje: "Error al actualizar producto"
                });

            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: "Producto no encontrado o no pertenece a este usuario"
                });

            }

            return res.json({
                mensaje: "Producto actualizado correctamente"
            });

        }
    );

};

export const eliminarProducto = (req, res) => {

    const { id } = req.params;

    const { id_vendedor } = req.body;

    if (!id_vendedor) {

        return res.status(400).json({
            mensaje: "Falta el usuario vendedor"
        });

    }

    const sql = `
    DELETE FROM productos
    WHERE id = ? AND id_vendedor = ?
    `;

    db.query(
        sql,
        [id, id_vendedor],
        (error, resultado) => {

            if (error) {

                console.error(error);

                return res.status(500).json({
                    mensaje: "Error al eliminar producto"
                });

            }

            if (resultado.affectedRows === 0) {

                return res.status(404).json({
                    mensaje: "Producto no encontrado o no pertenece a este usuario"
                });

            }

            return res.json({
                mensaje: "Producto eliminado correctamente"
            });

        }
    );

};