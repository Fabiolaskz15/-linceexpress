const API = window.API_URL;

async function recuperarPassword() {

    const correo =
        document.getElementById("correo").value;

    if (!correo) {
        alert("Ingresa tu correo");
        return;
    }

    try {

        const respuesta =
            await fetch(
                `${API}/api/auth/recuperar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        correo
                    })
                }
            );

        const datos =
            await respuesta.json();

        alert(datos.mensaje);

        if (respuesta.ok) {
            window.location.href =
                "login.html";
        }

    } catch (error) {

        console.error(error);

        alert(
            "Error al solicitar recuperación"
        );

    }

}