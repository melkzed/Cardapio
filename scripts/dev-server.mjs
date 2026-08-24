// Servidor de desenvolvimento do cardapio.
//
// Serve a pasta do projeto como site estatico e recarrega o navegador quando um
// arquivo muda. Usa apenas modulos nativos do Node, entao `npm run dev` funciona
// logo apos o clone, sem `npm install`. O deploy continua sendo a pasta crua no
// GitHub Pages: nada aqui e necessario em producao.

import { createServer } from "node:http";
import { watch } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const host = process.env.HOST || "localhost";
const requestedPort = Number(process.env.PORT || process.argv[2] || 5173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json; charset=utf-8",
};

const ignoredPaths = [".git", "node_modules", ".codex"];
const liveReloadClient = `
(() => {
  const source = new EventSource("/__dev/reload");
  source.addEventListener("reload", () => location.reload());
  source.addEventListener("error", () => {
    // Servidor caiu ou reiniciou: tenta de novo ate voltar.
    setTimeout(() => location.reload(), 1000);
  });
})();
`;

const clients = new Set();

function broadcastReload() {
  for (const client of clients) {
    client.write("event: reload\ndata: 1\n\n");
  }
}

function resolveSafePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const target = resolve(join(root, decoded));

  // Impede sair da pasta do projeto com "../".
  if (target !== root && !target.startsWith(root + sep)) {
    return null;
  }

  return target;
}

async function resolveFile(urlPath) {
  const target = resolveSafePath(urlPath);
  if (!target) {
    return null;
  }

  try {
    const stats = await stat(target);
    if (stats.isDirectory()) {
      const indexFile = join(target, "index.html");
      await stat(indexFile);
      return indexFile;
    }
    return target;
  } catch {
    return null;
  }
}

function sendNotFound(response, urlPath) {
  response.writeHead(404, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8">` +
      `<title>404 - nao encontrado</title>` +
      `<body style="font-family:system-ui;padding:2rem">` +
      `<h1>404</h1><p>Arquivo nao encontrado: <code>${urlPath}</code></p>` +
      `<p><a href="/">Voltar para o cardapio</a></p>`
  );
}

async function handleRequest(request, response) {
  const urlPath = request.url || "/";

  if (urlPath.startsWith("/__dev/reload")) {
    response.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      connection: "keep-alive",
    });
    response.write("retry: 1000\n\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }

  if (urlPath.startsWith("/__dev/client.js")) {
    response.writeHead(200, {
      "content-type": "text/javascript; charset=utf-8",
      "cache-control": "no-store",
    });
    response.end(liveReloadClient);
    return;
  }

  const filePath = await resolveFile(urlPath);
  if (!filePath) {
    sendNotFound(response, urlPath);
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const file = await readFile(filePath);

  // Injeta o live reload apenas nas paginas servidas em desenvolvimento.
  if (extension === ".html") {
    const html = file
      .toString("utf8")
      .replace("</body>", '  <script src="/__dev/client.js"></script>\n  </body>');
    response.writeHead(200, { "content-type": contentType, "cache-control": "no-store" });
    response.end(html);
    return;
  }

  response.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store",
    "content-length": file.length,
  });
  response.end(file);
}

function startWatching() {
  let timer;
  watch(root, { recursive: true }, (_event, filename) => {
    if (!filename) {
      return;
    }

    const normalized = String(filename).split(sep).join("/");
    if (ignoredPaths.some((ignored) => normalized.startsWith(`${ignored}/`) || normalized === ignored)) {
      return;
    }

    // Agrupa gravacoes em rajada (salvar um arquivo dispara varios eventos).
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`  alterado: ${normalized} - recarregando`);
      broadcastReload();
    }, 80);
  });
}

function listen(port, attemptsLeft = 10) {
  const server = createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error(error);
      if (!response.headersSent) {
        response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      }
      response.end("Erro interno do servidor de desenvolvimento.");
    });
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      console.log(`  porta ${port} ocupada, tentando ${port + 1}...`);
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    console.error(error.message);
    process.exit(1);
  });

  server.listen(port, host, () => {
    console.log("");
    console.log("  Villa Burger - servidor de desenvolvimento");
    console.log(`  http://${host}:${port}`);
    console.log("  live reload ativo - Ctrl+C para parar");
    console.log("");
    startWatching();
  });
}

listen(requestedPort);
