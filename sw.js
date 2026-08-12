const DB_NAME = "roki-kims-brain";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function fileKeyFromUrl(url) {
  const path = new URL(url).pathname.replace(/^\/+/, "");
  // Support project pages: /repo-name/sites/...
  const sitesIndex = path.indexOf("sites/");
  if (sitesIndex === -1) return path.replace(/\/+$/, "");
  return path.slice(sitesIndex).replace(/\/+$/, "");
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.resolve());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.includes("/sites/")) return;
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      try {
        const key = fileKeyFromUrl(url.href);
        const candidateKeys = key.endsWith("index.html")
          ? [key]
          : [key, `${key}/index.html`.replace(/\/+/g, "/")];

        const db = await openDb();
        for (const candidate of candidateKeys) {
          const row = await new Promise((resolve, reject) => {
            const request = db.transaction("files").objectStore("files").get(candidate.replace(/\/+$/, ""));
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });
          if (row?.blob) {
            return new Response(row.blob, {
              headers: {
                "Content-Type": row.contentType || "application/octet-stream",
                "Cache-Control": "no-store",
              },
            });
          }
        }
      } catch (error) {
        // Fall through to network.
      }
      return fetch(event.request);
    })()
  );
});
