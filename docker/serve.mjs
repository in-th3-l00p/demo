import { createApp } from "./dist/app.js";
import { getDb, closeDb } from "./dist/db/connection.js";
import { runMigrations } from "./dist/db/migrations.js";
import { config } from "./dist/config/index.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = getDb();
runMigrations(db);

const app = createApp(db);

// Serve the built web app
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// SPA fallback — serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

const port = config.port;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Panoplia server running on port ${port}`);
});

function shutdown() {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
