if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("service-worker.js")
            .then(() => {
                console.log("✅ Service Worker registrado");
            })
            .catch(error => {
                console.error(
                    "❌ Error al registrar Service Worker:",
                    error
                );
            });
    });
}

let eventoInstalacion = null;

const botonInstalar =
    document.createElement("button");

botonInstalar.textContent =
    "📲 Instalar LinceExpress";

botonInstalar.id =
    "btnInstalarPWA";

botonInstalar.style.display =
    "none";

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(botonInstalar);
});

window.addEventListener("beforeinstallprompt", evento => {
    evento.preventDefault();

    eventoInstalacion = evento;

    botonInstalar.style.display =
        "block";

    console.log(
        "📲 LinceExpress ya se puede instalar"
    );
});

botonInstalar.addEventListener("click", async () => {
    if (!eventoInstalacion) {
        alert(
            "La instalación todavía no está disponible en este navegador."
        );
        return;
    }

    eventoInstalacion.prompt();

    const resultado =
        await eventoInstalacion.userChoice;

    if (resultado.outcome === "accepted") {
        console.log(
            "✅ El usuario instaló LinceExpress"
        );
    } else {
        console.log(
            "❌ El usuario canceló la instalación"
        );
    }

    eventoInstalacion = null;

    botonInstalar.style.display =
        "none";
});

window.addEventListener("appinstalled", () => {
    console.log(
        "✅ LinceExpress fue instalada como PWA"
    );

    botonInstalar.style.display =
        "none";
});