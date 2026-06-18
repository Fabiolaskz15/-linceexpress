if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./service-worker.js")
            .then(() => {
                console.log("🐾 Service Worker registrado correctamente");
            })
            .catch(error => {
                console.error("Error al registrar Service Worker:", error);
            });

    });

}