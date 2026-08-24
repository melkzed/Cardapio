// Validacao rapida do projeto, multiplataforma (substitui o bloco de PowerShell
// do README): confere a sintaxe de todo o JavaScript e se os JSON de dados
// carregam. Roda com `npm run check`, sem dependencias.

import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const jsFolders = ["js", "scripts"];
const dataFiles = ["data/products.json", "data/addons.json"];

const failures = [];

async function checkSyntax(relativePath) {
  try {
    await run(process.execPath, ["--check", join(root, relativePath)]);
    console.log(`  ok   ${relativePath}`);
  } catch (error) {
    failures.push(relativePath);
    console.error(`  FALHA ${relativePath}`);
    console.error(String(error.stderr || error.message).trim());
  }
}

async function checkJson(relativePath) {
  try {
    const parsed = JSON.parse(await readFile(join(root, relativePath), "utf8"));
    const size = Array.isArray(parsed) ? `${parsed.length} itens` : "objeto";
    console.log(`  ok   ${relativePath} (${size})`);
  } catch (error) {
    failures.push(relativePath);
    console.error(`  FALHA ${relativePath}: ${error.message}`);
  }
}

console.log("\nJavaScript:");
await checkSyntax("script.js");
for (const folder of jsFolders) {
  const entries = await readdir(join(root, folder));
  for (const entry of entries.sort()) {
    if (entry.endsWith(".js") || entry.endsWith(".mjs")) {
      await checkSyntax(`${folder}/${entry}`);
    }
  }
}

console.log("\nJSON:");
for (const dataFile of dataFiles) {
  await checkJson(dataFile);
}

if (failures.length) {
  console.error(`\n${failures.length} arquivo(s) com problema.\n`);
  process.exit(1);
}

console.log("\nTudo validado.\n");
