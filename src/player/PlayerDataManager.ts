import {Player} from "@minecraft/server";
import {PlayerData} from "./PlayerData";

export class PlayerDataManager {
    static DATA_KEY = "witchcraft:player_data";

    static load(player: Player): PlayerData {
        const raw = player.getDynamicProperty(this.DATA_KEY);
        try {
            return new PlayerData(JSON.parse(raw as string));
        } catch {
            console.warn(`[Witchcraft] Failed to parse player data for ${player.name}`);
        }
        return new PlayerData();
    }

    static save(player: Player, data: PlayerData) {
        try {
            player.setDynamicProperty(this.DATA_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn(`[Witchcraft] Failed to save player data for ${player.name}: ${e}`);
        }
    }

    static reset(player: Player) {
        try {
            player.setDynamicProperty(this.DATA_KEY, JSON.stringify(new PlayerData()));
        } catch (e) {
            console.warn(`[Witchcraft] Failed to save player data for ${player.name}: ${e}`);
        }
    }
}
