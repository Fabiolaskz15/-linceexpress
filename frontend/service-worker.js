const CACHE_NAME = "linceexpress-cache-v8";

const ARCHIVOS_CACHE = [
    "./",
    "./inicio.html",
    "./registro.html",
    "./login.html",
    "./recuperar.html",
    "./marketplace.html",
    "./perfil.html",
    "./styles.css",
    "./config.js",
    "./registro.js",
    "./login.js",
    "./recuperar.js",
    "./marketplace.js",
    "./perfil.js",
    "./pwa.js",
    "./manifest.json",
    "./assets/lince.gif"
];

self.addEventListener("install", evento => {

    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ARCHIVOS_CACHE);
            })
    );

    self.skipWaiting();

});

self.addEventListener("activate", evento => {

    evento.waitUntil(
        caches.keys().then(keys => {
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
        url.href.includes("localhost:3000") ||
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
                return respuestaCache || fetch(evento.request);
            })
    );

});