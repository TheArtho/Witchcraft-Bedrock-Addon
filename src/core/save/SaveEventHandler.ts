// core/SaveEventHandler.ts
import { system, world } from "@minecraft/server";
import { loadPlayerData, savePlayerData } from "./SaveLogic";

export class SaveEventHandler {
    static register(): void {
        // When a player joins
        world.afterEvents.playerJoin.subscribe(({ playerId }) => {
            const player = world.getPlayers().find(p => p.id === playerId);
            const interval = system.runInterval(() => {
                if (player) {
                    loadPlayerData(player);
                    system.clearRun(interval);
                }
            });
        });

        // When a player leaves
        world.beforeEvents.playerLeave.subscribe(({ player }) => {
            savePlayerData(player);
            console.log(`[Witchcraft] Saved data for ${player.name}`);
        });

        // Automatic save
        system.runInterval(() => {
            for (const player of world.getPlayers()) {
                savePlayerData(player);
            }
        }, 200); // 200 ticks = 10 seconds
    }
}
