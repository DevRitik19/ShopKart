import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("Building frontend...");
const frontendDir = path.resolve("front-end", "vite-project");

execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });

const srcDist = path.join(frontendDir, "dist");
const targetDist = path.resolve("dist");

if (fs.existsSync(targetDist)) {
  fs.rmSync(targetDist, { recursive: true, force: true });
}

fs.cpSync(srcDist, targetDist, { recursive: true });
console.log("Frontend build copied to root dist directory successfully.");
