const API = window.API_URL;

const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );

if (!usuario) {

    window.location.href =
        "login.html";

}

document.getElementById(
    "nombreUsuario"
).innerText =
    "👤 " + usuario.nombre;

document.getElementById(
    "correoUsuario"
).innerText =
    "📧 " + usuario.correo;

async function cargarPerfil() {

    try {

        const respuesta =
            await fetch(
                `${API}/api/auth/perfil/${usuario.id}`
            );

        const perfil =
            await respuesta.json();

        document.getElementById(
            "telefono"
        ).value =
            perfil.telefono || "";

        document.getElementById(
            "carrera"
        ).value =
            perfil.carrera || "";

        document.getElementById(
            "descripcion"
        ).value =
            perfil.descripcion || "";

    } catch (error) {

        console.error(error);

    }

}

async function guardarPerfil() {

    const telefono =
        document.getElementById(
            "telefono"
        ).value;

    const carrera =
        document.getElementById(
            "carrera"
        ).value;

    const descripcion =
        document.getElementById(
            "descripcion"
        ).value;

    try {

        const respuesta =
            await fetch(
                `${API}/api/auth/perfil/${usuario.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        telefono,
                        carrera,
                        descripcion
                    })
                }
            );

        const datos =
            await respuesta.json();

        alert(datos.mensaje);

    } catch (error) {

        console.error(error);

        alert(
            "Error al guardar perfil"
        );

    }

}

async function cargarMisProductos() {

    try {

        const respuesta =
            await fetch(
                `${API}/api/productos`
            );

        const productos =
            await respuesta.json();

        const misProductos =
            productos.filter(
                producto =>
                    producto.id_vendedor ==
                    usuario.id
            );

        const contenedor =
            document.getElementById(
                "misProductos"
            );

        contenedor.innerHTML = "";

        if (misProductos.length === 0) {

            contenedor.innerHTML =
                "<p>No has publicado productos todavía.</p>";

            return;

        }

        misProductos.forEach(producto => {

            contenedor.innerHTML += `
                <div class="card" style="margin-top:15px">

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

                    </div>

                </div>
            `;

        });

    } catch (error) {

        console.error(error);

    }

}

cargarPerfil();
cargarMisProductos();