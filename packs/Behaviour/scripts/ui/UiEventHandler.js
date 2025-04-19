import { GameMode, world } from "@minecraft/server";
import { playerData } from "../player/PlayerData";
export class UiEventHandler {
    static register() {
        world.beforeEvents.playerGameModeChange.subscribe(this.handleGameModeChange);
    }
    static handleGameModeChange(event) {
        const allowedModes = [GameMode.survival, GameMode.adventure];
        if (allowedModes.includes(event.toGameMode)) {
            playerData.get(event.player.id)?.updateManaUi();
        }
    }
}
