const API = window.API_URL;

const usuario = JSON.parse(
    localStorage.getItem("usuario")
);

if (!usuario) {
    window.location.href = "login.html";
}

document.getElementById("usuarioNombre").innerText =
    "👤 " + usuario.nombre;

let productosGlobales = [];
let productoEditandoId = null;

function obtenerTelefonoWhatsApp(telefono) {

    if (!telefono) {
        return "";
    }

    const limpio = telefono
        .toString()
        .replace(/\D/g, "");

    if (!limpio) {
        return "";
    }

    if (limpio.startsWith("52")) {
        return limpio;
    }

    return "52" + limpio;

}

function copiarCorreo(correo) {

    navigator.clipboard.writeText(correo);

    alert("📧 Correo copiado: " + correo);

}

function mostrarMensajeLince(mensaje) {

    document.getElementById("mensajeLince").innerText =
        mensaje;

}

async function cargarProductos() {

    try {

        const respuesta = await fetch(
            `${API}/api/productos`
        );

        const productos = await respuesta.json();

        productosGlobales = productos;

        mostrarProductos(productosGlobales);

    } catch (error) {

        console.error(error);

        alert("Error al cargar productos");

    }

}

function mostrarProductos(productos) {

    const lista = document.getElementById(
        "lista-productos"
    );

    lista.innerHTML = "";

    if (productos.length === 0) {

        lista.innerHTML =
            "<p>No se encontraron productos.</p>";

        return;

    }

    productos.forEach(producto => {

        const telefonoWhatsApp =
            obtenerTelefonoWhatsApp(
                producto.telefono
            );

        const mensajeWhatsApp =
            encodeURIComponent(
                `Hola ${producto.vendedor}, vi tu producto "${producto.nombre}" en LinceExpress. ¿Sigue disponible?`
            );

        const botonWhatsApp = telefonoWhatsApp
            ? `
                <a
                    href="https://wa.me/${telefonoWhatsApp}?text=${mensajeWhatsApp}"
                    target="_blank"
                    style="
                        background:#22C55E;
                        color:white;
                        padding:9px 12px;
                        border-radius:8px;
                        text-decoration:none;
                        font-weight:bold;
                        display:inline-block;
                    "
                >
                    📲 WhatsApp
                </a>
            `
            : `
                <span
                    style="
                        background:#94A3B8;
                        color:white;
                        padding:9px 12px;
                        border-radius:8px;
                        font-weight:bold;
                        display:inline-block;
                    "
                >
                    📲 Sin WhatsApp
                </span>
            `;

        const botonesPropietario =
            producto.id_vendedor == usuario.id
            ? `
                <div
                    style="
                    margin-top:12px;
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                    "
                >

                    <button
                        onclick="editarProducto(${producto.id})"
                        style="
                        background:#F59E0B;
                        color:white;
                        padding:9px 12px;
                        border:none;
                        border-radius:8px;
                        font-weight:bold;
                        cursor:pointer;
                        "
                    >
                        ✏️ Editar
                    </button>

                    <button
                        onclick="eliminarProducto(${producto.id})"
                        style="
                        background:#EF4444;
                        color:white;
                        padding:9px 12px;
                        border:none;
                        border-radius:8px;
                        font-weight:bold;
                        cursor:pointer;
                        "
                    >
                        🗑️ Eliminar
                    </button>

                </div>
            `
            : "";

        lista.innerHTML += `
            <div class="card">

                <img
                    src="${producto.imagen}"
                    style="
                        width:100%;
                        height:220px;
                        object-fit:cover;
                    "
                >

                <div style="padding:15px">

                    <h3>${producto.nombre}</h3>

                    <p>${producto.descripcion}</p>

                    <p>💰 $${producto.precio}</p>

                    <p>📍 ${producto.ubicacion}</p>

                    <p>👤 ${producto.vendedor}</p>

                    <div
                        style="
                            margin-top:12px;
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            onclick="copiarCorreo('${producto.correo}')"
                            style="
                                background:#3B82F6;
                                color:white;
                                padding:9px 12px;
                                border-radius:8px;
                                border:none;
                                font-weight:bold;
                                cursor:pointer;
                                display:inline-block;
                            "
                        >
                            📧 Copiar correo
                        </button>

                        ${botonWhatsApp}

                    </div>

                    ${botonesPropietario}

                </div>

            </div>
        `;

    });

}

async function publicarProducto() {

    const nombre =
        document.getElementById("nombre").value;

    const descripcion =
        document.getElementById("descripcion").value;

    const precio =
        document.getElementById("precio").value;

    const ubicacion =
        document.getElementById("ubicacion").value;

    const imagen =
        document.getElementById("imagen").files[0];

    if (
        !nombre ||
        !descripcion ||
        !precio ||
        !ubicacion
    ) {

        alert("Llena todos los campos");

        return;

    }

    if (!productoEditandoId && !imagen) {

        alert("Selecciona una imagen");

        return;

    }

    const formData = new FormData();

    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("precio", precio);
    formData.append("ubicacion", ubicacion);
    formData.append("id_vendedor", usuario.id);

    if (imagen) {
        formData.append("imagen", imagen);
    }

    try {

        let url = `${API}/api/productos`;
        let metodo = "POST";

        if (productoEditandoId) {
            url = `${API}/api/productos/${productoEditandoId}`;
            metodo = "PUT";
        }

        const respuesta = await fetch(
            url,
            {
                method: metodo,
                body: formData
            }
        );

        const datos = await respuesta.json();

        alert(datos.mensaje);

        limpiarFormulario();

        cargarProductos();

    } catch (error) {

        console.error(error);

        alert("Error al guardar producto");

    }

}

function editarProducto(id) {

    const producto = productosGlobales.find(
        p => p.id == id
    );

    if (!producto) {
        alert("Producto no encontrado");
        return;
    }

    productoEditandoId = producto.id;

    document.getElementById("nombre").value =
        producto.nombre;

    document.getElementById("descripcion").value =
        producto.descripcion;

    document.getElementById("precio").value =
        producto.precio;

    document.getElementById("ubicacion").value =
        producto.ubicacion;

    document.getElementById("tituloFormulario").innerText =
        "✏️ Editar producto";

    document.getElementById("btnPublicar").innerText =
        "Guardar cambios";

    document.getElementById("btnCancelarEdicion").style.display =
        "block";

    const vistaPrevia =
        document.getElementById("vistaPrevia");

    vistaPrevia.src =
        producto.imagen;

    vistaPrevia.style.display =
        "block";

    mostrarMensajeLince(
        "🐾 Estás editando un producto. Puedes cambiar los datos o seleccionar otra imagen."
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

async function eliminarProducto(id) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar este producto?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            `${API}/api/productos/${id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                    id_vendedor: usuario.id
                })
            }
        );

        const datos = await respuesta.json();

        alert(datos.mensaje);

        cargarProductos();

    } catch (error) {

        console.error(error);

        alert("Error al eliminar producto");

    }

}

function cancelarEdicion() {

    limpiarFormulario();

}

function limpiarFormulario() {

    productoEditandoId = null;

    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("ubicacion").value = "";
    document.getElementById("imagen").value = "";

    document.getElementById("vistaPrevia").style.display =
        "none";

    document.getElementById("vistaPrevia").src =
        "";

    document.getElementById("tituloFormulario").innerText =
        "📦 Publicar producto";

    document.getElementById("btnPublicar").innerText =
        "Publicar producto";

    document.getElementById("btnCancelarEdicion").style.display =
        "none";

    mostrarMensajeLince(
        "🐾 Publica tus productos para que otros estudiantes puedan encontrarlos."
    );

}

function cerrarSesion() {

    localStorage.removeItem("usuario");

    alert("👋 Sesión cerrada correctamente");

    window.location.href = "login.html";

}

document.getElementById("buscador").addEventListener(
    "input",
    function () {

        const texto = this.value
            .toLowerCase()
            .trim();

        const filtrados = productosGlobales.filter(
            producto =>
                producto.nombre.toLowerCase().includes(texto) ||
                producto.descripcion.toLowerCase().includes(texto) ||
                producto.ubicacion.toLowerCase().includes(texto) ||
                producto.vendedor.toLowerCase().includes(texto)
        );

        mostrarProductos(filtrados);

    }
);

document.getElementById("imagen").addEventListener(
    "change",
    function () {

        const archivo = this.files[0];

        const vistaPrevia =
            document.getElementById("vistaPrevia");

        if (!archivo) {

            vistaPrevia.style.display =
                "none";

            vistaPrevia.src =
                "";

            return;

        }

        const lector =
            new FileReader();

        lector.onload = function (e) {

            vistaPrevia.src =
                e.target.result;

            vistaPrevia.style.display =
                "block";

        };

        lector.readAsDataURL(archivo);

    }
);

cargarProductos();