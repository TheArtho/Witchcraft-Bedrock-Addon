import { system, world } from "@minecraft/server";
import { PlayerDataManager } from "../player/PlayerDataManager";
import { playerData } from "../player/PlayerData";
const FORCE_RESET_DATA = false;
function SavePlayerData(player) {
    if (player && playerData.has(player.id)) {
        PlayerDataManager.save(player, playerData.get(player.id));
    }
}
export function LoadPlayerData(player) {
    const existing = player.getDynamicProperty(PlayerDataManager.DATA_KEY);
    if (!existing || FORCE_RESET_DATA) {
        PlayerDataManager.reset(player);
        console.log(`[Witchcraft] Reset player data for ${player.name}`);
    }
    if (!playerData.has(player.id)) {
        playerData.set(player.id, PlayerDataManager.load(player));
        console.log(`[Witchcraft] PlayerData loaded for ${player.name}`);
    }
    console.log(`selected spell is ${playerData?.get(player.id)?.selectedSpell}`);
}
// Loads data when player joins
world.afterEvents.playerJoin.subscribe((event) => {
    const id = event.playerId;
    const interval = system.runInterval(() => {
        const player = world.getPlayers().find(p => p.id === id);
        if (!player)
            return;
        LoadPlayerData(player);
        system.clearRun(interval); // stop checking
    });
});
// Save when disconnecting
world.beforeEvents.playerLeave.subscribe(({ player }) => {
    SavePlayerData(player);
    console.log("Successfully saved player's data.");
});
// Save regularly the state of players
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        SavePlayerData(player);
    }
    // console.log("All player data has been saved.")
}, 200); // 200 ticks = 10 seconds
