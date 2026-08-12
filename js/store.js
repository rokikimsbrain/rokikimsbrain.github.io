const DB_NAME = "roki-kims-brain";
const DB_VERSION = 1;
const MANIFEST_KEY = "manifest";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta");
      }
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storeRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function normalizePath(path) {
  return (path || "").replace(/^\.\//, "").replace(/^\/+/, "").replace(/\/?$/, "/");
}

export function fileKey(path) {
  return (path || "").replace(/^\.\//, "").replace(/^\/+/, "").replace(/\/+$/, "");
}

async function getMeta(key) {
  const db = await openDb();
  return storeRequest(db.transaction("meta").objectStore("meta").get(key));
}

async function setMeta(key, value) {
  const db = await openDb();
  const tx = db.transaction("meta", "readwrite");
  tx.objectStore("meta").put(value, key);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLocalManifest() {
  return (await getMeta(MANIFEST_KEY)) || null;
}

export async function saveLocalManifest(manifest) {
  await setMeta(MANIFEST_KEY, manifest);
}

export async function putFile(path, blob, contentType = "application/octet-stream") {
  const db = await openDb();
  const tx = db.transaction("files", "readwrite");
  tx.objectStore("files").put({ blob, contentType, updatedAt: Date.now() }, fileKey(path));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function mirrorWebsiteFilesLocal(sitePath, files) {
  for (const entry of files) {
    const path = `${sitePath}${entry.relativePath}`.replace(/\/+/g, "/");
    const type = entry.file.type || guessContentType(entry.relativePath);
    await putFile(path, entry.file, type);
  }
}


export async function getFile(path) {
  const db = await openDb();
  return storeRequest(db.transaction("files").objectStore("files").get(fileKey(path)));
}

export async function putTextFile(path, text, contentType = "text/html") {
  await putFile(path, new Blob([text], { type: contentType }), contentType);
}

export function findNodeByPath(nodes, path) {
  const target = normalizePath(path);
  for (const node of nodes || []) {
    if (normalizePath(node.path) === target) return node;
    const nested = findNodeByPath(node.children, path);
    if (nested) return nested;
  }
  return null;
}

export function insertChild(manifest, parentPath, child) {
  const next = structuredClone(manifest);
  const folders = next.folders || next.sites || [];
  next.folders = folders;
  delete next.sites;

  if (normalizePath(parentPath) === "sites/") {
    folders.push(child);
    return next;
  }

  const parent = findNodeByPath(folders, parentPath);
  if (!parent) throw new Error(`Parent folder not found: ${parentPath}`);
  parent.children = parent.children || [];
  parent.children.push(child);
  return next;
}

export async function loadMergedManifest(fallbackUrl) {
  try {
    const response = await fetch(fallbackUrl, { cache: "no-store" });
    if (response.ok) {
      const network = await response.json();
      if (!network.folders && network.sites) {
        network.folders = network.sites;
        delete network.sites;
      }
      await saveLocalManifest(network);
      return network;
    }
  } catch {
    // Fall back to local cache below.
  }

  let local = await getLocalManifest();
  if (!local) {
    throw new Error("Could not load sites-manifest.json");
  }
  return local;
}

export async function replaceLocalManifest(manifest) {
  await saveLocalManifest(manifest);
}


function guessContentType(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "text/html";
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "text/javascript";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".woff2")) return "font/woff2";
  if (lower.endsWith(".woff")) return "font/woff";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

export async function createFolderLocal({ displayName, folderId, folderPath, parentPath, folderHtml }) {
  const manifest = await loadMergedManifest(new URL("../sites-manifest.json", import.meta.url));
  const child = {
    id: folderId.toLowerCase().replace(/[^a-z0-9-]/g, "") || "folder",
    name: displayName,
    type: "folder",
    path: folderPath,
    children: [],
  };
  const updated = insertChild(manifest, parentPath, child);
  await saveLocalManifest(updated);
  await putTextFile(`${folderPath}index.html`, folderHtml, "text/html");
  return child;
}

export async function createWebsiteLocal({
  displayName,
  siteId,
  sitePath,
  parentPath,
  files,
}) {
  const manifest = await loadMergedManifest(new URL("../sites-manifest.json", import.meta.url));
  const child = {
    id: siteId,
    name: displayName,
    type: "website",
    path: sitePath,
  };
  const updated = insertChild(manifest, parentPath, child);
  await saveLocalManifest(updated);

  for (const entry of files) {
    const path = `${sitePath}${entry.relativePath}`.replace(/\/+/g, "/");
    const type = entry.file.type || guessContentType(entry.relativePath);
    await putFile(path, entry.file, type);
  }

  return child;
}

function collectPaths(node, paths = []) {
  if (!node) return paths;
  paths.push(normalizePath(node.path));
  (node.children || []).forEach((child) => collectPaths(child, paths));
  return paths;
}

function removeNode(nodes, path) {
  const target = normalizePath(path);
  const next = [];
  for (const node of nodes || []) {
    if (normalizePath(node.path) === target) continue;
    const copy = { ...node };
    if (copy.children) copy.children = removeNode(copy.children, path);
    next.push(copy);
  }
  return next;
}

async function deleteFilesUnder(prefix) {
  const db = await openDb();
  const base = fileKey(prefix);
  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");
  const keys = await storeRequest(store.getAllKeys());
  keys
    .filter((key) => key === base || String(key).startsWith(`${base}/`))
    .forEach((key) => store.delete(key));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearLocalFilesUnder(prefix) {
  await deleteFilesUnder(prefix);
}


export async function deleteEntryLocal(path) {
  const manifest = await loadMergedManifest(new URL("../sites-manifest.json", import.meta.url));
  const folders = manifest.folders || [];
  const node = findNodeByPath(folders, path);
  if (!node) throw new Error("Item not found.");

  const prefixes = collectPaths(node);
  for (const prefix of prefixes) {
    await deleteFilesUnder(prefix);
  }

  manifest.folders = removeNode(folders, path);
  await saveLocalManifest(manifest);
  return node;
}
