const CONFIG_KEY = "roki-brain-github";

export function getGithubConfig() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveGithubConfig(config) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearGithubConfig() {
  localStorage.removeItem(CONFIG_KEY);
}

export function isGithubConfigured() {
  const config = getGithubConfig();
  return Boolean(config?.owner && config?.repo && config?.token);
}

export function guessGithubFromLocation() {
  const host = window.location.hostname;
  if (!host.endsWith("github.io")) {
    return { owner: "rokikimsbrain", repo: "rokikimsbrain.github.io", branch: "main" };
  }
  const owner = host.replace(/\.github\.io$/, "");
  const parts = window.location.pathname.split("/").filter(Boolean);
  const repo = parts[0] && !parts[0].includes(".") ? parts[0] : `${owner}.github.io`;
  return { owner, repo, branch: "main" };
}

function headers(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function apiUrl(owner, repo, path) {
  return `https://api.github.com/repos/${owner}/${repo}/${path}`;
}

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || response.statusText || "GitHub request failed");
  }
  return data;
}

export function toBase64(text) {
  return btoa(unescape(encodeURIComponent(text)));
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  return bytesToBase64(new Uint8Array(buffer));
}

async function getRefSha(config) {
  const response = await fetch(
    apiUrl(config.owner, config.repo, `git/ref/heads/${config.branch}`),
    { headers: headers(config.token) }
  );
  const data = await readJson(response);
  return data.object.sha;
}

async function getCommit(config, sha) {
  const response = await fetch(apiUrl(config.owner, config.repo, `git/commits/${sha}`), {
    headers: headers(config.token),
  });
  return readJson(response);
}

async function createBlob(config, contentBase64) {
  const response = await fetch(apiUrl(config.owner, config.repo, "git/blobs"), {
    method: "POST",
    headers: { ...headers(config.token), "Content-Type": "application/json" },
    body: JSON.stringify({ content: contentBase64, encoding: "base64" }),
  });
  return readJson(response);
}

async function createTree(config, baseTreeSha, entries) {
  const response = await fetch(apiUrl(config.owner, config.repo, "git/trees"), {
    method: "POST",
    headers: { ...headers(config.token), "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: entries }),
  });
  return readJson(response);
}

async function createCommit(config, message, treeSha, parentSha) {
  const response = await fetch(apiUrl(config.owner, config.repo, "git/commits"), {
    method: "POST",
    headers: { ...headers(config.token), "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: treeSha, parents: [parentSha] }),
  });
  return readJson(response);
}

async function updateRef(config, commitSha) {
  const response = await fetch(
    apiUrl(config.owner, config.repo, `git/refs/heads/${config.branch}`),
    {
      method: "PATCH",
      headers: { ...headers(config.token), "Content-Type": "application/json" },
      body: JSON.stringify({ sha: commitSha }),
    }
  );
  return readJson(response);
}

/** @param {{ path: string, contentBase64?: string, delete?: boolean }[]} files */
export async function commitFiles(files, message) {
  const config = getGithubConfig();
  if (!config) throw new Error("GitHub is not connected yet.");

  const latestSha = await getRefSha(config);
  const latestCommit = await getCommit(config, latestSha);
  const treeEntries = [];

  for (const file of files) {
    const path = file.path.replace(/^\//, "");
    if (file.delete) {
      treeEntries.push({ path, mode: "100644", type: "blob", sha: null });
      continue;
    }
    const blob = await createBlob(config, file.contentBase64);
    treeEntries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const tree = await createTree(config, latestCommit.tree.sha, treeEntries);
  const commit = await createCommit(config, message, tree.sha, latestSha);
  await updateRef(config, commit.sha);
  return commit;
}

export async function fetchRepoFileText(path) {
  const config = getGithubConfig();
  if (!config) throw new Error("GitHub is not connected yet.");

  const response = await fetch(
    apiUrl(
      config.owner,
      config.repo,
      `contents/${path.replace(/^\//, "")}?ref=${encodeURIComponent(config.branch)}`
    ),
    { headers: headers(config.token) }
  );
  const data = await readJson(response);
  if (!data.content) throw new Error(`Could not read ${path}`);
  return decodeURIComponent(escape(atob(data.content.replace(/\n/g, ""))));
}

async function getRecursiveTreePaths(prefix) {
  const config = getGithubConfig();
  const latestSha = await getRefSha(config);
  const latestCommit = await getCommit(config, latestSha);
  const response = await fetch(
    apiUrl(config.owner, config.repo, `git/trees/${latestCommit.tree.sha}?recursive=1`),
    { headers: headers(config.token) }
  );
  const data = await readJson(response);
  const base = prefix.replace(/^\/+/, "").replace(/\/?$/, "/");
  return (data.tree || [])
    .filter((entry) => entry.type === "blob" && (entry.path === base.slice(0, -1) || entry.path.startsWith(base)))
    .map((entry) => entry.path);
}

export function normalizePath(path) {
  return (path || "").replace(/^\.\//, "").replace(/\/?$/, "/");
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

export function insertManifestChild(manifest, parentPath, child) {
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

function collectPaths(node, paths = []) {
  if (!node) return paths;
  paths.push(normalizePath(node.path));
  (node.children || []).forEach((child) => collectPaths(child, paths));
  return paths;
}

export async function publishFolder({ displayName, folderId, folderPath, parentPath, folderHtml }) {
  const id = folderId.toLowerCase().replace(/[^a-z0-9-]/g, "") || "folder";
  const child = {
    id,
    name: displayName,
    type: "folder",
    path: folderPath,
    children: [],
  };

  const manifest = JSON.parse(await fetchRepoFileText("sites-manifest.json"));
  const updated = insertManifestChild(manifest, parentPath, child);

  await commitFiles(
    [
      {
        path: `${folderPath}index.html`.replace(/\/+/g, "/"),
        contentBase64: toBase64(folderHtml),
      },
      {
        path: "sites-manifest.json",
        contentBase64: toBase64(`${JSON.stringify(updated, null, 2)}\n`),
      },
    ],
    `Add folder ${displayName}`
  );

  return { child, manifest: updated };
}

export async function publishWebsite({ displayName, siteId, sitePath, parentPath, files }) {
  const child = {
    id: siteId,
    name: displayName,
    type: "website",
    path: sitePath,
  };

  const manifest = JSON.parse(await fetchRepoFileText("sites-manifest.json"));
  const updated = insertManifestChild(manifest, parentPath, child);

  const uploads = [];
  for (const entry of files) {
    uploads.push({
      path: `${sitePath}${entry.relativePath}`.replace(/\/+/g, "/"),
      contentBase64: await fileToBase64(entry.file),
    });
  }
  uploads.push({
    path: "sites-manifest.json",
    contentBase64: toBase64(`${JSON.stringify(updated, null, 2)}\n`),
  });

  await commitFiles(uploads, `Add website ${displayName}`);
  return { child, manifest: updated };
}

export async function deleteEntryRemote(path) {
  const manifest = JSON.parse(await fetchRepoFileText("sites-manifest.json"));
  const folders = manifest.folders || [];
  const node = findNodeByPath(folders, path);
  if (!node) throw new Error("Item not found in the live site.");

  const prefixes = collectPaths(node);
  const deletePaths = new Set();
  for (const prefix of prefixes) {
    const files = await getRecursiveTreePaths(prefix);
    files.forEach((filePath) => deletePaths.add(filePath));
  }

  const updated = structuredClone(manifest);
  updated.folders = removeNode(folders, path);

  const operations = [...deletePaths].map((filePath) => ({
    path: filePath,
    delete: true,
  }));
  operations.push({
    path: "sites-manifest.json",
    contentBase64: toBase64(`${JSON.stringify(updated, null, 2)}\n`),
  });

  await commitFiles(operations, `Delete ${node.name}`);
  return { node, manifest: updated };
}
