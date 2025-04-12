const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const config = require("./buildconfig.json");
const modName = config.name || "MyMod";

// Dossiers sources
const behaviorPack = path.join(__dirname, "packs", "Behaviour");
const resourcePack = path.join(__dirname, "packs", "Resource");

// Dossiers cibles de Minecraft Bedrock
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

// Vérifie si le flag --clean est passé
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

(async () => {
    try {
        if (shouldClean) {
            const outDir = path.join(__dirname, "packs", "Behaviour", "scripts");

            console.log("[Clean] Vidage du dossier de compilation TypeScript...");
            await fs.emptyDir(outDir);
        }
        console.log("[Compiler] Compilation TypeScript...");
        execSync("npx tsc", { stdio: "inherit" });
        console.log("[Compiler] Compilation Typescript terminée.");

        await cleanAndCopy(behaviorPack, targetBP, "Behavior Pack");
        await cleanAndCopy(resourcePack, targetRP, "Resource Pack");

        console.log("Build terminé.");
    } catch (err) {
        console.error("Erreur pendant la compilation ou la copie :", err);
    }
})();
