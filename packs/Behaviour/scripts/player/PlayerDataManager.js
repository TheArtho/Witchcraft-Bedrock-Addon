import { PlayerData } from "./PlayerData";
export class PlayerDataManager {
    static load(player) {
        const raw = player.getDynamicProperty(this.DATA_KEY);
        try {
            return new PlayerData(player.id, JSON.parse(raw));
        }
        catch {
            console.warn(`[Witchcraft] Failed to parse player data for ${player.name}`);
        }
        return new PlayerData(player.id);
    }
    static save(player, data) {
        try {
            player.setDynamicProperty(this.DATA_KEY, JSON.stringify(data));
        }
        catch (e) {
            console.warn(`[Witchcraft] Failed to save player data for ${player.name}: ${e}`);
        }
    }
    static reset(player) {
        try {
            player.setDynamicProperty(this.DATA_KEY, JSON.stringify(new PlayerData(player.id)));
        }
        catch (e) {
            console.warn(`[Witchcraft] Failed to reset player data for ${player.name}: ${e}`);
        }
    }
}
PlayerDataManager.DATA_KEY = "witchcraft:player_data";
