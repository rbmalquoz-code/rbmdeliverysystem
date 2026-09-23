const CACHE_NAME = "rbm-delivery-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Domains that must always go straight to the network — never served from
// cache, since they carry live data (Firestore) or auth tokens.
const BYPASS_HOSTS = [
  "googleapis.com",
  "google.com",
  "gstatic.com",
  "firebaseapp.com",
  "firebaseio.com"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let host = "";
  try { host = new URL(req.url).hostname; } catch (e) { return; }
  if (BYPASS_HOSTS.some((h) => host.endsWith(h))) return; // let it go straight to network, untouched

  // Network-first for our own files, so updates show up as soon as the
  // person is online; falls back to the cached copy when offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
