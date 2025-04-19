// core/SaveLogic.ts
import { Player } from "@minecraft/server";
import { PlayerDataManager } from "../../player/PlayerDataManager";
import { playerData } from "../../player/PlayerData";

const FORCE_RESET_DATA = true;

export function savePlayerData(player: Player) {
    if (player && playerData.has(player.id)) {
        PlayerDataManager.save(player, playerData.get(player.id)!);
    }
}

export function loadPlayerData(player: Player) {
    const existing = player.getDynamicProperty(PlayerDataManager.DATA_KEY);
    if (!existing || FORCE_RESET_DATA) {
        PlayerDataManager.reset(player);
        console.log(`[Witchcraft] Reset player data for ${player.name}`);
    }

    if (!playerData.has(player.id)) {
        playerData.set(player.id, PlayerDataManager.load(player));
        console.log(`[Witchcraft] PlayerData loaded for ${player.name}`);
    }
}
