if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("service-worker.js")
            .then(() => {
                console.log("✅ Service Worker registrado");
            })
            .catch(error => {
                console.error("❌ Error al registrar Service Worker:", error);
            });
    });
}

let eventoInstalacion = null;

function appYaInstalada() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

document.addEventListener("DOMContentLoaded", () => {
    if (appYaInstalada()) {
        return;
    }

    const botonInstalar = document.createElement("button");

    botonInstalar.textContent = "📲 Instalar LinceExpress";
    botonInstalar.id = "btnInstalarPWA";

    document.body.appendChild(botonInstalar);

    window.addEventListener("beforeinstallprompt", evento => {
        evento.preventDefault();
        eventoInstalacion = evento;

        console.log("📲 LinceExpress ya se puede instalar");
    });

    botonInstalar.addEventListener("click", async () => {
        if (eventoInstalacion) {
            eventoInstalacion.prompt();

            const resultado = await eventoInstalacion.userChoice;

            if (resultado.outcome === "accepted") {
                console.log("✅ El usuario instaló la PWA");
            } else {
                console.log("❌ El usuario canceló la instalación");
            }

            eventoInstalacion = null;
            botonInstalar.style.display = "none";
            return;
        }

        alert(
            "Para instalar LinceExpress:\n\n" +
            "En Android Chrome: toca los 3 puntitos y elige 'Instalar app' o 'Agregar a pantalla principal'.\n\n" +
            "En iPhone Safari: toca Compartir y luego 'Agregar a pantalla de inicio'."
        );
    });

    window.addEventListener("appinstalled", () => {
        console.log("✅ LinceExpress fue instalada como PWA");
        botonInstalar.style.display = "none";
    });
});