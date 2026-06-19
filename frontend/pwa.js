let eventoInstalacion = null;
let botonInstalar = null;

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/service-worker.js")
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

function appYaInstalada() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

window.addEventListener("beforeinstallprompt", evento => {
    evento.preventDefault();

    eventoInstalacion = evento;

    if (botonInstalar) {
        botonInstalar.style.display = "block";
    }

    console.log("📲 Instalación PWA disponible");
});

document.addEventListener("DOMContentLoaded", () => {
    if (appYaInstalada()) {
        return;
    }

    botonInstalar = document.createElement("button");

    botonInstalar.textContent = "📲 Instalar LinceExpress";
    botonInstalar.id = "btnInstalarPWA";
    botonInstalar.style.display = "none";

    document.body.appendChild(botonInstalar);

    botonInstalar.addEventListener("click", async () => {
        if (!eventoInstalacion) {
            alert(
                "La instalación PWA todavía no está disponible. Abre la página en Google Chrome y espera unos segundos."
            );
            return;
        }

        eventoInstalacion.prompt();

        const resultado =
            await eventoInstalacion.userChoice;

        if (resultado.outcome === "accepted") {
            console.log("✅ PWA instalada");
        } else {
            console.log("❌ Instalación cancelada");
        }

        eventoInstalacion = null;
        botonInstalar.style.display = "none";
    });
});

window.addEventListener("appinstalled", () => {
    console.log("✅ LinceExpress instalada como PWA");

    if (botonInstalar) {
        botonInstalar.style.display = "none";
    }
});