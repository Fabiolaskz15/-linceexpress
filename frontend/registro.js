const API = window.API_URL;

async function registrar() {

    const nombre =
        document.getElementById("nombre").value;

    const correo =
        document.getElementById("correo").value;

    const password =
        document.getElementById("password").value;

    try {

        const respuesta =
            await fetch(
                `${API}/api/auth/registro`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        nombre,
                        correo,
                        password
                    })
                }
            );

        const datos =
            await respuesta.json();

        alert(datos.mensaje);

    } catch(error) {

        console.error(error);

        alert("Error al registrar");

    }

}