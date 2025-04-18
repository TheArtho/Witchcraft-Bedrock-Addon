const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const config = require("./buildconfig.json");

const modName = config.name || "MyMod";

const behaviorPack = path.join(__dirname, "packs", "Behaviour");
const resourcePack = path.join(__dirname, "packs", "Resource");
const uiSourceDir = path.join(__dirname, "ui");
const uiTargetDir = path.join(resourcePack, "ui");

const mcDir = path.join(
    process.env.LOCALAPPDATA,
    "Packages",
    "Microsoft.MinecraftUWP_8wekyb3d8bbwe",
    "LocalState",
    "games",
    "com.mojang"
);

const targetBP = path.join(mcDir, "development_behavior_packs", `${modName} BP`);
const targetRP = path.join(mcDir, "development_resource_packs", `${modName} RP`);

let serverBP = null;
let serverRP = null;

const privateConfigPath = path.join(__dirname, "private_config.json");
const privateConfigExists = fs.existsSync(privateConfigPath);
if (privateConfigExists) {
    const privateConfig = require(privateConfigPath);
    const serverPath = privateConfig.server_path;
    serverBP = path.join(serverPath, "development_behavior_packs", `${modName} BP`);
    serverRP = path.join(serverPath, "development_resource_packs", `${modName} RP`);
}

const shouldClean = process.argv.includes("--clean");

async function cleanAndCopy(src, dest, name) {
    if (shouldClean) {
        console.log(`[Clean] Suppression du dossier : ${dest}`);
        await fs.emptyDir(dest);
    }

    console.log(`[Build] Copie du ${name} vers ${dest}`);
    await fs.ensureDir(dest);
    await fs.copy(src, dest, { overwrite: true });
    console.log(`[Build] Copie du ${name} terminé.`);
}

async function compileJsoncToJson(srcDir, destDir) {
    const stripJsonComments = (await import("strip-json-comments")).default;

    const entries = await fs.readdir(srcDir);
    await fs.ensureDir(destDir);

    for (const entry of entries) {
        const srcPath = path.join(srcDir, entry);
        const destPath = path.join(destDir, entry.replace(/\.jsonc$/, ".json"));
        const stat = await fs.stat(srcPath);

        if (stat.isDirectory()) {
            await compileJsoncToJson(srcPath, path.join(destDir, entry));
        } else if (entry.endsWith(".jsonc")) {
            const raw = await fs.readFile(srcPath, "utf-8");
            const json = stripJsonComments(raw);
            await fs.writeFile(destPath, json, "utf-8");
        } else {
            await fs.copy(srcPath, path.join(destDir, entry));
        }
    }
}

(async () => {
    try {
        if (shouldClean) {
            const outDir = path.join(__dirname, "packs", "Behaviour", "scripts");
            console.log("[Clean] Vidage du dossier de compilation TypeScript...");
            await fs.emptyDir(outDir);
        }

        console.log("[Compiler] Compilation TypeScript...");
        execSync("npx tsc", { stdio: "inherit" });
        console.log("[Compiler] Compilation TypeScript terminée.");

        console.log("[UI] Compilation des fichiers .jsonc...");
        await compileJsoncToJson(uiSourceDir, uiTargetDir);

        console.log("[Minecraft Client] Copie des packs...");
        await cleanAndCopy(behaviorPack, targetBP, "Behavior Pack (client)");
        await cleanAndCopy(resourcePack, targetRP, "Resource Pack (client)");

        if (privateConfigExists) {
            console.log("[Server] Copie des packs vers le serveur dédié...");
            await cleanAndCopy(behaviorPack, serverBP, "Behavior Pack (serveur)");
            await cleanAndCopy(resourcePack, serverRP, "Resource Pack (serveur)");
        } else {
            console.warn("⚠️  Fichier private_config.json introuvable, déploiement serveur ignoré.");
        }

        console.log("✅ Build terminé.");
    } catch (err) {
        console.error("❌ Erreur pendant la compilation ou la copie :", err);
    }
})();
