import { system, world } from "@minecraft/server";
import { cleanupLumosEntities } from "../modules/lumosCleaner";
import { LoadPlayerData } from "../save/saveData";
let hasInit = false;
// Check for cleaning light entities on server when a player joins
world.afterEvents.playerJoin.subscribe(() => {
    if (!hasInit)
        return;
    let interval = system.runInterval(() => {
        const players = world.getPlayers();
        if (players.length === 0)
            return;
        system.clearRun(interval); // stop directly the interval
        cleanupLumosEntities();
    }); // Wait for one player in the chunk to start this function
});
export function init() {
    if (hasInit)
        return;
    hasInit = true;
    // This part is for instant initialization code
    system.run(() => {
        world.getPlayers().forEach((player) => {
            LoadPlayerData(player);
        });
    });
    console.log("[Witchcraft] Waiting for player to connect...");
    // Wait for at least one player to run this part of the code
    const waitForPlayers = system.runInterval(() => {
        const players = world.getPlayers();
        if (players.length === 0)
            return;
        system.clearRun(waitForPlayers);
        // Lumos entity cleanup on first join
        cleanupLumosEntities();
    }, 5);
}
