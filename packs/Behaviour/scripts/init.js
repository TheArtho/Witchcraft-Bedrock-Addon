import { system, world } from "@minecraft/server";
import { cleanupLumosEntities } from "./modules/lumosCleaner";
let hasInit = false;
// Check for cleaning light entities on server when a player joins
world.afterEvents.playerJoin.subscribe(() => {
    if (!hasInit)
        return;
    cleanupLumosEntities();
});
export function initMod() {
    if (hasInit)
        return;
    hasInit = true;
    console.log("[Witchcraft] Waiting for player to connect...");
    // Wait for at least one player
    const waitForPlayers = system.runInterval(() => {
        const players = world.getPlayers();
        if (players.length === 0)
            return;
        system.clearRun(waitForPlayers);
        // Lumos entity cleanup on first join
        cleanupLumosEntities();
    }, 5);
}
