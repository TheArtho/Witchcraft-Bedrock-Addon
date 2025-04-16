import "./save/saveData";
import "./items/index";
import "./events/customEventHandler";
import { initMod } from "./core/init";
import "./core/initCommands";
import { GameMode, world } from "@minecraft/server";
import { playerData } from "./player/PlayerData";
world.beforeEvents.playerGameModeChange.subscribe((event) => {
    if (event.toGameMode == GameMode.survival || event.toGameMode == GameMode.adventure) {
        playerData.get(event.player.id)?.updateManaUi();
    }
});
initMod();
