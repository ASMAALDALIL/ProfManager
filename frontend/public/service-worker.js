/* ============================================================
   SERVICE WORKER — ProfManager PWA
   Stratégie : Cache-first pour les assets statiques
               Network-first pour les appels API
   ============================================================ */

const CACHE_NAME    = "profmanager-v1";
const API_BASE      = "http://127.0.0.1:8000";

/* Assets statiques à mettre en cache immédiatement */
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/* ── Install : mise en cache des assets statiques ────────── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ── Activate : nettoyer les anciens caches ──────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch : stratégie selon le type de requête ─────────── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* 1. Requêtes API → Network-first (toujours frais) */
  if (url.origin === new URL(API_BASE).origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  /* 2. Navigation HTML → Network-first avec fallback sur index.html */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/index.html")
      )
    );
    return;
  }

  /* 3. Assets statiques (JS, CSS, images, fonts) → Cache-first */
  event.respondWith(cacheFirst(request));
});

/* ── Cache-first ─────────────────────────────────────────── */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== "opaque") {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Ressource non disponible hors-ligne", { status: 503 });
  }
}

/* ── Network-first ───────────────────────────────────────── */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: "Hors-ligne — données non disponibles" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}