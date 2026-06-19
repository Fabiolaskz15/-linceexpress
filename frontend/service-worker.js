const CACHE_NAME = "linceexpress-cache-v21";

const ARCHIVOS_CACHE = [
    "/",
    "/inicio.html",
    "/index.html",
    "/registro.html",
    "/login.html",
    "/recuperar.html",
    "/marketplace.html",
    "/perfil.html",
    "/styles.css",
    "/config.js",
    "/registro.js",
    "/login.js",
    "/recuperar.js",
    "/marketplace.js",
    "/perfil.js",
    "/app.js",
    "/pwa.js",
    "/manifest.json",
    "/assets/lince.gif",
    "/assets/icon-192.png",
    "/assets/icon-512.png"
];

self.addEventListener("install", evento => {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                for (const archivo of ARCHIVOS_CACHE) {
                    try {
                        await cache.add(archivo);
                    } catch (error) {
                        console.warn(
                            "No se pudo guardar en caché:",
                            archivo
                        );
                    }
                }
            })
    );

    self.skipWaiting();
});

self.addEventListener("activate", evento => {
    evento.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }
                    })
                );
            })
    );

    self.clients.claim();
});

self.addEventListener("fetch", evento => {
    if (evento.request.method !== "GET") {
        return;
    }

    const url = new URL(evento.request.url);

    if (
        url.href.includes("linceexpress-backend.onrender.com") ||
        url.pathname.includes("/api/")
    ) {
        evento.respondWith(
            fetch(evento.request)
        );
        return;
    }

    evento.respondWith(
        caches.match(evento.request)
            .then(respuestaCache => {
                if (respuestaCache) {
                    return respuestaCache;
                }

                return fetch(evento.request);
            })
    );
});