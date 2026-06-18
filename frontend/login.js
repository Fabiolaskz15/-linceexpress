const API = window.API_URL;

async function login() {

    const correo =
        document.getElementById("correo").value;

    const password =
        document.getElementById("password").value;

    try {

        const respuesta =
            await fetch(
                `${API}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        correo,
                        password
                    })
                }
            );

        const datos =
            await respuesta.json();

        if (respuesta.ok) {

            alert("🐾 Bienvenido " + datos.usuario.nombre);

            localStorage.setItem(
                "usuario",
                JSON.stringify(datos.usuario)
            );

            window.location.href =
                "marketplace.html";

        } else {

            alert(datos.mensaje);

        }

    } catch (error) {

        console.error(error);

        alert("Error al iniciar sesión");

    }

}