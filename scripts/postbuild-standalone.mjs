#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextDir = path.join(root, ".next");
const standaloneDir = path.join(nextDir, "standalone");
const standaloneNextDir = path.join(standaloneDir, ".next");
const staticDir = path.join(nextDir, "static");
const publicDir = path.join(root, "public");

const log = (message) => {
  process.stdout.write(`[postbuild] ${message}\n`);
};

const safeCopy = (source, destination) => {
  if (!fs.existsSync(source)) {
    log(`skip missing: ${path.relative(root, source)}`);
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
  log(`copied ${path.relative(root, source)} -> ${path.relative(root, destination)}`);
};

if (!fs.existsSync(standaloneDir)) {
  log("standalone output not found; skipping asset copy");
  process.exit(0);
}

fs.mkdirSync(standaloneNextDir, { recursive: true });
safeCopy(staticDir, path.join(standaloneNextDir, "static"));
safeCopy(publicDir, path.join(standaloneDir, "public"));
