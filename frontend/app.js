const API = "http://localhost:3000";

async function cargarProductos() {

    try {

        const respuesta =
            await fetch(`${API}/api/productos`);

        const productos =
            await respuesta.json();

        const lista =
            document.getElementById("lista-productos");

        lista.innerHTML = "";

        productos.forEach(producto => {

            lista.innerHTML += `
                <div class="card">

                    <img
                    src="${API}/uploads/${producto.imagen}"
                    alt="${producto.nombre}"
                    >

                    <div class="card-body">

                        <h3>${producto.nombre}</h3>

                        <p class="precio">
                            $${producto.precio}
                        </p>

                        <p>
                            ${producto.descripcion}
                        </p>

                        <p>
                            📍 ${producto.ubicacion}
                        </p>

                        <p>
                            👤 ${producto.vendedor}
                        </p>

                    </div>

                </div>
            `;

        });

    } catch(error) {

        console.error(error);

    }

}

cargarProductos();