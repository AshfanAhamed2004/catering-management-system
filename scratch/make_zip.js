const { execSync, spawnSync } = require("child_process");
const fs = require("fs");

const src = "c:\\Users\\lenovo\\Documents\\GitHub\\catering-management-system";
const dest = "c:\\Users\\lenovo\\Documents\\GitHub\\catering-management-system-share.zip";
const tmp = "c:\\Users\\lenovo\\Documents\\GitHub\\cms-temp";

// Clean temp
if(fs.existsSync(tmp)) {
  spawnSync("cmd", ["/c", `rmdir /s /q "${tmp}"`]);
}
fs.mkdirSync(tmp, {recursive: true});

// Robocopy exit code 1 = files copied fine (not an error in robocopy!)
const result = spawnSync("robocopy", [src, tmp, "/e", "/xd", "node_modules", "target", ".git", ".gemini", "scratch"], {stdio:"inherit"});
console.log("Robocopy status:", result.status);

// Create zip
if(fs.existsSync(dest)) fs.unlinkSync(dest);
const zipResult = spawnSync("powershell", ["-command", `Compress-Archive -Path '${tmp}' -DestinationPath '${dest}' -CompressionLevel Optimal`], {stdio:"inherit"});
console.log("Zip status:", zipResult.status);

// Clean temp
spawnSync("cmd", ["/c", `rmdir /s /q "${tmp}"`]);
console.log("Done! Zip created at:", dest);
