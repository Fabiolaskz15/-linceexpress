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

    console.log("📲 Instalación PWA disponible");

    if (botonInstalar) {
        botonInstalar.style.display = "block";
    }
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

    if (eventoInstalacion) {
        botonInstalar.style.display = "block";
    }

    botonInstalar.addEventListener("click", async () => {
        if (!eventoInstalacion) {
            alert(
                "Chrome todavía no detecta la PWA como instalable. Abre la página en Google Chrome, espera unos segundos y actualiza."
            );
            return;
        }

        eventoInstalacion.prompt();

        const resultado =
            await eventoInstalacion.userChoice;

        if (resultado.outcome === "accepted") {
            console.log("✅ LinceExpress instalada como PWA");
        } else {
            console.log("❌ Instalación cancelada");
        }

        eventoInstalacion = null;
        botonInstalar.style.display = "none";
    });
});

window.addEventListener("appinstalled", () => {
    console.log("✅ LinceExpress fue instalada");

    if (botonInstalar) {
        botonInstalar.style.display = "none";
    }
});