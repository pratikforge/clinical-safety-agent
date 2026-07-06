import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..", "..");
const bridgeScript = resolve(repoRoot, "backend", "scripts", "agentToolBridge.js");

export function callBackendBridge(action, payload) {
  const completed = spawnSync("node", [bridgeScript], {
    cwd: repoRoot,
    input: JSON.stringify({ action, payload }),
    encoding: "utf8",
    timeout: 20000
  });

  if (completed.error) {
    throw completed.error;
  }
  if (completed.status !== 0) {
    throw new Error(completed.stderr || completed.stdout || "Backend bridge failed.");
  }
  const result = JSON.parse(completed.stdout);
  if (result.status !== "success") {
    throw new Error(result.error || "Backend bridge failed.");
  }
  return result.data;
}
