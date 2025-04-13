import { system, world } from "@minecraft/server";
import { cleanupLumosEntities } from "./modules/lumosInit";
let hasInit = false;
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
        // Lumos entity cleanup
        cleanupLumosEntities(players);
    }, 5);
}
