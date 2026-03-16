const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { Readable } = require("stream");
const { EventEmitter } = require("events");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");
const MAX_ITEMS = 200;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const APP_VERSION = require("./package.json").version || "0.0.0";
const bus = new EventEmitter();

let items = [];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp"
};

async function ensureDataDirs() {
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });

  try {
    const raw = await fsp.readFile(ITEMS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    items = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    items = [];
    await persistItems();
  }
}

async function persistItems() {
  await fsp.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2));
}

function json(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

function sendError(response, statusCode, message) {
  json(response, statusCode, { error: message });
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isLikelyPhoneReachable(address) {
  if (!address) {
    return false;
  }

  if (address.startsWith("169.254.")) {
    return false;
  }

  return (
    address.startsWith("192.168.") ||
    address.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function listLocalUrls() {
  const loopback = [`http://localhost:${PORT}`];
  const likely = [];
  const other = [];
  const seen = new Set(loopback);

  for (const group of Object.values(os.networkInterfaces())) {
    for (const details of group || []) {
      if (details.family !== "IPv4" || details.internal) {
        continue;
      }

      const url = `http://${details.address}:${PORT}`;
      if (seen.has(url)) {
        continue;
      }

      seen.add(url);
      if (isLikelyPhoneReachable(details.address)) {
        likely.push(url);
      } else {
        other.push(url);
      }
    }
  }

  return [...loopback, ...likely, ...other];
}

async function parseBody(request) {
  const origin = `http://${request.headers.host || `localhost:${PORT}`}`;
  const body = Readable.toWeb(request);
  const webRequest = new Request(new URL(request.url, origin), {
    method: request.method,
    headers: request.headers,
    body,
    duplex: "half"
  });

  const contentType = request.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return { type: "form", data: await webRequest.formData() };
  }
  if (contentType.includes("application/json")) {
    return { type: "json", data: await webRequest.json() };
  }
  return { type: "text", data: await webRequest.text() };
}

async function saveIncomingFile(file) {
  if (!file || typeof file.name !== "string" || file.size === 0) {
    return null;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const error = new Error("File is too large.");
    error.statusCode = 413;
    throw error;
  }

  const extension = path.extname(file.name) || ".bin";
  const storedName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const outputPath = path.join(UPLOADS_DIR, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fsp.writeFile(outputPath, buffer);

  return {
    displayName: sanitizeFileName(file.name),
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    storedName,
    url: `/uploads/${storedName}`,
    absPath: outputPath
  };
}

function normalizeUrl(value) {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

async function addItem(item) {
  items.unshift(item);
  items = items.slice(0, MAX_ITEMS);
  await persistItems();
  bus.emit("update");
}

function withResolvedFilePath(item) {
  if (!item || !item.file) {
    return item;
  }

  if (item.file.absPath) {
    return item;
  }

  const storedName = item.file.storedName || path.basename(item.file.url || "");
  if (!storedName) {
    return item;
  }

  return {
    ...item,
    file: {
      ...item.file,
      absPath: path.join(UPLOADS_DIR, path.basename(storedName))
    }
  };
}

function renderState() {
  return {
    appVersion: APP_VERSION,
    items: items.map(withResolvedFilePath),
    urls: listLocalUrls(),
    limits: {
      maxUploadBytes: MAX_UPLOAD_BYTES
    }
  };
}

function findItemIndexById(itemId) {
  return items.findIndex((item) => item && item.id === itemId);
}

async function setItemArchived(itemId, archived) {
  const index = findItemIndexById(itemId);
  if (index === -1) {
    const error = new Error("Item not found.");
    error.statusCode = 404;
    throw error;
  }

  const nextItem = { ...items[index] };

  if (archived) {
    if (!nextItem.archivedAt) {
      nextItem.archivedAt = new Date().toISOString();
    }
  } else {
    delete nextItem.archivedAt;
  }

  items[index] = nextItem;
  await persistItems();
  bus.emit("update");
  return withResolvedFilePath(nextItem);
}

async function handleShare(request, response) {
  const parsed = await parseBody(request);
  if (parsed.type !== "form") {
    return sendError(response, 415, "Use multipart/form-data to submit a link or file.");
  }

  const form = parsed.data;
  const linkValue = normalizeUrl(String(form.get("link") || ""));
  const note = String(form.get("note") || "").trim().slice(0, 300);
  const file = form.get("screenshot");
  const savedFile = file instanceof File ? await saveIncomingFile(file) : null;

  if (!linkValue && !savedFile) {
    return sendError(response, 400, "Add a link or choose a file before sending.");
  }

  const item = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    note
  };

  if (linkValue) {
    item.type = "link";
    item.url = linkValue;
  }

  if (savedFile) {
    item.type = linkValue ? "bundle" : "image";
    item.file = savedFile;
  }

  await addItem(item);
  return json(response, 201, { ok: true, item });
}

async function handleArchive(request, response, itemId) {
  const parsed = await parseBody(request);
  if (parsed.type !== "json" || !parsed.data || typeof parsed.data !== "object") {
    return sendError(response, 400, "Send JSON with { archived: true|false }.");
  }

  const archived = Boolean(parsed.data.archived);
  const item = await setItemArchived(itemId, archived);
  return json(response, 200, { ok: true, item });
}

function serveFile(response, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const stream = fs.createReadStream(filePath);

  stream.on("error", () => {
    sendError(response, 404, "Not found.");
  });

  response.writeHead(200, { "Content-Type": contentType });
  stream.pipe(response);
}

function handleEvents(_request, response) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  });

  const sendSnapshot = () => {
    response.write(`data: ${JSON.stringify(renderState())}\n\n`);
  };

  sendSnapshot();
  bus.on("update", sendSnapshot);
  const keepAlive = setInterval(() => {
    response.write(": keep-alive\n\n");
  }, 15000);

  response.on("close", () => {
    clearInterval(keepAlive);
    bus.off("update", sendSnapshot);
  });
}

async function route(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || `localhost:${PORT}`}`);

  if (request.method === "GET" && url.pathname === "/api/state") {
    return json(response, 200, renderState());
  }

  if (request.method === "POST" && url.pathname === "/api/share") {
    return handleShare(request, response);
  }

  const archiveMatch = url.pathname.match(/^\/api\/items\/([^/]+)\/archive$/);
  if (request.method === "POST" && archiveMatch) {
    const itemId = decodeURIComponent(archiveMatch[1]);
    return handleArchive(request, response, itemId);
  }

  if (request.method === "GET" && url.pathname === "/events") {
    return handleEvents(request, response);
  }

  if (request.method === "GET" && url.pathname.startsWith("/uploads/")) {
    const storedName = path.basename(url.pathname);
    const filePath = path.join(UPLOADS_DIR, storedName);
    return serveFile(response, filePath);
  }

  if (request.method === "GET") {
    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const safePath = path.normalize(requested).replace(/^([.]\.[/\\])+/, "");
    const filePath = path.join(PUBLIC_DIR, safePath);

    if (!filePath.startsWith(PUBLIC_DIR)) {
      return sendError(response, 403, "Forbidden.");
    }

    try {
      const stat = await fsp.stat(filePath);
      if (stat.isFile()) {
        return serveFile(response, filePath);
      }
    } catch (_error) {
      return sendError(response, 404, "Not found.");
    }
  }

  return sendError(response, 404, "Not found.");
}

async function start() {
  await ensureDataDirs();

  const server = http.createServer((request, response) => {
    route(request, response).catch((error) => {
      console.error(error);
      sendError(response, error.statusCode || 500, error.message || "Unexpected server error.");
    });
  });

  server.listen(PORT, HOST, () => {
    const urls = listLocalUrls();
    const phoneUrls = urls.filter((value) => !value.includes("localhost"));

    console.log("");
    console.log("filetrx is running.");
    console.log(`Open on this laptop: http://localhost:${PORT}`);
    console.log("Open on your phone:");
    for (const url of phoneUrls) {
      console.log(`  ${url}`);
    }
    if (phoneUrls[0]) {
      console.log(`Try this one first on your phone: ${phoneUrls[0]}`);
    }
    console.log("");
  });
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});