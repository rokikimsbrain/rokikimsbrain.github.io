import {
  clearLocalFilesUnder,
  loadMergedManifest,
  mirrorWebsiteFilesLocal,
  putTextFile,
  replaceLocalManifest,
} from "./store.js";
import {
  deleteEntryRemote,
  isGithubConfigured,
  publishFolder,
  publishWebsite,
} from "./github-publish.js";

function registerBrainWorker() {
  if (!("serviceWorker" in navigator)) return Promise.resolve();
  const workerUrl = new URL("../sw.js", import.meta.url);
  return navigator.serviceWorker
    .register(workerUrl.href)
    .then(() => navigator.serviceWorker.ready)
    .catch(() => {});
}

registerBrainWorker();

function folderSvg() {
  return `
    <svg class="folder-icon folder-icon-sm" viewBox="0 0 64 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 12.5C2 9.46 4.46 7 7.5 7H22l4.5 4.5H56.5C59.54 11.5 62 13.96 62 17v27c0 3.04-2.46 5.5-5.5 5.5h-49C4.46 49.5 2 47.04 2 44V12.5Z" fill="#4B9FE8"/>
      <path d="M2 20h60v24c0 3.04-2.46 5.5-5.5 5.5h-49C4.46 49.5 2 47.04 2 44V20Z" fill="#6BB3F2"/>
      <path d="M2 12.5C2 9.46 4.46 7 7.5 7H22l4.5 4.5H56.5C59.54 11.5 62 13.96 62 17v3H2v-7.5Z" fill="#3B8AD4"/>
    </svg>
  `;
}

function siteSvg() {
  return `
    <svg class="site-icon" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="2" width="36" height="52" rx="3" fill="#f4f4f4" stroke="#000" stroke-width="1.5"/>
      <path d="M14 14h20M14 22h20M14 30h14" stroke="#000" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
}

function normalizePath(path) {
  return (path || "").replace(/^\.\//, "").replace(/\/?$/, "/");
}

function depthToRoot(fromPath) {
  const parts = normalizePath(fromPath).split("/").filter(Boolean);
  return "../".repeat(parts.length);
}

function createHref(kind, parentPath, rootPrefix) {
  const params = new URLSearchParams({
    parent: normalizePath(parentPath),
  });
  const page = kind === "folder" ? "add/folder.html" : "add/";
  return `${rootPrefix}${page}?${params.toString()}`;
}

async function loadManifest() {
  return loadMergedManifest(new URL("../sites-manifest.json", import.meta.url));
}

function findNodeByPath(nodes, path) {
  const target = normalizePath(path);
  for (const node of nodes || []) {
    if (normalizePath(node.path) === target) return node;
    const nested = findNodeByPath(node.children, path);
    if (nested) return nested;
  }
  return null;
}

function findParentPath(nodes, path, parentPath = null) {
  const target = normalizePath(path);
  for (const node of nodes || []) {
    if (normalizePath(node.path) === target) return parentPath;
    const nested = findParentPath(node.children, path, node.path);
    if (nested !== undefined) return nested;
  }
  return undefined;
}

function trashSvg() {
  return `
    <svg viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 10V8.5C16 6.57 17.57 5 19.5 5h9C30.43 5 32 6.57 32 8.5V10" fill="none" stroke="#000" stroke-width="2"/>
      <path d="M10 10h28" stroke="#000" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 10l1.5 38h17L34 10" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="round"/>
      <path d="M20 18v22M24 18v22M28 18v22" stroke="#000" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
}

function ensureTrashCan() {
  if (document.querySelector("[data-trash-can]")) return;

  const trash = document.createElement("div");
  trash.className = "trash-can";
  trash.setAttribute("data-trash-can", "");
  trash.setAttribute("aria-label", "Trash — drop a folder or website here to delete it");
  trash.innerHTML = `
    ${trashSvg()}
    <span class="trash-label">Trash</span>
  `;

  trash.addEventListener("dragenter", (event) => {
    event.preventDefault();
    trash.classList.add("is-active");
  });
  trash.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    trash.classList.add("is-active");
  });
  trash.addEventListener("dragleave", (event) => {
    if (!trash.contains(event.relatedTarget)) {
      trash.classList.remove("is-active");
    }
  });
  trash.addEventListener("drop", async (event) => {
    event.preventDefault();
    trash.classList.remove("is-active");
    const raw = event.dataTransfer.getData("application/x-brain-item");
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      await handleDelete(payload, payload.rootPrefix || "../");
    } catch (error) {
      window.alert(error.message || "Could not delete.");
    }
  });

  document.body.append(trash);
}

function makeDraggableCard(item, node, rootPrefix) {
  item.draggable = true;
  item.classList.add("is-draggable");

  item.addEventListener("dragstart", (event) => {
    item.dataset.dragging = "1";
    item.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "application/x-brain-item",
      JSON.stringify({
        path: node.path,
        name: node.name,
        type: node.type || "folder",
        rootPrefix,
      })
    );
    ensureTrashCan();
    document.querySelector("[data-trash-can]")?.classList.add("is-waiting");
  });

  item.addEventListener("dragend", () => {
    item.dataset.dragging = "0";
    item.classList.remove("is-dragging");
    document.querySelector("[data-trash-can]")?.classList.remove("is-waiting", "is-active");
  });
}

function renderFolderCard(node, rootPrefix) {
  const item = document.createElement("div");
  item.className = "folder-item";

  const open = document.createElement("a");
  open.className = "folder-link folder-link-grid";
  open.href = `${rootPrefix}${node.path}`;
  open.innerHTML = `
    ${folderSvg()}
    <span class="folder-label">${node.name}</span>
  `;
  open.addEventListener("click", (event) => {
    if (item.dataset.dragging === "1") event.preventDefault();
  });

  makeDraggableCard(item, { ...node, type: "folder" }, rootPrefix);
  item.append(open);
  return item;
}

function renderWebsiteCard(node, rootPrefix) {
  const item = document.createElement("div");
  item.className = "folder-item";

  const open = document.createElement("a");
  open.className = "folder-link folder-link-grid";
  open.href = `${rootPrefix}${node.path}`;
  open.innerHTML = `
    ${siteSvg()}
    <span class="folder-label">${node.name}</span>
  `;
  open.addEventListener("click", (event) => {
    if (item.dataset.dragging === "1") event.preventDefault();
  });

  makeDraggableCard(item, { ...node, type: "website" }, rootPrefix);
  item.append(open);
  return item;
}

async function handleDelete(node, rootPrefix) {
  const kind = node.type === "website" ? "website" : "folder";
  const ok = window.confirm(`Delete ${kind} “${node.name}”? This cannot be undone.`);
  if (!ok) return;

  if (!isGithubConfigured()) {
    window.alert("Connect GitHub once in Settings so deletes stay on the live site for everyone.");
    window.location.href = `${rootPrefix}settings/`;
    return;
  }

  try {
    const { manifest } = await deleteEntryRemote(node.path);
    await replaceLocalManifest(manifest);
    await clearLocalFilesUnder(node.path);
    const browseRoot = document.querySelector("[data-folder-browser]");
    if (browseRoot?.dataset.view === "browse") {
      initBrowse();
      return;
    }
    if (browseRoot?.dataset.view === "folder") {
      initFolderView();
      return;
    }
    window.location.href = `${rootPrefix}browse/`;
  } catch (error) {
    window.alert(error.message || "Could not delete.");
  }
}

function requireGithubOrRedirect(rootPrefix = "../") {
  if (isGithubConfigured()) return true;
  window.alert("Connect GitHub once so your work is saved on the live site for everyone.");
  window.location.href = `${rootPrefix}settings/`;
  return false;
}

function renderEntries(nodes, container, rootPrefix) {
  (nodes || []).forEach((node) => {
    if (node.type === "website") {
      container.append(renderWebsiteCard(node, rootPrefix));
    } else {
      container.append(renderFolderCard(node, rootPrefix));
    }
  });
}

function setPageActions(parentPath, rootPrefix) {
  const folderLink = document.querySelector("[data-create-folder]");
  const websiteLink = document.querySelector("[data-create-website]");
  if (folderLink) folderLink.href = createHref("folder", parentPath, rootPrefix);
  if (websiteLink) websiteLink.href = createHref("website", parentPath, rootPrefix);
  ensureTrashCan();

  const settingsLink = document.querySelector("[data-settings-link]");
  if (settingsLink) {
    settingsLink.href = `${rootPrefix}settings/`;
    settingsLink.textContent = isGithubConfigured() ? "GitHub connected" : "Connect GitHub";
  }
}


function initBrowse() {
  const root = document.querySelector("[data-folder-browser][data-view='browse']");
  if (!root) return;

  setPageActions("sites/", "../");

  loadManifest()
    .then((data) => {
      root.innerHTML = "";
      root.classList.add("folder-grid");
      const folders = data.folders || data.sites || [];
      if (!folders.length) {
        root.innerHTML =
          '<p class="empty">No folders yet. Use Create a new folder above.</p>';
        return;
      }
      renderEntries(folders, root, "../");
    })
    .catch(() => {
      root.innerHTML =
        '<p class="empty">Could not load folders. Check sites-manifest.json.</p>';
    });
}

function initFolderView() {
  const root = document.querySelector("[data-folder-browser][data-view='folder']");
  if (!root) return;

  const folderPath = root.getAttribute("data-folder-path");
  const titleEl = document.querySelector("[data-folder-title]");
  const backEl = document.querySelector("[data-folder-back]");
  const rootPrefix = depthToRoot(folderPath);

  setPageActions(folderPath, rootPrefix);

  loadManifest()
    .then((data) => {
      const folders = data.folders || data.sites || [];
      const node = findNodeByPath(folders, folderPath);
      if (!node) {
        root.innerHTML = '<p class="empty">Folder not found in sites-manifest.json.</p>';
        return;
      }

      if (titleEl) titleEl.textContent = node.name;

      if (backEl) {
        const parentPath = findParentPath(folders, folderPath);
        backEl.href = parentPath ? `${rootPrefix}${parentPath}` : `${rootPrefix}browse/`;
        backEl.textContent = parentPath ? "← Parent folder" : "← Websites already made";
      }

      root.innerHTML = "";
      root.classList.add("folder-grid");

      const children = node.children || [];
      if (!children.length) {
        root.innerHTML =
          '<p class="empty">This folder is empty. Create a new folder or website above.</p>';
        return;
      }

      renderEntries(children, root, rootPrefix);
    })
    .catch(() => {
      root.innerHTML =
        '<p class="empty">Could not load this folder. Check sites-manifest.json.</p>';
    });
}

function setStatus(el, message, isError = false) {
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || "";
  el.style.borderColor = isError ? "#000" : "";
}

function slugifyFolderName(name) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._!~-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function folderPageTemplate(folderPath, folderName, depthPrefix) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${folderName}</title>
    <link rel="stylesheet" href="${depthPrefix}css/brain.css" />
  </head>
  <body>
    <main class="page">
      <div class="page-inner page-inner-wide">
        <a class="back" data-folder-back href="${depthPrefix}browse/">← Websites already made</a>
        <h1 class="title" data-folder-title>${folderName}</h1>
        <p class="hint">Container folder — websites and nested folders go here.</p>
        <p class="page-actions">
          <a data-create-folder href="${depthPrefix}add/folder.html?parent=${folderPath}">Create a new folder</a>
          <a data-create-website href="${depthPrefix}add/?parent=${folderPath}">Create a new website</a>
        </p>
        <div
          class="tree"
          data-folder-browser
          data-view="folder"
          data-folder-path="${folderPath}"
        >
          <p class="empty">Loading…</p>
        </div>
      </div>
    </main>
    <script type="module" src="${depthPrefix}js/brain.js"></script>
  </body>
</html>
`;
}

function relativePathsFromFiles(fileList) {
  const files = [...fileList];
  if (!files.length) return [];

  const first = files[0].webkitRelativePath || files[0].name;
  const root = first.includes("/") ? first.split("/")[0] + "/" : "";

  return files.map((file) => {
    const full = file.webkitRelativePath || file.name;
    const relativePath = root && full.startsWith(root) ? full.slice(root.length) : full;
    return { file, relativePath };
  }).filter((entry) => entry.relativePath && !entry.relativePath.endsWith("/"));
}

function initWebsiteCreatePage() {
  if (document.body.dataset.createKind !== "website") return;

  const params = new URLSearchParams(window.location.search);
  const parent = normalizePath(params.get("parent") || "sites/");
  const parentNote = document.querySelector("[data-parent-note]");
  const parentCode = document.querySelector("[data-parent-path]");
  const folderAlt = document.querySelector("[data-folder-alt]");
  const form = document.querySelector("[data-website-form]");
  const nameInput = document.querySelector("[data-site-name]");
  const status = document.querySelector("[data-website-status]");
  const result = document.querySelector("[data-website-result]");
  const openLink = document.querySelector("[data-open-website]");
  const zone = document.querySelector("[data-drop-zone]");
  const input = document.querySelector("[data-file-input]");
  const list = document.querySelector("[data-preview-list]");
  const pickBtn = document.querySelector("[data-pick-files]");
  const submitBtn = document.querySelector("[data-website-submit]");

  let selectedFiles = [];

  if (parentNote && parentCode) {
    parentCode.textContent = parent;
    parentNote.hidden = false;
  }

  if (folderAlt) {
    folderAlt.href = `folder.html?parent=${encodeURIComponent(parent)}`;
  }

  const showFiles = (files) => {
    selectedFiles = relativePathsFromFiles(files);
    if (!selectedFiles.length) {
      list.innerHTML = "";
      return;
    }

    list.innerHTML = selectedFiles
      .slice(0, 40)
      .map((entry) => `<li>${entry.relativePath}</li>`)
      .join("");

    if (selectedFiles.length > 40) {
      list.innerHTML += `<li>…and ${selectedFiles.length - 40} more files</li>`;
    }

    const hint = document.querySelector("[data-drop-hint]");
    if (hint) {
      hint.textContent = `${selectedFiles.length} files ready to add inside ${parent}.`;
    }
  };

  pickBtn?.addEventListener("click", () => input.click());
  input?.addEventListener("change", () => showFiles(input.files));

  ["dragenter", "dragover"].forEach((eventName) => {
    zone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.add("is-active");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    zone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.remove("is-active");
    });
  });

  zone?.addEventListener("drop", (event) => {
    const files = event.dataTransfer?.files;
    if (files?.length) showFiles(files);
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const displayName = nameInput.value.trim();
    const siteId = slugifyFolderName(displayName).toLowerCase().replace(/[^a-z0-9-]/g, "") || "site";
    if (!displayName) {
      nameInput.focus();
      return;
    }

    if (!selectedFiles.length) {
      setStatus(status, "Choose a website folder first.", true);
      return;
    }

    if (!selectedFiles.some((entry) => entry.relativePath === "index.html")) {
      setStatus(status, "That folder needs an index.html file at the top level.", true);
      return;
    }

    const sitePath = `${parent}${siteId}/`;
    if (!requireGithubOrRedirect("../")) return;

    submitBtn.disabled = true;
    setStatus(status, "Saving to the live site…");

    try {
      await registerBrainWorker();
      const { manifest } = await publishWebsite({
        displayName,
        siteId,
        sitePath,
        parentPath: parent,
        files: selectedFiles,
      });
      await replaceLocalManifest(manifest);
      await mirrorWebsiteFilesLocal(sitePath, selectedFiles);

      setStatus(
        status,
        "Saved to GitHub. Everyone will see it after Pages updates (usually under a minute)."
      );
      if (openLink) openLink.href = `../${sitePath}`;
      result.hidden = false;
    } catch (error) {
      setStatus(status, error.message || "Could not create website.", true);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function initFolderCreatePage() {
  if (document.body.dataset.createKind !== "folder") return;

  const params = new URLSearchParams(window.location.search);
  const parent = normalizePath(params.get("parent") || "sites/");
  const form = document.querySelector("[data-folder-form]");
  const nameInput = document.querySelector("[data-folder-name]");
  const result = document.querySelector("[data-folder-result]");
  const status = document.querySelector("[data-folder-status]");
  const parentNote = document.querySelector("[data-parent-note]");
  const parentCode = document.querySelector("[data-parent-path]");
  const submitBtn = document.querySelector("[data-folder-submit]");
  const openLink = document.querySelector("[data-open-folder]");

  if (parentNote && parentCode) {
    parentCode.textContent = parent;
    parentNote.hidden = false;
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const displayName = nameInput.value.trim();
    const folderId = slugifyFolderName(displayName);
    if (!folderId) {
      nameInput.focus();
      return;
    }

    const folderPath = `${parent}${folderId}/`;
    const depthPrefix = depthToRoot(folderPath);
    const folderHtml = folderPageTemplate(folderPath, displayName, depthPrefix);

    if (!requireGithubOrRedirect("../")) return;

    submitBtn.disabled = true;
    setStatus(status, "Saving to the live site…");

    try {
      await registerBrainWorker();
      const { manifest } = await publishFolder({
        displayName,
        folderId,
        folderPath,
        parentPath: parent,
        folderHtml,
      });
      await replaceLocalManifest(manifest);
      await putTextFile(`${folderPath}index.html`, folderHtml, "text/html");

      setStatus(
        status,
        "Saved to GitHub. Everyone will see it after Pages updates (usually under a minute)."
      );
      if (openLink) openLink.href = `../${folderPath}`;
      result.hidden = false;
    } catch (error) {
      setStatus(status, error.message || "Could not create folder.", true);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

initBrowse();
initFolderView();
initWebsiteCreatePage();
initFolderCreatePage();
