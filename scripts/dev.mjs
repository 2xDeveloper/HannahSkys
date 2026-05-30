/**
 * Stable local dev: free port 3000, optional cache reset, start Next.js with Turbopack.
 * Usage: node scripts/dev.mjs [--clean]
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = process.env.PORT ?? "3000";
const clean = process.argv.includes("--clean");

function killPortWindows(p) {
  return new Promise((resolve) => {
    const ps = spawn(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Get-NetTCPConnection -LocalPort ${p} -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`,
      ],
      { stdio: "ignore", shell: false },
    );
    ps.on("close", () => resolve());
    ps.on("error", () => resolve());
  });
}

async function main() {
  console.log(`\n→ Freeing port ${port}…`);
  await killPortWindows(port);
  await new Promise((r) => setTimeout(r, 800));

  if (clean) {
    const nextDir = path.join(root, ".next");
    if (fs.existsSync(nextDir)) {
      console.log("→ Clearing .next cache…");
      fs.rmSync(nextDir, { recursive: true, force: true });
    }
  }

  console.log(`→ Starting dev server on http://localhost:${port}`);
  console.log("  Save any file — browser updates automatically.\n");
  console.log("  If you see errors, stop (Ctrl+C) and run: npm run dev:reset\n");

  const devArgs = ["next", "dev", "--port", port, "--hostname", "0.0.0.0"];
  // Turbopack on Windows can corrupt .next cache during hot reload — use webpack dev
  if (process.platform !== "win32") {
    devArgs.splice(2, 0, "--turbo");
  }

  const child = spawn("npx", devArgs, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

main();
